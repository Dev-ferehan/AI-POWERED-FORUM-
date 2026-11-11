import express from 'express';
import authRouter from './auth/routers/auth.routes.js';
import {questionRouter} from './questions/routes/question.routes.js';
import {answersRouter} from './answers/router/answers.routes.js';
import { uploadRouter} from './knowledgeBase/routers/knowledgeBase.routes.js'
const mainRouter=express.Router();
mainRouter.use('/auth',authRouter);
mainRouter.use('/questions',questionRouter);
mainRouter.use('/answers',answersRouter);
mainRouter.use('/knowledge-base', uploadRouter); 

export default mainRouter;
