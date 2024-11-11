// src/routes/case.route.ts
import express from 'express';
import { createCaseHandler,fetchAllCases,fetchCases,editCase } from '../controllers/case_private.controller';

const router = express.Router();

router.post('/cases/add', createCaseHandler);
router.get('/cases/:id', fetchCases);
router.get('/cases', fetchAllCases);
router.put('/cases/edit', editCase);


export default router;
