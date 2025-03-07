import { DataTypes } from 'sequelize';
import { sequelize, Op } from '../config/db';

const Session = sequelize.define(
    'session',
    {
        sessionId:{
            type: DataTypes.STRING,
            primaryKey: true,
            allowNull: false,
        },
        sessionData:{
            type: DataTypes.JSON,
            allowNull: false,
        },
        expiresAt:{
            type: DataTypes.DATE,
            allowNull: false,
        },

    },
    {
        tableName: 'users', // تأكد من تطابق اسم الجدول
        timestamps: false,
    }
);

export default Session;
