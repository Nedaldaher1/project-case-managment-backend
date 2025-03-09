// src/routes/case.route.ts
import express from 'express';
import { createProsecutionData, updateProsecutionData, getAllProsecutionData} from '../controllers/prosecutionData.controller';
import { getallOffices } from '../controllers/prosecutionOffice.controller';

const router = express.Router();

router.post('/data/create', createProsecutionData);
router.put('/data/update/:id', updateProsecutionData);
router.get('/data/all', getAllProsecutionData);
router.get('/office/all', getallOffices);

export default router;
