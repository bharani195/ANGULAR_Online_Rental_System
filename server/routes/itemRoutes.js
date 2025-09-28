import express from 'express';
import { getAllItems, createItem } from '../controllers/itemController.js';

const router = express.Router();

router.get('/', getAllItems);
router.post('/', createItem);  // Admin only (middleware can be added later)

export default router;
