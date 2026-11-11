import express from 'express';
import {loginController,registerController} from '../controllers/auth.controller.js';
import {authenticationUser} from '../../../middleware/authentication.js';
import {registerValidation,loginValidation} from '../validation/auth.validation.js';
const authRouter = express.Router();
authRouter.post('/register',registerValidation,registerController)
authRouter.post('/login',loginValidation,loginController);
export default authRouter;