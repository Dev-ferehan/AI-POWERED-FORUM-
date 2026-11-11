import express from 'express';
import {createQuestionController,getQuestionController,searchQuestionsController,getSingleQuestionController,assistantAnswerAgainstQuestionController,generateQuestionDraftCoachController,getRelatedQuestionsController} from '../controllers/question.controller.js';
import {createQuestionValidation, getQuestionsValidation, searchQuestionsValidation,getSingleQuestionValidation,assistantAnswerAgainstQuestionValidation,getRelatedQuestionsValidation,generateQuestionDraftCoachValidation} from '../validation/question.validation.js'
import { authenticationUser } from '../../../middleware/authentication.js';
export const questionRouter = express.Router();
questionRouter.post('/',authenticationUser,createQuestionValidation,createQuestionController);
questionRouter.get('/',authenticationUser, getQuestionsValidation,getQuestionController);
questionRouter.get('/search',authenticationUser, searchQuestionsValidation, searchQuestionsController)
questionRouter.get('/:questionHash',authenticationUser,getSingleQuestionValidation,getSingleQuestionController)
questionRouter.post('/:questionHash/answer-fit',authenticationUser,assistantAnswerAgainstQuestionValidation,assistantAnswerAgainstQuestionController)
questionRouter.post('/draft-Coach',authenticationUser,generateQuestionDraftCoachValidation,generateQuestionDraftCoachController)
questionRouter.get('/:questionHash/similar',authenticationUser,getRelatedQuestionsValidation,getRelatedQuestionsController)