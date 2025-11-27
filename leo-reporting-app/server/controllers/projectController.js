const Project = require('../models/Project');

exports.createProject = async (req, res) => {
    console.log('Received createProject request');
    console.log('Body:', req.body);
    console.log('Files:', req.files ? req.files.length : 0);
    try {
        const projectData = {
            userId: req.user.id,
            ...req.body
        };

        // Parse financial details if sent as string
        if (typeof projectData.financialDetails === 'string') {
            try {
                projectData.financialDetails = JSON.parse(projectData.financialDetails);
            } catch (e) {
                console.error('Error parsing financialDetails:', e);
                projectData.financialDetails = { income: [], expenses: [] };
            }
        }

        // Parse pdfTheme if sent as string
        if (typeof projectData.pdfTheme === 'string') {
            try {
                projectData.pdfTheme = JSON.parse(projectData.pdfTheme);
            } catch (e) {
                console.error('Error parsing pdfTheme:', e);
                projectData.pdfTheme = { headerColor: '#2980b9', textColor: '#000000', backgroundColor: '#ffffff' };
            }
        }

        // Handle file uploads
        if (req.files && req.files.length > 0) {
            // Handle project images
            const projectImages = req.files.filter(f => f.fieldname === 'projectImages');
            if (projectImages.length > 0) {
                projectData.projectImages = projectImages.map(f => f.filename);
            }

            // Handle duly filled report
            const reportFile = req.files.find(f => f.fieldname === 'dulyFilledProjectReport');
            if (reportFile) {
                projectData.dulyFilledProjectReport = reportFile.filename;
            }

            // Handle financial receipts
            // Map receipts to their respective entries in financialDetails
            req.files.forEach(file => {
                if (file.fieldname.startsWith('receipt_')) {
                    const parts = file.fieldname.split('_'); // e.g., receipt_income_0
                    if (parts.length === 3) {
                        const type = parts[1]; // income or expense
                        const index = parseInt(parts[2]);

                        if (projectData.financialDetails &&
                            projectData.financialDetails[type === 'income' ? 'income' : 'expenses'] &&
                            projectData.financialDetails[type === 'income' ? 'income' : 'expenses'][index]) {

                            projectData.financialDetails[type === 'income' ? 'income' : 'expenses'][index].receiptPath = file.filename;
                        }
                    }
                }
            });
        }

        const project = await Project.create(projectData);
        res.status(201).json({ message: 'Project created successfully', project });
    } catch (error) {
        console.error('Create project error:', error);
        res.status(500).json({ error: error.message });
    }
};

exports.getProjects = async (req, res) => {
    try {
        const projects = await Project.findAll({
            where: { userId: req.user.id },
            order: [['createdAt', 'DESC']]
        });
        res.json(projects);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getProject = async (req, res) => {
    try {
        const project = await Project.findOne({
            where: { id: req.params.id, userId: req.user.id }
        });
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }
        res.json(project);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateProject = async (req, res) => {
    try {
        const project = await Project.findOne({
            where: { id: req.params.id, userId: req.user.id }
        });

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        const updateData = { ...req.body };

        // Handle new file uploads
        if (req.files && req.files.length > 0) {
            const projectImages = req.files.filter(f => f.fieldname === 'projectImages');
            if (projectImages.length > 0) updateData.projectImages = [...project.projectImages, ...projectImages.map(f => f.filename)];

            const projectFlyers = req.files.filter(f => f.fieldname === 'projectFlyers');
            if (projectFlyers.length > 0) updateData.projectFlyers = [...project.projectFlyers, ...projectFlyers.map(f => f.filename)];

            const attendanceProof = req.files.filter(f => f.fieldname === 'attendanceProof');
            if (attendanceProof.length > 0) updateData.attendanceProof = [...project.attendanceProof, ...attendanceProof.map(f => f.filename)];

            const prProof = req.files.filter(f => f.fieldname === 'prProof');
            if (prProof.length > 0) updateData.prProof = [...project.prProof, ...prProof.map(f => f.filename)];

            const expenseProof = req.files.filter(f => f.fieldname === 'expenseProof');
            if (expenseProof.length > 0) updateData.expenseProof = [...project.expenseProof, ...expenseProof.map(f => f.filename)];

            // Handle receipts for update
            req.files.forEach(file => {
                if (file.fieldname.startsWith('receipt_')) {
                    const parts = file.fieldname.split('_');
                    if (parts.length === 3) {
                        const type = parts[1];
                        const index = parseInt(parts[2]);

                        if (typeof updateData.financialDetails === 'string') {
                            try {
                                updateData.financialDetails = JSON.parse(updateData.financialDetails);
                            } catch (e) {
                                updateData.financialDetails = { income: [], expenses: [] };
                            }
                        }

                        // Ensure structure exists
                        if (!updateData.financialDetails) updateData.financialDetails = { income: [], expenses: [] };
                        if (!updateData.financialDetails[type === 'income' ? 'income' : 'expenses']) updateData.financialDetails[type === 'income' ? 'income' : 'expenses'] = [];

                        // We might need to merge with existing financial details if not provided in body, 
                        // but usually the frontend sends the whole object.
                        // Assuming frontend sends the full financialDetails JSON.

                        if (updateData.financialDetails[type === 'income' ? 'income' : 'expenses'][index]) {
                            updateData.financialDetails[type === 'income' ? 'income' : 'expenses'][index].receiptPath = file.filename;
                        }
                    }
                }
            });
        }

        if (typeof updateData.financialDetails === 'string') {
            updateData.financialDetails = JSON.parse(updateData.financialDetails);
        }

        if (typeof updateData.pdfTheme === 'string') {
            updateData.pdfTheme = JSON.parse(updateData.pdfTheme);
        }

        await project.update(updateData);
        res.json({ message: 'Project updated successfully', project });
    } catch (error) {
        console.error('Update project error:', error);
        res.status(500).json({ error: error.message });
    }
};

exports.deleteProject = async (req, res) => {
    try {
        const project = await Project.findOne({
            where: { id: req.params.id, userId: req.user.id }
        });

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        await project.destroy();
        res.json({ message: 'Project deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
