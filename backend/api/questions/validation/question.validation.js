import { body, param, query } from 'express-validator';
import { validationErrorHandler } from '../../../middleware/validation-handler.js';

export const createQuestionValidation = [
  body('title')
    .notEmpty()
    .withMessage('Question title is required')
    .isString()
    .withMessage('Question title must be a string')
    .isLength({ min: 5, max: 255 })
    .withMessage('Question title must be between 5 and 255 characters')
    .trim(),
  body('content')
    .notEmpty()
    .withMessage('Question content is required')
    .isString()
    .withMessage('Question content must be a string')
    .isLength({ min: 10 })
    .withMessage('Question content must be at least 10 characters')
    .trim(),
  validationErrorHandler,
];

export const getQuestionsValidation = [
  query('q')
    .optional()
    .isString()
    .withMessage('Search must be a string')
    .trim(),
  query('mine')
    .optional()
    .isBoolean()
    .withMessage('Mine must be a boolean')
    .toBoolean(),
  validationErrorHandler,
];

export const searchQuestionsValidation = [
  query('semantic')
    .notEmpty()
    .withMessage('query is required')
    .isString()
    .withMessage('query must be a string')
    .isLength({ min: 5 })
    .withMessage('query must be at least 5 characters')
    .trim(),
  query('k')
    .optional()
    .isInt({ min: 1, max: 20 })
    .withMessage('k must be between 1 and 20')
    .toInt(),
  query('threshold')
    .optional()
    .isFloat({ min: 0, max: 1 })
    .withMessage('threshold must be between 0 and 1')
    .toFloat(),
  validationErrorHandler,
];

export const getSingleQuestionValidation=[
    param('questionHash')
    .isString()
    .withMessage("QuestionHash is required")
// matchs 16 digit hex string
.matches(/^[0-9a-fA-F]{16}$/)
.withMessage("QuestionHash must be a 16 digit hex string"),
validationErrorHandler,

]

export const assistantAnswerAgainstQuestionValidation=[
    param('questionHash')
    .isString()
    .withMessage("QuestionHash is required")
// matchs 16 digit hex string
.matches(/^[0-9a-fA-F]{16}$/)
.withMessage("QuestionHash must be a 16 digit hex string"),
body('answerText')
    .notEmpty()
    .withMessage('Answer text is required')
    .isString()
    .withMessage('Answer text must be a string')
    .isLength({ min: 20})
    .withMessage('Answer text must be at least 20 characters')
    .trim(),


validationErrorHandler,
]

export const generateQuestionDraftCoachValidation=[
  body('title')
    .notEmpty()
    .withMessage('Question title is required')
    .isString()
    .withMessage('Question title must be a string')
    .isLength({ min: 5, max: 255 })
    .withMessage('Question title must be between 5 and 255 characters')
    .trim(),
  body('content')
    .notEmpty()
    .withMessage('Question content is required')
    .isString()
    .withMessage('Question content must be a string')
    .isLength({ min: 10 })
    .withMessage('Question content must be at least 10 characters')
    .trim(),
validationErrorHandler,
]


export const getRelatedQuestionsValidation=[
    param('questionHash')
    .isString()
    .withMessage("QuestionHash is required")
    .matches(/^[0-9a-fA-F]{16}$/)
    .withMessage("QuestionHash must be a 16 digit hex string")


]


