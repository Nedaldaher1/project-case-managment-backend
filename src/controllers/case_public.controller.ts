// src/controllers/case.controller.ts
import { createCase, getAllCases, updateCase } from '../services/case_public.service';
import { Request, Response, RequestHandler } from 'express';

export const createCaseHandler: RequestHandler = async (req, res, next) => {
    try {
        const { 
            caseNumber, 
            defendantName, 
            imprisonmentDuration, 
            startDate, 
            member_number, 
            type_case, 
            year, 
            officeNumber, 
            issuingDepartment,
            investigationID 
        } = req.body;

        const newCase = await createCase({
            caseNumber,
            defendantName,
            imprisonmentDuration,
            startDate,
            member_number,
            type_case,
            year,
            officeNumber,
            issuingDepartment,
            investigationID
        });

        res.status(201).json({ 
            success: true, 
            message: "تم إضافة القضية بنجاح",
            data: newCase 
        });

    } catch (error) {
        // معالجة أخطاء التكرار
        if ((error as any).message.includes('موجود مسبقا')) {
            res.status(400).json({
                success: false,
                message: (error as any).message
            });
            return next(); // إيقاف التنفيذ
        }
        
        // معالجة الأخطاء العامة
        console.error(error);
        next(error);
    }
};


export const editCase: RequestHandler = async (req: Request, res: Response) => {
    try {
        const { id, caseNumber, defendantName, imprisonmentDuration, startDate, member_location, member_number, type_case, year, officeNumber, issuingDepartment,investigationID } = req.body;

        const updatedCase = await updateCase({
            id,
            caseNumber,
            defendantName,
            imprisonmentDuration,
            startDate,
            member_location,
            member_number,
            type_case,
            year,
            officeNumber,
            issuingDepartment,
            investigationID

        });
        res.json({ success: true, case: updatedCase });

    } catch (error) {
        console.log(error)
        res.json({ success: false, error: (error as Error).message });

    }
}

export const fetchAllCases: RequestHandler = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const pageSize = parseInt(req.query.pageSize as string) || 20;

        const result = await getAllCases(page, pageSize);
        res.json({ success: true, ...result });
    } catch (error) {
        res.json({ success: false, error: (error as Error).message });
    }
};