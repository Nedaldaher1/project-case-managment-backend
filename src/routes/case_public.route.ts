import express from 'express';
import { createCaseHandler, fetchAllCases, editCase } from '../controllers/case_public.controller';

const caseRouterPublic = express.Router();

caseRouterPublic.post('/cases/add', createCaseHandler);
caseRouterPublic.get('/cases', fetchAllCases);
caseRouterPublic.put('/cases/edit', editCase);

export default caseRouterPublic;