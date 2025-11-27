const FinancialReport = require('../models/FinancialReport');

exports.createFinancialReport = async (req, res) => {
    try {
        const { month, year, incomeEntries, expenseEntries } = req.body;

        const totalIncome = incomeEntries.reduce((sum, entry) => sum + parseFloat(entry.amount || 0), 0);
        const totalExpense = expenseEntries.reduce((sum, entry) => sum + parseFloat(entry.amount || 0), 0);
        const balance = totalIncome - totalExpense;

        const report = await FinancialReport.create({
            userId: req.user.id,
            month,
            year,
            incomeEntries,
            expenseEntries,
            totalIncome,
            totalExpense,
            balance
        });

        res.status(201).json({ message: 'Financial report created successfully', report });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getFinancialReports = async (req, res) => {
    try {
        const reports = await FinancialReport.findAll({
            where: { userId: req.user.id },
            order: [['year', 'DESC'], ['month', 'DESC']]
        });
        res.json(reports);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getFinancialReport = async (req, res) => {
    try {
        const report = await FinancialReport.findOne({
            where: { id: req.params.id, userId: req.user.id }
        });
        if (!report) {
            return res.status(404).json({ message: 'Financial report not found' });
        }
        res.json(report);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateFinancialReport = async (req, res) => {
    try {
        const report = await FinancialReport.findOne({
            where: { id: req.params.id, userId: req.user.id }
        });

        if (!report) {
            return res.status(404).json({ message: 'Financial report not found' });
        }

        const { incomeEntries, expenseEntries } = req.body;

        const totalIncome = incomeEntries.reduce((sum, entry) => sum + parseFloat(entry.amount || 0), 0);
        const totalExpense = expenseEntries.reduce((sum, entry) => sum + parseFloat(entry.amount || 0), 0);
        const balance = totalIncome - totalExpense;

        await report.update({
            ...req.body,
            totalIncome,
            totalExpense,
            balance
        });

        res.json({ message: 'Financial report updated successfully', report });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteFinancialReport = async (req, res) => {
    try {
        const report = await FinancialReport.findOne({
            where: { id: req.params.id, userId: req.user.id }
        });

        if (!report) {
            return res.status(404).json({ message: 'Financial report not found' });
        }

        await report.destroy();
        res.json({ message: 'Financial report deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
