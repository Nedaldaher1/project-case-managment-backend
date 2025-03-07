// src/controllers/prosecutionData.controller.ts
import { Request, Response } from 'express';
import ProsecutionData from '../models/prosecutionData.model';
import { Op ,sequelize } from '../config/db';
const createProsecutionData = async (req: Request, res: Response): Promise<void> => {
    try {
        const { serialNumber, itemNumber, charge, seizureStatement, disposalOfSeizure, totalNumber, roomNumber, referenceNumber, shelfNumber, prosecutionOfficeId, numberCase,prosecutionDetentionDecision,finalCourtJudgment } = req.body;
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
            finalCourtJudgment
        });
        res.json({ success: true, prosecutionData: newProsecutionData });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, error: (error as Error).message });
    }
};

const updateProsecutionData = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id, serialNumber, itemNumber, charge, seizureStatement, disposalOfSeizure, totalNumber, roomNumber, referenceNumber, shelfNumber, prosecutionOfficeId } = req.body;

        const updatedProsecutionData = await ProsecutionData.update({
            serialNumber,
            itemNumber,
            charge,
            seizureStatement,
            disposalOfSeizure,
            totalNumber,
            roomNumber,
            referenceNumber,
            shelfNumber,
            prosecutionOfficeId
        }, { where: { id } });
        res.json({ success: true, prosecutionData: updatedProsecutionData });
    } catch (error) {
        res.status(500).json({ success: false, error: (error as Error).message });
    }
};

const getAllProsecutionData = async (req: Request, res: Response): Promise<void> => {
    try {
        const { type, page = 1, limit = 20, search = '' } = req.query;

        if (!type) {
            res.status(400).json({ success: false, error: "معرف النيابة مطلوب" });
            return;
        }

        const offset = (Number(page) - 1) * Number(limit);

        const whereClause: any = { prosecutionOfficeId: type };

        if (search) {
            whereClause[Op.or] = [
                sequelize.where(sequelize.cast(sequelize.col('serialNumber'), 'text'), { [Op.like]: `%${search}%` }),
                sequelize.where(sequelize.cast(sequelize.col('itemNumber'), 'text'), { [Op.like]: `%${search}%` }),
                { charge: { [Op.like]: `%${search}%` } },
                { seizureStatement: { [Op.like]: `%${search}%` } },
                sequelize.where(sequelize.cast(sequelize.col('totalNumber'), 'text'), { [Op.like]: `%${search}%` }),
                sequelize.where(sequelize.cast(sequelize.col('roomNumber'), 'text'), { [Op.like]: `%${search}%` }),
                sequelize.where(sequelize.cast(sequelize.col('referenceNumber'), 'text'), { [Op.like]: `%${search}%` }),
                sequelize.where(sequelize.cast(sequelize.col('shelfNumber'), 'text'), { [Op.like]: `%${search}%` }),
                sequelize.where(sequelize.cast(sequelize.col('numberCase'), 'text'), { [Op.like]: `%${search}%` }),
                sequelize.where(sequelize.cast(sequelize.col('prosecutionDetentionDecision'), 'text'), { [Op.like]: `%${search}%` }),
                sequelize.where(sequelize.cast(sequelize.col('finalCourtJudgment'), 'text'), { [Op.like]: `%${search}%` }),
            ];
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