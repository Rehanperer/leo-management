const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const FinancialReport = sequelize.define('FinancialReport', {
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    month: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    year: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    incomeEntries: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: []
    },
    expenseEntries: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: []
    },
    totalIncome: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 0
    },
    totalExpense: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 0
    },
    balance: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 0
    }
});

module.exports = FinancialReport;
