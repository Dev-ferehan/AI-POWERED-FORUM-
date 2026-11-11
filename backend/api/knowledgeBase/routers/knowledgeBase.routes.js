import express from 'express'
import {deleteDocController,uploadController,getDocumentsController,searchFromDocController  } from '../controller/knowledgeBase.Controller.js'
import {handleDocumentUpload } from '../../../utils/upload.js'
import { authenticationUser } from '../../../middleware/authentication.js'
// import {extractPdfText} from '../../../utils/pdf-extract.js'
export const uploadRouter=express.Router()
uploadRouter.post('/upload', authenticationUser,handleDocumentUpload,uploadController );
uploadRouter.delete('/documents/:id',authenticationUser,deleteDocController);
uploadRouter.get('/get-documents',authenticationUser,getDocumentsController)
// uploadRouter.post('/search',extractPdfText,searchFromDocController)