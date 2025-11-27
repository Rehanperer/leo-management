const express = require('express');
const router = express.Router();
const financialController = require('../controllers/financialController');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.post('/', financialController.createFinancialReport);
router.get('/', financialController.getFinancialReports);
router.get('/:id', financialController.getFinancialReport);
router.put('/:id', financialController.updateFinancialReport);
router.delete('/:id', financialController.deleteFinancialReport);

module.exports = router;
