const Project = require('../models/Project');

exports.createProject = async (req, res) => {
    try {
        const projectData = {
            userId: req.user.id,
            ...req.body
        };

        // Handle file uploads
        if (req.files) {
            if (req.files.projectImages) projectData.projectImages = req.files.projectImages.map(f => f.filename);
            if (req.files.projectFlyers) projectData.projectFlyers = req.files.projectFlyers.map(f => f.filename);
            if (req.files.attendanceProof) projectData.attendanceProof = req.files.attendanceProof.map(f => f.filename);
            if (req.files.prProof) projectData.prProof = req.files.prProof.map(f => f.filename);
            if (req.files.expenseProof) projectData.expenseProof = req.files.expenseProof.map(f => f.filename);
        }

        // Parse financial details if sent as string
        if (typeof projectData.financialDetails === 'string') {
            projectData.financialDetails = JSON.parse(projectData.financialDetails);
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
        if (req.files) {
            if (req.files.projectImages) updateData.projectImages = [...project.projectImages, ...req.files.projectImages.map(f => f.filename)];
            if (req.files.projectFlyers) updateData.projectFlyers = [...project.projectFlyers, ...req.files.projectFlyers.map(f => f.filename)];
            if (req.files.attendanceProof) updateData.attendanceProof = [...project.attendanceProof, ...req.files.attendanceProof.map(f => f.filename)];
            if (req.files.prProof) updateData.prProof = [...project.prProof, ...req.files.prProof.map(f => f.filename)];
            if (req.files.expenseProof) updateData.expenseProof = [...project.expenseProof, ...req.files.expenseProof.map(f => f.filename)];
        }

        if (typeof updateData.financialDetails === 'string') {
            updateData.financialDetails = JSON.parse(updateData.financialDetails);
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
