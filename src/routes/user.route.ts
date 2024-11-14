import express from 'express';
import { createUser, userLogin, userAuthentication, userEdit, userDeleteById, getAllUsers, logoutSession, makeBackup, getBackup, restoreBackup, deleteBackup, verifyToken2FAHandler } from "../controllers/user.controller";
const userRouter = express.Router();

userRouter.post('/register', createUser);

userRouter.post('/user/verify/2fa', verifyToken2FAHandler);

userRouter.post('/login', userLogin);

userRouter.post('/verify', userAuthentication);

userRouter.put('/user/edit/:id', userEdit);

userRouter.delete('/user/delete/:id', userDeleteById);

userRouter.get('/users', getAllUsers);

userRouter.post('/logout', logoutSession);

userRouter.post('/backup/save', makeBackup);

userRouter.get('/backup/get', getBackup);

userRouter.post('/backup/restore/:id', restoreBackup);

userRouter.delete('/backup/delete/:id', deleteBackup);




export default userRouter;