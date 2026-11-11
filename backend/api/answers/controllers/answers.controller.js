import {createAnswerService} from "../services/answer.service.js";
import { StatusCodes } from "http-status-codes";
export const createAnswerController = async (req, res, next) => {

    const userId = req.user.id;
    
    const { questionId, content } = req.body;
   try{
    const answer= await createAnswerService( questionId, content, userId );
    res.status(StatusCodes.CREATED).json({
        success: true,
        message: "Answer posted successfully",
        data: answer,
    });
   }catch(err){
    res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Failed to post answer",
        data: null,
    });
   }
}