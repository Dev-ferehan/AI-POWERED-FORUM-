import multer from "multer";
// import path from "path";
import path from 'node:path';
import { fileURLToPath } from 'url';
import fs from 'node:fs';
// const storage = multer.memoryStorage();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, "../uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir); 
    },
    filename: (req, file, cb) => {   
    //   const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null,  file.originalname);
    }
  });

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },

  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf" || file.mimetype.includes("word")) {
      cb(null, uploadDir);
    } else {
      console.log("Invalid file type rejected");
      cb(new Error("only .pdf and word file is valid!"), false);
    }
  },
}).single("file");

export const handleDocumentUpload =async (req, res, next) => {
  upload(req, res, (err) => {
    if (err) {
      console.error("Multer Upload Error:", err.message);
      return res.status(400).json({ success: false, error: err.message });
    }

    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, error: "NOT FOUND file Invalid!" });
    }
    const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.originalname}`;
    req.document={
        name: req.file. fieldname,
        filename: req.file.originalname,
        fileUrl: fileUrl,
        status: "READY",
      }
    next();
  });
};
