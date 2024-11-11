import { Request, Response, NextFunction, RequestHandler } from 'express';
import { getCases, getAllCases, createCase, updateCase } from '../services/case_private.service';

export const createCaseHandler: RequestHandler = async (req: Request, res: Response) => {
    try {
        const {
            caseNumber,
            memberNumber,
            accusation,
            defendantQuestion,
            officerQuestion,
            victimQuestion,
            witnessQuestion,
            technicalReports,
            caseReferral,
            isReadyForDecision,
            actionOther,
            userId
        } = req.body;

        // Validate required fields
        if (!caseNumber || !memberNumber || !accusation) {
             res.status(400).json({ success: false, error: "caseNumber, memberNumber, and accusation are required." });
        }

        // Call service to create a new case
        const newCase = await createCase({
            caseNumber,
            memberNumber,
            accusation,
            defendantQuestion,
            officerQuestion,
            victimQuestion,
            witnessQuestion,
            technicalReports,
            caseReferral,
            isReadyForDecision,
            actionOther,
            userId
        });

        // Respond with success and the created case
        res.status(201).json({ success: true, case: newCase });

    } catch (error) {
        res.status(500).json({ success: false, error: (error as Error).message });
        // Catch and respond with error details
    }
};

export const editCase  : RequestHandler = async (req: Request, res: Response) => {
    try {
        const { id, caseNumber, memberNumber, accusation, defendantQuestion, officerQuestion, victimQuestion, witnessQuestion, technicalReports, caseReferral, isReadyForDecision, actionOther } = req.body;

        const updatedCase = await updateCase(id, {
            caseNumber,
            memberNumber,
            accusation,
            defendantQuestion,
            officerQuestion,
            victimQuestion,
            witnessQuestion,
            technicalReports,
            caseReferral,
            isReadyForDecision,
            actionOther
        });
         res.json({ success: true, case: updatedCase });
    } catch (error) {
         res.json({ success: false, error: (error as Error).message });
    }
};

export const fetchAllCases  : RequestHandler = async (req: Request, res: Response) =>  {
    try {
        const cases = await getAllCases();
         res.json({ success: true, cases });
    } catch (error) {
         res.json({ success: false, error: (error as Error).message });
    }
};

export const fetchCases : RequestHandler = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const cases = await getCases(id);
         res.json({ success: true, cases });
    } catch (error) {
         res.json({ success: false, error: (error as Error).message });
    }
};
