import { Hono } from "hono";
import { createUser,userLogin } from "../controllers/user.controller.js";
const userRouter = new Hono();

userRouter.post('/register', createUser);

userRouter.post('/login', userLogin);

export default userRouter;