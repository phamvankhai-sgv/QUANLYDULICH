const express = require('express');
const router = express.Router();
const { getAllGuides, getGuideById, createGuide, updateGuide, deleteGuide } = require('../controllers/guideController');
const { verifyToken, isStaff } = require('../middleware/auth');

router.get('/', getAllGuides);
router.get('/:id', getGuideById);

router.post('/', verifyToken, isStaff, createGuide);
router.put('/:id', verifyToken, isStaff, updateGuide);
router.delete('/:id', verifyToken, isStaff, deleteGuide);

module.exports = router;
