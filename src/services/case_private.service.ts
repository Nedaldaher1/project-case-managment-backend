// services/case_private.service.ts
import type { UUID } from 'crypto';
import { Case_private } from '../models/index';

interface PaginationOptions {
    page: number;
    pageSize: number;
}

interface FilterOptions {
    userId?: string;
    memberNumber?: string;
    isReadyForDecision?: boolean;
}

interface PaginatedResult<T> {
    data: T[];
    pagination: {
        page: number;
        pageSize: number;
        total: number;
        totalPages: number;
    };
}

export const createCase = async (data: {
    caseNumber: string;
    memberNumber: string;
    accusedName: string;
    accusation: string;
    defendantQuestion: string;
    officerQuestion: string;
    victimQuestion: string;
    witnessQuestion: string;
    technicalReports: string;
    caseReferral: string;
    actionOther: string;
    userId: UUID;
    reportType: string;
    investigationID: string;
    year: number;
}) => {
    return await Case_private.create(data);
};

export const getCases = async (
    userId: string,
    options: PaginationOptions & FilterOptions
): Promise<PaginatedResult<InstanceType<typeof Case_private>>> => {
    const { page = 1, pageSize = 10 } = options;
    const offset = (page - 1) * pageSize;
    
    const whereClause: any = { userId };
    if (options.memberNumber) whereClause.memberNumber = options.memberNumber;
    if (options.isReadyForDecision !== undefined) {
        whereClause.isReadyForDecision = options.isReadyForDecision;
    }

    const { count: total, rows: data } = await Case_private.findAndCountAll({
        where: whereClause,
        offset,
        limit: pageSize,
        order: [['createdAt', 'DESC']]
    });

    return {
        data,
        pagination: {
            page,
            pageSize,
            total,
            totalPages: Math.ceil(total / pageSize)
        }
    };
};

export const getAllCases = async (
    options: PaginationOptions & FilterOptions
): Promise<PaginatedResult<InstanceType<typeof Case_private>>> => {
    const { page = 1, pageSize = 10 } = options;
    const offset = (page - 1) * pageSize;
    
    const whereClause: any = {};
    if (options.memberNumber) whereClause.memberNumber = options.memberNumber;
    if (options.isReadyForDecision !== undefined) {
        whereClause.isReadyForDecision = options.isReadyForDecision;
    }

    const { count: total, rows: data } = await Case_private.findAndCountAll({
        where: whereClause,
        offset,
        limit: pageSize,
        order: [['createdAt', 'DESC']]
    });

    return {
        data,
        pagination: {
            page,
            pageSize,
            total,
            totalPages: Math.ceil(total / pageSize)
        }
    };
};

export const updateCase = async (id: string, data: {
    caseNumber: string;
    memberNumber: string;
    accusedName: string;
    accusation: string;
    defendantQuestion: string;
    officerQuestion: string;
    victimQuestion: string;
    witnessQuestion: string;
    technicalReports: string;
    caseReferral: string;
    actionOther: string;
    reportType: string;
    investigationID: string;
    year: string;
}) => {
    const [affectedCount] = await Case_private.update(data, {
        where: { id },
    });
    if (affectedCount === 0) {
        throw new Error('القضية غير موجودة');
    }
    return await Case_private.findByPk(id);
};