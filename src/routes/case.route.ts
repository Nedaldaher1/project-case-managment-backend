// src/routes/case.route.ts
import { Hono } from 'hono';
import { createCaseHandler,fetchAllCases,editCase } from '../controllers/case.controller.js';

const caseRouter = new Hono();

caseRouter.post('/cases/add', createCaseHandler);
caseRouter.get('/cases', fetchAllCases);
caseRouter.put('/cases/edit', editCase);


export default caseRouter;
