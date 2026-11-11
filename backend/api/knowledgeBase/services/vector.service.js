import { extractPdfText } from "../../../utils/pdf-extract.js";
import { chunksText } from "../../../utils/chunks.js";

import { GoogleGenAI } from "@google/genai";
import { safeExecute } from "../../../db/config.db.js";
const ApiKEY = process.env.GOOGLE_API_KEY;
const GEMINI_EMBEDDING_MODEL = process.env.GEMINI_EMBEDDING_MODEL;
const ai = new GoogleGenAI({ apiKey: ApiKEY });

const embeddingResult = async (text) => {
  const response = await ai.models.embedContent({
    model: GEMINI_EMBEDDING_MODEL,
    contents: text,
  });
  // console.log(response?.embeddings[0]?.values);
  return response?.embeddings[0]?.values;
};
export const documentVectorService = async (DocId, filename) => {
  const text = await extractPdfText(filename);
  const cleanedText = text.replace(/(\r\n|\n|\r)/gm, " ");
  const chunks = chunksText(cleanedText);
  if (chunks.length === 0) {
    const error = new Error("No text chunk found in the up loaded file");
    error.statusCode = 400;
  }
  // console.log("chunks================",chunks)
  try {
    for (const chunk of chunks) {
      const embeddedChunk = await embeddingResult(chunk);
      // console.log("embeddedChunk===============",embeddedChunk)
      await safeExecute(
        "INSERT INTO document_chunks (document_id, chunk_text, embedding) VALUES (?,?,?)",
        [DocId, chunk, JSON.stringify(embeddedChunk)],
      );
    }
    return {
      chunkCount: chunks.length,
      store: "mysql",
    };
  } catch (error) {
    console.log("something wrong insert table", error);
  }
};
