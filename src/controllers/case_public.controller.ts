// src/controllers/case.controller.ts
import { createCase, getAllCases,updateCase } from '../services/case_public.service';
import { Request, Response, RequestHandler } from 'express';

export const createCaseHandler: RequestHandler = async (req: Request, res: Response) => {
    const { caseNumber, defendantName, imprisonmentDuration, startDate,member_location,member_number,type_case } =  req.body;
    const newCase = await createCase({
        caseNumber,
        defendantName,
        imprisonmentDuration,
        startDate,
        member_location,
        member_number,
        type_case
        
    });
     res.json({ success: true, case: newCase });
};

export const editCase : RequestHandler = async (req: Request, res: Response) => {
    try {
        const { id, caseNumber, defendantName, imprisonmentDuration, startDate,member_location,member_number,type_case } = req.body;
        
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
         res.json({ success: true, case: updatedCase });

    } catch (error) {
        console.log(error)
         res.json({ success: false, error: (error as Error).message });
        
    }
}

export const fetchAllCases : RequestHandler = async (req: Request, res: Response) => {

    try {
     const cases = await getAllCases()   
         res.json({ success: true, cases });
    } catch (error) {
         res.json({ success: false, error: (error as Error).message });
    }
}