import express from "express";
import  {createAnswerController} from "../controllers/answers.controller.js";
import { authenticationUser } from "../../../middleware/authentication.js";
import {createAnswerValidation} from "../validations/answer.validation.js";
export const answersRouter = express.Router();

answersRouter.post("/",authenticationUser,createAnswerValidation,createAnswerController )