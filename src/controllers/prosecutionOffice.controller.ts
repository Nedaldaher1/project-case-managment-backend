import { ProsecutionOffice } from "../models";
import { Request, Response, RequestHandler } from 'express';

const getallOffices = async (req: Request, res: Response) => {
    try {
        const offices = await ProsecutionOffice.findAll()
        res.json({ success: true, offices });
    } catch (error) {
        res.json({ success: false, error: (error as Error).message });
    }
}

export { getallOffices };