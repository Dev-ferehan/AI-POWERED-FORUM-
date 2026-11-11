import { param,body } from "express-validator";
import { validationErrorHandler } from "../../../middleware/validation-handler.js";
export const createAnswerValidation = [
    body('content')
        .notEmpty()
        .withMessage('Answer content is required')
        .isString()
        .withMessage('Answer content must be a string')
        .isLength({ min: 20 })
        .withMessage('Answer content must be at least 20 characters')
        .trim(),
        validationErrorHandler,
]