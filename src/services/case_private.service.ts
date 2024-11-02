import type { UUID } from 'crypto';
import {Case_private} from '../models/index.js'

export const createCase = async (data: {
  caseNumber: string;
  memberNumber: string;
  accusation: string;
  defendantQuestion: string;
  officerQuestion: string;
  victimQuestion: string;
  witnessQuestion: string;
  technicalReports: string;
  caseReferral: string;
  isReadyForDecision: string;
  userId: UUID;
}) => {
  return await Case_private.create(data);
};

// دالة جلب القضايا كلها بناء على الصلاحية  رقم التتبع الخاص للمستخدم id
export const getCases = async (userId: string) => {
  return await Case_private.findAll({
    where: { userId },
  });
};

// دالة جلب القضايا كلها بحالة ان كان يحمل صلاحية admin او onwer
export const getAllCases = async () => {
  return await Case_private.findAll();
};

// دالة تعديل القضية

export const updateCase = async (id: string, data: {
  caseNumber: string;
  memberNumber: string;
  accusation: string;
  defendantQuestion: string;
  officerQuestion: string;
  victimQuestion: string;
  witnessQuestion: string;
  technicalReports: string;
  caseReferral: string;
  isReadyForDecision: string;
  
}) => {
  return await Case_private.update(data, {
    where: { id },
  });
};
