// src/routes/case.route.ts
import { Hono } from 'hono';
import { createCaseHandler,fetchAllCases,editCase } from '../controllers/case_public.controller.js';

const caseRouterPublic = new Hono();

caseRouterPublic.post('/cases/add', createCaseHandler);
caseRouterPublic.get('/cases', fetchAllCases);
caseRouterPublic.put('/cases/edit', editCase);


export default caseRouterPublic;
