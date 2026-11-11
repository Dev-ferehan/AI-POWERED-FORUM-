import crypto from "crypto";
import { safeExecute } from "../../../db/config.db.js";
import {
  normalizeText,
  generateEmbedding,
  storeQuestionVector,
  getVectorConfig,
  findSimilarQuestionByText,
} from "./question.vector.service.js";
import { error } from "console";
import { BadRequestError, NotFoundError } from "../../../utils/error/index.js";
const generateQuestionHash = () => crypto.randomBytes(8).toString("hex");

export const createQuestionWithVectorService = async ({
  userId,
  title,
  content,
}) => {
  try {
  
    const questionSQL = `INSERT INTO questions(question_hash,user_id,title,content) VALUES(?,?,?,?)`;
    const questionHash = generateQuestionHash();

    let questionResult = await safeExecute(questionSQL, [
      questionHash,
      userId,
      title,
      content,
    ]);
    const questionId = questionResult.insertId;
    const creationResult = {
      id: questionId,
      questionHash,
      title,
      content,
      userId,
    };
    const sourceText = await normalizeText(title);
    try {
      const embeddingResult = await generateEmbedding(sourceText, {
        questionId: creationResult.id,
      });

      await storeQuestionVector({
        questionId: creationResult.id,
        sourceText,
        embedding: embeddingResult.embedding,
        status: "ready",
      });
  return {question:creationResult }

    } catch (error) {
      console.error("=== FAILED TO STORE VECTOR FOR QUESTION ===");
      console.error("Question ID :", creationResult.id);
      console.error("OPERATION: QUESTION CREATION");
      console.error("ERROR: ", error);
      console.error("*******************************************");
      await storeQuestionVector({
        questionId: creationResult.id,
        sourceText,
        embedding: [],
        status: "failed",
      });

    }
  return {question:creationResult }

  } catch (error) {
    if (error?.code === "ER_NO_REFERENCED_ROW_2") {
      throw new BadRequestError("User not found");
    }
    throw error;
  }
};
const buildQuestionFilter = (filters) => {
  const params = [];
  const conditions = [];
  if (filters.search && filters.search.trim() !== "") {
    conditions.push("q.title LIKE ? OR q.content LIKE ?");
    const searchTerm = `%${filters.search}%`;

    params.push(searchTerm, searchTerm);
  }
  if (filters.mine === "true" || filters.mine === true) {
    conditions.push("q.user_id=?");
    params.push(filters.userId);
  }
  if (conditions.length === 0) {
    return { whereClause: " ", params };
  }
  return { whereClause: `WHERE ${conditions.join(" AND ")}`, params };
};
export const getQuestionService = async (filters) => {
  let normalizedLimit = 100;
  let sortColumn = "q.created_at";
  const normalizedSortOrder = "DESC";
  try {
    const { whereClause, params } = buildQuestionFilter(filters);
    const sql = `SELECT 
 q.question_id AS id,
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
JOIN users u ON u.user_id = q.user_id LEFT JOIN answers a ON q.question_id=a.question_id ${whereClause} 
GROUP BY q.question_id, q.question_hash, q.title, q.content, q.created_at, q.updated_at, u.user_id, u.first_name, u.last_name
ORDER BY ${sortColumn} ${normalizedSortOrder}
LIMIT ${normalizedLimit}`;

    const rows = await safeExecute(sql, params);
    return {
      data: rows.map((question) => ({
        id: question.id,
        questionHash: question.questionHash,
        title: question.title,
        content: question.content,
        answerCount: question.answerCount,
        createdAt: question.createdAt,
        updatedAt: question.updatedAt,
        author: {
          id: question.userId,
          firstName: question.firstName,
          lastName: question.lastName,
        },
      })),
      meta: {
        limit: normalizedLimit,
        total: rows.length,
        sortBy: "newest",
        sortOrder: normalizedSortOrder,
      },
    };
  } catch (error) {
    console.error(error);
  }
};

export const searchQuestionsService = async ({ query, k = 5, threshold }) => {
  const sourceText = normalizeText(query);
  const vectorConfig = getVectorConfig();
  const recommend_k = vectorConfig.recommend_k;
  const search_Threshold =
    threshold !== undefined ? threshold : vectorConfig.recommend_threshold;

 try{
  const result = await findSimilarQuestionByText({
    sourceText,
    threshold: search_Threshold,
    k: recommend_k,
  });
  return {
    data: result.similarQuestions,
    meta: {
      query,
      k,
      threshold: search_Threshold,
      total: result.similarQuestions?.length,
    },
  };
 }catch(error){
  console.log(error)
 }


};

export const getSingleQuestionService = async (
  questionHash,
  { includeAnswer },
) => {
  const normalizedAnswerLimit = 100;
  const questionQuery = `SELECT 
  q.question_id AS id,
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
  WHERE q.question_hash=?
  GROUP BY q.question_id, u.user_id`;
  const questionRow = await safeExecute(questionQuery, [questionHash]);
  if (questionRow.length === 0) {
    throw NotFoundError("not found error");
  }
  if (!includeAnswer) {
    return { question: questionRow[0] };
  }

  const question = questionRow[0];
  const questionId = question.id;

  const answerQuery = ` SELECT a.answer_id AS id,
  a.content,
  a.created_at AS createdAt,
  a.updated_at AS updatedAt,
  au.user_id AS userId,
  au.first_name AS firstName,
  au.last_name AS lastName
  FROM answers a
  JOIN users au ON au.user_id = a.user_id
  WHERE a.question_id = ?
  ORDER BY a.created_at DESC
  LIMIT ${normalizedAnswerLimit}`;

  const answers = await safeExecute(answerQuery, [questionId]);
  return {
    question: {
      id: question.id,
      questionHash: question.questionHash,
      title: question.title,
      content: question.content,
      answerCount: question.answerCount,
      createdAt: question.createdAt,
      updatedAt: question.updatedAt,
      author: {
        id: question.userId,
        firstName: question.firstName,
        lastName: question.lastName,
      },
      answers: answers.map((answer) => {
        return {
          id: answer.id,
          content: answer.content,
          createdAt: answer.createdAt,
          updatedAt: answer.updatedAt,
          author: {
            id: answer.userId,
            firstName: answer.firstName,
            lastName: answer.lastName,
          },
        };
      }),
      answersMeta: {
        limit: normalizedAnswerLimit,
        total: answers.length,
      },
    },
  };
};



export const getRelatedQuestionService = async (questionHash) => {
  const question=await getSingleQuestionService(questionHash, { includeAnswer: false });
  if (!question || !question.question) {
    throw new NotFoundError("Question not found");
  }
let queryText=question?.question?.title || " ";
  const sourceText = normalizeText(question?.question?.title || " ");
  const vectorConfig = getVectorConfig();
  const recommend_k = vectorConfig.recommend_k;
  const search_Threshold = vectorConfig.recommend_threshold;
  try {
 
      const result = await findSimilarQuestionByText({
        sourceText,
        threshold: search_Threshold,
        k: recommend_k,
      });
  
      return {
        data: result.similarQuestions,
        meta: {
          queryText,
          k:recommend_k,
          threshold: search_Threshold,
          total: result.similarQuestions?.length,
        },
      };
     
  }catch (error) {
    console.error("=== ERROR FETCHING RELATED QUESTIONS ===");
    console.error("Question Hash:", questionHash);
    console.error("Error:", error);
    throw new Error("Failed to fetch related questions.");
  }
}