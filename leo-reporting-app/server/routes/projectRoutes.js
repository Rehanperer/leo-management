const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const authMiddleware = require('../middleware/auth');
const upload = require('../config/multer');

// All routes require authentication
router.use(authMiddleware);

// Define upload fields
const uploadFields = upload.fields([
    { name: 'projectImages', maxCount: 10 },
    { name: 'projectFlyers', maxCount: 5 },
    { name: 'attendanceProof', maxCount: 5 },
    { name: 'prProof', maxCount: 10 },
    { name: 'expenseProof', maxCount: 10 }
]);

router.post('/', uploadFields, projectController.createProject);
router.get('/', projectController.getProjects);
router.get('/:id', projectController.getProject);
router.put('/:id', uploadFields, projectController.updateProject);
router.delete('/:id', projectController.deleteProject);

module.exports = router;
