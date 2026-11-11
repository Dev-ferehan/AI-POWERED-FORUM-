import {
  deleteDocService,
  uploadDocService,
  getDocumentsService
} from "../services/knowledgeBase.Service.js";
export const deleteDocController = async (req, res, next) => {
     try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({ error: "Document ID is required." });
      }
      await deleteDocService(id);
      return res.status(200).json({
        success: true,
        message: "document deleted successfully!"
      });
    } catch (error) {
      console.error("Error in deleteDocumentController:", error);
      return res.status(500).json({
        success: false,
        error: error.message || "Internal server error while deleting document."
      });
    }
};

export const uploadController = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: "NOT FOUND FILE!" });
    }
    const userId = req.user.id;
    const name = req.document.originalname || req.file.originalname;
    const filename = req.document.filename || req.file.filename;

    const fileUrl =
      req.document.fileUrl ||
      `${req.protocol}://${req.get("host")}/uploads/${filename}`;
    const status = req.document.status || "READY";

    const newDocument = await uploadDocService({
      userId,
      name,
      filename,
      fileUrl,
      status,
    });

    return res.status(201).json({
      success: true,
      message: "successfully uploaded!",
      document: newDocument,
    });
  } catch (error) {
    console.error("Error in uploadController:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Internal server error during file upload.",
    });
  }
};

export const getDocumentsController = async (req, res, next) => {
    try {
  
      const documents = await getDocumentsService();
  
      return res.status(200).json({
        success: true,
        documents: documents
      });
    } catch (error) {
      console.error("Error in getDocumentsController:", error);
      return res.status(500).json({
        success: false,
        error: error.message || "Internal server error while fetching documents."
      });
    }
  };
export const searchFromDocController=async(req,res,next)=>{
    console.log("hello from searchFromDocController=======")
}