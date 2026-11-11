import fs from "fs";
import path from "path";
import { safeExecute } from "../../../db/config.db.js";
import { fileURLToPath } from "url";
// import {extractPdfText} from '../../../utils/pdf-extract.js'
import { documentVectorService } from "./vector.service.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


export const deleteDocService = async (id) => {
  try {
    const rows = await safeExecute(
      "SELECT file_path FROM documents WHERE id = ?",
      [id],
    );

    if (!rows || rows.length === 0) {
      throw new Error("Document not found in database.");
    }

    const filePath = rows[0].file_path;
    // console.log("delete file path=========",filePath)
    const filename = filePath.split("/").pop();
    const physicalPath = path.join(__dirname, "../../../uploads", filename);
    // console.log("physical file path=========", physicalPath);

    if (physicalPath && fs.existsSync(physicalPath)) {
      fs.unlinkSync(physicalPath);
      console.log(`File deleted from folder: ${filePath}`);
    }
    await safeExecute("DELETE FROM documents WHERE id = ?", [id]);
    // console.log("deleted file from db =============")

    return {
      success: true,
      message: "Document and file deleted successfully.",
    };
  } catch (error) {
    console.error("Error in deleteDocumentService:", error);
    throw error;
  }
};

export const uploadDocService = async ({
  userId,
  name,
  filename,
  fileUrl,
  status,
}) => {
  try {
    const result = await safeExecute(
      "INSERT INTO documents (user_id, filename, original_name, file_path, status) VALUES (?, ?, ?, ?, ?)",
      [userId, filename, name, fileUrl, status],
    );
try{
    const DocId=result.insertId;
   await  documentVectorService(DocId,filename)


}catch(error){
    console.log("extract pdf===========",error)
}
    return {
      id: result.insertId,
      name: name,
      filename: filename,
      fileUrl: fileUrl,
      status: status || "READY",
    };
  } catch (error) {
    console.log("error happen ", error);
    throw error;
  }
};

export const getDocumentsService = async () => {
  try {
    const rows = await safeExecute(
      "SELECT id, original_name AS name, filename, file_path AS fileUrl, status FROM documents ORDER BY id DESC",
      [],
    );

    return rows || [];
  } catch (error) {
    console.error("Error in getDocumentsService:", error);
    throw error;
  }
};
