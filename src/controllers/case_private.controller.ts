    // controllers/caseController.ts
    import { Request, Response, NextFunction, RequestHandler } from 'express';
    import { 
        getCases,
        getAllCases,
        createCase,
        updateCase
    } from '../services/case_private.service';

    const parseQueryParams = (query: any) => ({
        page: parseInt(query.page) || 1,
        pageSize: parseInt(query.pageSize) || 10,
        memberNumber: query.memberNumber,
        isReadyForDecision: query.isReadyForDecision === 'true' ? true : undefined
    });

    export const createCaseHandler: RequestHandler = async (req, res, next) => {
        try {
            const newCase = await createCase(req.body);
            res.status(201).json({
                success: true,
                message: "تم إضافة القضية بنجاح",
                data: newCase
            });
        } catch (error) {
            console.log(error);
            next(error);
        }
    };

    export const editCase: RequestHandler = async (req, res, next) => {
        try {
            const updatedCase = await updateCase(req.body.id, req.body);
            res.status(200).json({
                success: true,
                message: "تم تحديث القضية بنجاح",
                data: updatedCase
            });
        } catch (error) {
            next(error);
        }
    };

    export const fetchAllCases: RequestHandler = async (req, res, next) => {
        try {
            const options = parseQueryParams(req.query);
            const result = await getAllCases(options);
            
            res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
            res.setHeader('Pragma', 'no-cache');
            
            res.status(200).json({
                success: true,
                data: result.data,
                pagination: result.pagination
            });
        } catch (error) {
            next(error);
        }
    };

    export const fetchCases: RequestHandler = async (req, res, next) => {
        try {
            const { id } = req.params;
            const options = parseQueryParams(req.query);
            const result = await getCases(id, options);

            if (result.data.length === 0) {
                res.status(404).json({
                    success: false,
                    error: "لم يتم العثور على قضايا"
                });
                return;
            }

            res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
            res.setHeader('Pragma', 'no-cache');
            
            res.status(200).json({
                success: true,
                data: result.data,
                pagination: result.pagination
            });
        } catch (error) {
            next(error);
        }
    };