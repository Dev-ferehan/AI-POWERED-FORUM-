import { StatusCodes } from "http-status-codes";

import {
  createQuestionWithVectorService,
  getQuestionService,
  searchQuestionsService,
  getSingleQuestionService,
  getRelatedQuestionService,
} from "../services/question.services.js";
import {
  assistantAnswerAgainstQuestionService,
  generateQuestionDraftCoachService,
} from "../services/geminiTextCoach.service.js";
import { query } from "express-validator";

export const createQuestionController = async (req, res, next) => {
  try {
    const { title, content } = req.body;
    const userId = req.user.id;
    // console.log("from backend controller",title,content)
    const result = await createQuestionWithVectorService({
      userId,
      title,
      content,
    });

    res.status(StatusCodes.CREATED).json({
      success: true,
      message: " Question posted successfully",
      data: result.question,
    });
  } catch (error) {
    next(error);
  }
};

export const getQuestionController = async (req, res, next) => {
  try {
    const filters = {
      mine: req.query.mine,
      search: req.query.q || req.query.search,
      userId: req.user.id,
    };
    const result = await getQuestionService(filters);
    // res.status(StatusCodes.OK).json(result);

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Question fetched successfully",
      ...result,
    });
  } catch (error) {
    console.log(error);
  }
};

export const searchQuestionsController = async (req, res, next) => {
  try {
    const queryText = req.query.semantic || req.query.q || req.query.query;
    const result = await searchQuestionsService({
      query: queryText,
      k: req.query.k ? Number(req.query.k) : 5,
      threshold:
        req.query.threshold !== undefined ?
          Number(req.query.threshold)
        : undefined,
    });
    res.status(StatusCodes.OK).json(result);
  } catch (error) {
    next(error);
  }
};

export const getSingleQuestionController = async (req, res, next) => {
  try {
    const { questionHash } = req.params;
    const result = await getSingleQuestionService(questionHash, {
      includeAnswer: true,
    });
    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Question fetched successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const assistantAnswerAgainstQuestionController = async (
  req,
  res,
  next,
) => {
  try {
    const { answerText } = req.body;
    const { questionHash } = req.params;
    const { question } = await getSingleQuestionService(questionHash, {
      includeAnswer: false,
    });

    const answerFit = await assistantAnswerAgainstQuestionService({
      questionTitle: question.title,
      questionContent: question.content,
      answerText,
    });
    return res.status(200).json({
      success: true,
      message: "Answer fit checked successfully",
      data: answerFit,
    });
  } catch (error) {
    next(error);
  }
};
export const generateQuestionDraftCoachController = async (req, res, next) => {
  try {
    const { title, content } = req.body;

    const result = await generateQuestionDraftCoachService({ title, content });

    return res.status(200).json({
      success: true,
      message: "Draft suggestions generated successfully!",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getRelatedQuestionsController = async (req, res, next) => {
  try {
    const { questionHash } = req.params;
    const result = await getRelatedQuestionService(questionHash);

    return res.status(200).json({
      success: true,
      message: "Related questions fetched successfully",
      data: result?.data,
    });
  } catch (error) {
    next(error);
  }
}