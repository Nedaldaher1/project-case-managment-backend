import { Hono } from "hono";
import { createUser,userLogin,userAuthuntication } from "../controllers/user.controller.js";
const userRouter = new Hono();

userRouter.post('/register', createUser);

userRouter.post('/login', userLogin);

userRouter.post('/verify', userAuthuntication);


export default userRouter;