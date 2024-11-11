import express from 'express';
import { createUser,userLogin,userAuthentication ,userEdit,userDeleteById,getAllUsers , logoutSession } from "../controllers/user.controller";
const userRouter =  express.Router();

userRouter.post('/register', createUser);

userRouter.post('/login', userLogin);

userRouter.post('/verify', userAuthentication);

userRouter.put('/user/edit/:id', userEdit);

userRouter.delete('/user/delete/:id', userDeleteById);

userRouter.get('/users', getAllUsers);

userRouter.post('/logout', logoutSession);


export default userRouter;