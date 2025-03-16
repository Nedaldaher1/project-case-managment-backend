import { UUID } from 'crypto';
import AuditLog from '../models/auditLog.model';

// دالة لتسجيل إجراء إنشاء
export const logCreateAction = async (
  tableName: string,
  recordId: number,
  newData: object,
  userId?: UUID,
  options?: { transaction?: any }
) => {
  try {
    await AuditLog.create({
      tableName,
      recordId,
      action: 'CREATE',
      newData,
      userId
    }, options);
  } catch (error) {
    console.error('فشل تسجيل الإجراء:', error);
  }
};

// دالة لتسجيل إجراء تحديث
export const logUpdateAction = async (
  tableName: string,
  recordId: number,
  oldData: object,
  newData: object,
  userId?: UUID
) => {
  await AuditLog.create({
    tableName,
    recordId,
    action: 'UPDATE',
    oldData,
    newData,
    userId
  });
};

// دالة لتسجيل إجراء حذف
export const logDeleteAction = async (
  tableName: string,
  recordId: number,
  oldData: object,
  userId?: UUID
) => {
  await AuditLog.create({
    tableName,
    recordId,
    action: 'DELETE',
    oldData,
    newData: {},
    userId
  });
};

// دالة لجلب سجلات الـ log لجدول معين
export const getLogsByTable = async (tableName: string) => {
  try {
    const logs = await AuditLog.findAll({
      where: { tableName },
      order: [['createdAt', 'DESC']] // ترتيب حسب التاريخ من الأحدث إلى الأقدم
    });
    return logs;
  } catch (error) {
    console.error('فشل جلب سجلات الـ log:', error);
    throw error;
  }
};

// دالة لجلب سجلات الـ log بناءً على tableName و recordId و userId
export const getLogsByTableRecordAndUser = async (
  tableName: string,
  recordId: number,
  userId: UUID
) => {
  try {
    const logs = await AuditLog.findAll({
      where: { tableName, recordId, userId },
      order: [['createdAt', 'DESC']] // ترتيب حسب التاريخ من الأحدث إلى الأقدم
    });
    return logs;
  } catch (error) {
    console.error('فشل جلب سجلات الـ log:', error);
    throw error;
  }
};