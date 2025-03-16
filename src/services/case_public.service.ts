// src/services/case.service.ts
import exp from 'constants';
import Case from '../models/case_public.model';

export const createCase = async (data: {
    caseNumber: string;
    defendantName: string;
    imprisonmentDuration: number;
    startDate: Date;
    member_number: string;
    type_case: string;
    year: string;
    officeNumber: string;
    issuingDepartment: string;
    investigationID: string;
}) => {
    // التحقق من التكرار
    const existingCase = await Case.findOne({
        where: {
            caseNumber: data.caseNumber,
            type_case: data.type_case,
            year: data.year
        }
    });

    if (existingCase) {
        throw new Error('رقم القضية موجود مسبقا');
    }

    // إنشاء القضية إذا لم يكن هناك تكرار
    return await Case.create(data);
};

export const getAllCases = async (page: number = 1, pageSize: number = 20) => {
    try {
        const offset = (page - 1) * pageSize;
        const { count, rows } = await Case.findAndCountAll({
            limit: pageSize,
            offset: offset,
            order: [['id', 'ASC']],
        });

        return {
            total: count,
            cases: rows,
            currentPage: page,
            totalPages: Math.ceil(count / pageSize),
        };
    } catch (error) {
        console.error("Error fetching cases:", error);
        throw new Error('Could not fetch cases');
    }
};
export const updateCase = async (data: { id: number; caseNumber?: string; defendantName?: string; imprisonmentDuration?: number; startDate?: Date; member_location?: string, member_number?: string; type_case?: string; year?: string; officeNumber?: string; issuingDepartment?: string; investigationID?:string }) => {
    try {
        const updatedCase = await Case.update(data, { where: { id: data.id } });
        return updatedCase;
    } catch (error) {
        console.error("Error updating case:", error);
        throw new Error('could not update case');
    }
}