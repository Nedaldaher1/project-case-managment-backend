import express, { Request, Response } from 'express'; // استيراد express وأنواع Request و Response
import {
  getLogsByTableController,
  getLogsByTableRecordAndUserController,
} from '../controllers/auditLog.controller';
import AuditLog from '../models/auditLog.model';

const router = express.Router();

// GET /audit-logs/table/:tableName
router.get('/table/:tableName', getLogsByTableController);

// GET /audit-logs/table/:tableName/record/:recordId/user/:userId
router.get('/table/:tableName/record/:recordId/user/:userId', getLogsByTableRecordAndUserController);

router.get('/', async (req: Request, res: Response) => {
    try {
      const logs = await AuditLog.findAll({ order: [['createdAt', 'DESC']] });
      res.status(200).json({ data: logs });
    } catch (error) {
      console.error('فشل جلب سجلات الـ log:', error);
      res.status(500).json({ message: 'فشل جلب سجلات الـ log' });
    }
  });

export default router;