// src/services/case.service.ts
import exp from 'constants';
import Case from '../models/case_public.model';

export const createCase = async (data: {
  caseNumber: string;
  defendantName: string;
  imprisonmentDuration: number;
  startDate: Date;
  member_location: string;
  member_number: string;
  type_case: string;
}) => {
  return await Case.create(data);
};

export const getAllCases = async () => {
    try {
        const cases = await Case.findAll();
        return cases;
    } catch (error) {
        console.error("Error fetching cases:", error);
        throw new Error('could not fetch cases');
    }
};

export const updateCase = async (data: { id: number; caseNumber?: string; defendantName?: string; imprisonmentDuration?: number; startDate?: Date; member_location?:string,member_number?:string; type_case?:string; }) => {
    try {
        const updatedCase = await Case.update(data, { where: { id: data.id } });
        return updatedCase;
    } catch (error) {
        console.error("Error updating case:", error);
        throw new Error('could not update case');
    }
}