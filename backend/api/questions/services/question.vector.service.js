import { GoogleGenAI } from "@google/genai";
import { safeExecute } from "../../../db/config.db.js";
const GOOGLE_GEMINI_MODEL = process.env.GOOGLE_GEMINI_MODEL;
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const RECOMMEND_K = process.env.RECOMMEND_K;
const RECOMMEND_THRESHOLD =process.env.RECOMMEND_THRESHOLD;
const ai = new GoogleGenAI({ apiKey: GOOGLE_API_KEY });

const removeWhiteSpace = (text) => {
  return text.replace(/\s+/g, " ").trim();
};
export const normalizeText = (text) => {
  return removeWhiteSpace(`${text}` || " ")
    .normalize("NFKC")
    .toLowerCase();
};
export const generateEmbedding = async (sourceText, options = {}) => {
  const { taskType = "RETRIEVAL_DOCUMENT" } = options;

  try {
    const response = await ai.models.embedContent({
      model: GOOGLE_GEMINI_MODEL,
      contents: sourceText,
      config: {
        taskType: taskType,
        outputDimensionality: 768,
      },
    });
    const values = response.embeddings[0].values;
    if (!Array.isArray(values) || values.length === 0) {
      throw new Error("Gemini embedding response does not contain values");
    }
    return {
      embedding: values,
    };
  } catch (error) {
    console.error("Error", error);
    console.error("********************");
    throw error;
  }
};
const validateEmbedding = (embedding) => {
  if (!Array.isArray(embedding)) {
    throw new Error("embedding must be an array");
  }
  if (embedding.length === 0) {
    throw new Error("embedding can not be empty");
  }
  if (!embedding.every((v) => typeof v === "number" && !isNaN(v))) {
    throw new Error("Embedding must contain only valid number ");
  }
};

const calculateCosineSimilarity = async (vectorA, vectorB) => {
  if (vectorA.length !== vectorB.length) {
    throw new Error(
      `Vectors must have the same length ${vectorA.length} and ${vectorB.length}`,
    );
  }
  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;

  for (let i = 0; i < vectorA.length; i++) {
    dotProduct += vectorA[i] * vectorB[i];
    magnitudeA += vectorA[i] * vectorA[i];
    magnitudeB += vectorB[i] * vectorB[i];
  }

  magnitudeA = Math.sqrt(magnitudeA);

  magnitudeB = Math.sqrt(magnitudeB);
  if (magnitudeA === 0 || magnitudeB === 0) {
    return 0;
  }
  return dotProduct / (magnitudeA * magnitudeB);
};
export const storeQuestionVector = async ({
  questionId,
  sourceText,
  embedding = [],
  status,
}) => {
  if (status === "failed" || !embedding || !embedding.length) {
    const sql = `INSERT INTO question_vectors (question_id,source_text,embedding,status) VALUES (?,?,?,?) ON DUPLICATE KEY UPDATE 
        source_text=VALUES(source_text),
        embedding=VALUES(embedding),status=VALUES(status),
        updated_at=CURRENT_TIMESTAMP`;

    await safeExecute(sql, [
      questionId,
      sourceText,
      JSON.stringify([]),
      "failed",
    ]);
    return;
  }
  validateEmbedding(embedding);

  const embeddingJSON = JSON.stringify(embedding);

  const sql = `INSERT INTO question_vectors (question_id,source_text,embedding,status) VALUES (?,?,?,?) ON DUPLICATE KEY UPDATE 
    source_text=VALUES(source_text),
    embedding=VALUES(embedding),status=VALUES(status),
    updated_at=CURRENT_TIMESTAMP`;

  try {
    await safeExecute(sql, [questionId, sourceText, embeddingJSON, status]);
  } catch (error) {
    console.error("=== MYSQL UPSERT ERROR ===");
    console.error("Operation: storeQuestionVector");
    console.error(`Question ID: ${questionId}`);
    console.error(`Embedding length: ${embedding.length}`);
    console.error(`Status: ${status}`);
    console.error("SQL:", sql.trim().replace(/\s+/g, " "));
    console.error("Error:", error);
    console.error("===========================");
    throw error;
  }
};
export const getVectorConfig = () => {
  return {
    recommend_k: RECOMMEND_K,
    recommend_threshold: RECOMMEND_THRESHOLD,
  };
};

const retrieveReadyEmbedding = async () => {
  const embeddings = [];
  const sql =
    "SELECT question_id, embedding from question_vectors where status = ?";
  const rows = await safeExecute(sql, ["ready"]);
  for (const row of rows) {
   try{
    const embedding =
    typeof row.embedding === "string" ?
      JSON.parse(row.embedding)
    : row.embedding;
  embeddings.push({
    questionIds: row.question_id,
    embedding: embedding,
  });
   }catch(parseError){
console.warn(`skipping question ${row.question_id}:fail to parse embedding json`,parseError);
continue;
   }
  }
  return embeddings
};
export const findSimilarQuestionByText = async ({
  sourceText,
  threshold,
  k,
}) => {
  const normalized_k = k || RECOMMEND_K;
  const normalized_threshold = threshold || RECOMMEND_THRESHOLD;

  let embeddingResult;




  try {
    embeddingResult = await generateEmbedding(sourceText, {
      taskType: "RETRIEVAL_QUERY",
    });

  } catch (error) {
    console.error('=== GEMINI API ERROR DURING SEARCH ===');
    console.error('Operation: findSimilarQuestionsByText');
    console.error('Search text:', sourceText);
    console.error('Error:', error);
    console.error('===================================');
    throw new ServiceUnavailableError(
      'Failed to generate embedding for search query. Please try again later.',
    );
  }
let  embeddingQuery=embeddingResult.embedding;
let storedEmbedding;
  try {
 storedEmbedding = await retrieveReadyEmbedding();
  } catch (error) {
    console.error('=== MYSQL ERROR DURING SEARCH ===');
    console.error('Operation: findSimilarQuestionsByText');
    console.error('Search text:', sourceText);
    console.error('Error:', error);
    console.error('===================================');
  }

  const similarities = [];
  try {
    for (const store of storedEmbedding) {
      
      const score = await calculateCosineSimilarity (embeddingQuery, store.embedding);
      if (score >= normalized_threshold) {
        similarities.push({
          questionId: store. questionIds,
          score: score,
        });
      }
    }
  }
    catch (error) {
      console.warm(`failed to calculate similarity for question ${stored.questionId}:`, error.message  );
  
    
  } 
  similarities.sort((a, b) => b.score - a.score);

  const topResult = similarities.slice(0, normalized_k);

  if (topResult.length === 0) {
    return {
      ...embeddingResult,
      similarityQuestion: [],
    };
  }
  const questionId=topResult.map((r=>r.questionId));
  const placeholders=topResult.map(()=>'?').join(',');

  const questionsQuery=`
  SELECT 
  q.question_id AS questionId,
  q.question_hash AS questionHash,
  q.title,
  q.content,
  q.created_at AS createdAt,
  q.updated_at AS updatedAt,
  u.user_id AS userId,
  u.first_name AS firstName,
  u.last_name AS lastName,
  COUNT(DISTINCT a.answer_id) AS answerCount
 FROM questions q
JOIN users u ON u.user_id = q.user_id
LEFT JOIN answers a ON a.question_id = q.question_id
WHERE q.question_id IN (${placeholders})    
GROUP BY q.question_id, u.user_id
`
let rows
try{
  rows =await safeExecute( questionsQuery,questionId)
}catch(error){
  console.error('=== DATABASE ERROR FETCHING QUESTION DETAILS ===');
    console.error('Operation: findSimilarQuestionsByText - fetch details');
    console.error('Question IDs:', questionId);
    console.error('Error:', error);
    console.error('==============================================');
    throw error;
}
const questionMap={};
rows.forEach(row=>{
  questionMap[row.questionId]={
      id:row.questionId,
      questionHash:row.questionHash,
      title:row.title,
      content:row.content,
      answerCount:row.answerCount,
      createdAt:row.createdAt,
      updatedAt:row.updatedAt,
      author:{
          id:row.userId,
          firstName:row.firstName,
          lastName:row.lastName,
      },
  }
})

const similarQuestions=topResult.filter(result=>questionMap[String(result.questionId)]).map(result=>({
    score:Number(result.score.toFixed(6)),
    ...questionMap[String(result.questionId)],
}))
return {
    ...embeddingResult,
    similarQuestions,
};
};
