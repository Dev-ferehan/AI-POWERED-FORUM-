import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PDFParse } from "pdf-parse";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));

export async function extractPdfText(filename) {
  const PDF_PATH = path.resolve(SCRIPT_DIR, `../uploads/${filename}`);
  const resolvedPath = path.resolve(PDF_PATH);
  let buffer;
  try {
    buffer = await readFile(resolvedPath);
  } catch (error) {
    if (error.code === "ENOENT") {
      throw new Error(`PDF file not found: ${resolvedPath}`, { cause: error });
    }
    throw new Error(`Could not read PDF file: ${resolvedPath}`, {
      cause: error,
    });
  }

  let parser;
  try {
    parser = new PDFParse({ data: buffer });
    const result = await parser.getText();
    // console.log("result parse.getText=========",result.text)
    if (!result.text.trim()) {
      throw new Error("The PDF contains no extractable text.");
    }
    return result.text;
  } catch (error) {
    if (error.message === "The PDF contains no extractable text.") {
      throw error;
    }
    throw new Error(`Could not extract text from PDF: ${resolvedPath}`, {
      cause: error,
    });
  } finally {
    await parser?.destroy();
  }
}
