import { safeExecute } from "../../../db/config.db.js";

const getQuestionOwner = async (questionId) => {
  const questionQuery = `SELECT question_id,user_id FROM questions  WHERE question_id = ?`;
  const row = await safeExecute(questionQuery, [questionId]);
  if (row.length === 0) {
    throw NotFoundError("Question not found");
  }
  return row[0];
};
const mapAnswer = row => ({
    id: row.id,
    questionId: row.questionId,
    content: row.content,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    author: {
      id: row.userId,
      firstName: row.firstName,
      lastName: row.lastName,
    },
  });
export const getSingleAnswerService = async (answerId) => {
    const sql = `
      SELECT 
        a.answer_id AS id,
        a.question_id AS questionId,
        a.content,
        a.created_at AS createdAt,
        a.updated_at AS updatedAt,
        u.user_id AS userId,
        u.first_name AS firstName,
        u.last_name AS lastName
      FROM answers a
      JOIN users u ON u.user_id = a.user_id
      WHERE a.answer_id = ?
      LIMIT 1
    `;
    const rows = await safeExecute(sql, [answerId]);
    if (rows.length === 0) {
      throw new Error("Answer not found");
    }
    return mapAnswer(rows[0]);
}

export const createAnswerService = async (questionId, content, userId) => {
  const question = await getQuestionOwner(questionId);
    if (question.user_id === userId) {
        throw new Error("You cannot answer your own question.");
    }

  const insertQuery = `INSERT INTO answers (question_id, user_id, content) VALUES (?, ?, ?)`;
  const result = await safeExecute(insertQuery, [questionId, userId, content]);
 
  return getSingleAnswerService(result.insertId);
};
