// src/controllers/case.controller.ts
import type { Context } from 'hono';
import { createCase, getAllCases,updateCase } from '../services/case.service.js';

export const createCaseHandler = async (c: Context) => {
    const { caseNumber, defendantName, imprisonmentDuration, startDate,member_location,member_number,type_case } = await c.req.json();
    const newCase = await createCase({
        caseNumber,
        defendantName,
        imprisonmentDuration,
        startDate,
        member_location,
        member_number,
        type_case
        
    });
    return c.json({ success: true, case: newCase });
};

export const editCase = async (c: Context) => {
    try {
        const { id, caseNumber, defendantName, imprisonmentDuration, startDate,member_location,member_number,type_case } = await c.req.json();
        
        const updatedCase = await updateCase({
            id,
            caseNumber,
            defendantName,
            imprisonmentDuration,
            startDate,
            member_location,
            member_number,
            type_case
        
        });
        return c.json({ success: true, case: updatedCase });

    } catch (error) {
        console.log(error)
        return c.json({ success: false, error: (error as Error).message });
        
    }
}

export const fetchAllCases = async (c: Context) => {

    try {
     const cases = await getAllCases()   
        return c.json({ success: true, cases });
    } catch (error) {
        return c.json({ success: false, error: (error as Error).message });
    }
}