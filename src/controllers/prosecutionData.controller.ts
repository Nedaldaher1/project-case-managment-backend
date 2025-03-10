// src/controllers/prosecutionData.controller.ts
import { Request, Response } from 'express';
import ProsecutionData from '../models/prosecutionData.model';
import { Op ,sequelize } from '../config/db';
const createProsecutionData = async (req: Request, res: Response): Promise<void> => {
    try {
        const { serialNumber, itemNumber, charge, seizureStatement, disposalOfSeizure, totalNumber, roomNumber, referenceNumber, shelfNumber, prosecutionOfficeId, numberCase,prosecutionDetentionDecision,finalCourtJudgment,year,statusEvidence , typeCaseTotalNumber,typeCaseNumber } = req.body;
        const newProsecutionData = await ProsecutionData.create({
            serialNumber,
            itemNumber,
            charge,
            seizureStatement,
            disposalOfSeizure,
            totalNumber,
            roomNumber,
            referenceNumber,
            shelfNumber,
            prosecutionOfficeId,
            numberCase,
            prosecutionDetentionDecision,
            finalCourtJudgment,
            year,
            statusEvidence,
            typeCaseTotalNumber,
            typeCaseNumber
        });
        res.json({ success: true, prosecutionData: newProsecutionData });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, error: (error as Error).message });
    }
};

const updateProsecutionData = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const updatedData = req.body;

        const [affectedCount, updatedRecords] = await ProsecutionData.update(
            updatedData,
            {
                where: { id },
                returning: true // إرجاع البيانات المحدثة
            }
        );

        if (affectedCount === 0) {
            res.status(404).json({ success: false, error: "لم يتم العثور على السجل" });
            return;
        }

        // إرجاع السجل المحدث مع جميع الحقول
        res.json({ 
            success: true, 
            updatedData: updatedRecords[0].get() 
        });

    } catch (error) {
        console.error('Error updating data:', error);
        res.status(500).json({ 
            success: false, 
            error: 'حدث خطأ أثناء التحديث' 
        });
    }
};

const getAllProsecutionData = async (req: Request, res: Response): Promise<void> => {
    try {
        const { 
            type, 
            page = 1, 
            limit = 20, 
            numberCase,  // بارامتر رقم القضية
            itemNumber   // بارامتر رقم الأشياء
        } = req.query;

        if (!type) {
            res.status(400).json({ success: false, error: "معرف النيابة مطلوب" });
            return;
        }

        const offset = (Number(page) - 1) * Number(limit);

        const whereClause: any = { prosecutionOfficeId: type };

        // فلترة رقم القضية
        if (numberCase) {
            whereClause.numberCase = Number(numberCase);

        }

        // فلترة رقم الأشياء
        if (itemNumber) {
            whereClause.itemNumber = Number(itemNumber);
        }

        const { count, rows } = await ProsecutionData.findAndCountAll({
            where: whereClause,
            limit: Number(limit),
            offset,
        });

        res.json({
            success: true,
            prosecutionData: rows,
            total: count,
            page: Number(page),
            totalPages: Math.ceil(count / Number(limit)),
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, error: (error as Error).message });
    }
};

export { createProsecutionData, updateProsecutionData, getAllProsecutionData };