import {Case_private} from '../models/index.js';
import {getCases,getAllCases,createCase,updateCase} from '../services/case_private.service.js';
import type { Context } from 'hono';

export const createCaseHandler = async (c: Context) => {
    try {
        const { caseNumber, memberNumber, accusation, defendantQuestion, officerQuestion, victimQuestion, witnessQuestion, technicalReports, caseReferral, isReadyForDecision,actionOther, userId } = await c.req.json();

        if (!caseNumber || !memberNumber || !accusation) {
            return c.json({ success: false, error: "caseNumber, memberNumber, and accusation are required." });
        }

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
        return c.json({ success: true, case: newCase });
    } catch (error) {
        return c.json({ success: false, error: (error as Error).message });
    }
};

export const editCase = async (c: Context) => {
    try {
        const { id, caseNumber, memberNumber, accusation, defendantQuestion, officerQuestion, victimQuestion, witnessQuestion, technicalReports, caseReferral, isReadyForDecision ,actionOther } = await c.req.json();
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
        return c.json({ success: true, case: updatedCase });
    } catch (error) {
        return c.json({ success: false, error: (error as Error).message });
    }
};

export const fetchAllCases = async (c: Context) => {
    try {
        const cases = await getAllCases();
        return c.json({ success: true, cases });
    } catch (error) {
        return c.json({ success: false, error: (error as Error).message });
    }
};

export const fetchCases = async (c: Context) => {
    try {
        const { id } = c.req.param();
        const cases = await getCases(id);
        return c.json({ success: true, cases });
    } catch (error) {
        return c.json({ success: false, error: (error as Error).message });
    }
};
