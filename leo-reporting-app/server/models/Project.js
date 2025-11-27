const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Project = sequelize.define('Project', {
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    // Basic Info
    projectTitle: {
        type: DataTypes.STRING,
        allowNull: false
    },
    projectCategories: {
        type: DataTypes.STRING,
        allowNull: true
    },
    venue: {
        type: DataTypes.STRING,
        allowNull: true
    },
    date: {
        type: DataTypes.DATE,
        allowNull: true
    },

    // Community Details
    benefitingCommunity: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    identifiedNeed: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    serviceOpportunity: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    modeOfDataCollection: {
        type: DataTypes.STRING,
        allowNull: true
    },

    // Project Leaders
    chairman: {
        type: DataTypes.STRING,
        allowNull: true
    },
    secretary: {
        type: DataTypes.STRING,
        allowNull: true
    },
    treasurer: {
        type: DataTypes.STRING,
        allowNull: true
    },

    // Project Metrics
    beneficiariesCount: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    projectValue: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    },
    modeOfFundsRaised: {
        type: DataTypes.STRING,
        allowNull: true
    },
    participants: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    serviceHours: {
        type: DataTypes.INTEGER,
        allowNull: true
    },

    // Project Description
    objective: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },

    // Financial Details (JSON)
    financialDetails: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: { income: [], expenses: [] }
    },

    // File Uploads (JSON array of URLs)
    projectImages: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: []
    },
    projectFlyers: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: []
    },
    attendanceProof: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: []
    },
    prProof: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: []
    },
    expenseProof: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: []
    }
});

module.exports = Project;
