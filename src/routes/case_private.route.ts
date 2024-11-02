// src/routes/case.route.ts
import { Hono } from 'hono';
import { createCaseHandler,fetchAllCases,fetchCases,editCase } from '../controllers/case_private.controller.js';

const caseRouterPrivate = new Hono();

caseRouterPrivate.post('/cases/add', createCaseHandler);
caseRouterPrivate.get('/cases/:id', fetchCases);
caseRouterPrivate.get('/cases', fetchAllCases);
caseRouterPrivate.put('/cases/edit', editCase);


export default caseRouterPrivate;
