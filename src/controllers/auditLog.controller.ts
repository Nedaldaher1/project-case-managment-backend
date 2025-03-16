import { Request, Response } from 'express';
import { getLogsByTable, getLogsByTableRecordAndUser } from '../utils/auditLogger';

// دالة التحكم لجلب سجلات الـ log لجدول معين
export const getLogsByTableController = async (req: Request, res: Response): Promise<void> => {
  const { tableName } = req.params;

  if (!tableName) {
    res.status(400).json({ message: 'يجب تقديم اسم الجدول (tableName)' });
    return;
  }

  try {
    const logs = await getLogsByTable(tableName);
    res.status(200).json({ data: logs });
  } catch (error) {
    console.error('فشل جلب سجلات الـ log:', error);
    res.status(500).json({ message: 'فشل جلب سجلات الـ log' });
  }
};

// دالة التحكم لجلب سجلات الـ log بناءً على tableName و recordId و userId
export const getLogsByTableRecordAndUserController = async (req: Request, res: Response): Promise<void> => {
  const { tableName, recordId, userId } = req.params;

  if (!tableName || !recordId || !userId) {
    res.status(400).json({ message: 'يجب تقديم tableName و recordId و userId' });
    return;
  }

  try {
    const logs = await getLogsByTableRecordAndUser(tableName, parseInt(recordId, 10), userId as `${string}-${string}-${string}-${string}-${string}`);
    res.status(200).json({ data: logs });
  } catch (error) {
    console.error('فشل جلب سجلات الـ log:', error);
    res.status(500).json({ message: 'فشل جلب سجلات الـ log' });
  }
};