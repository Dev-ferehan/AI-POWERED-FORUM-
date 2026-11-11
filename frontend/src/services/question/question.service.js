import { apiClient } from "../core/api.client.js";

// post question
async function createQuestion({ title, content }) {
  try {
    const response = await apiClient.post("/api/questions", {
      title,
      content,
    });

    return response?.data;
  } catch (error) {
    console.log(error.message);
  }
}

/**
 * Fetches all questions from the server.

 */
async function getQuestions(params = {}) {
  try {
    let endpoint = "/api/questions";

    if (params.semantic) {
      endpoint = "/api/questions/search";
    }

    const response = await apiClient.get(endpoint, { params });

    return response.data.data || response.data.questions || response.data;
  } catch (error) {
    throw handleQuestionError(error);
  }
}

async function getSingleQuestion(questionHash) {
  try {
    const response = await apiClient.get(`/api/questions/${questionHash}`);

    return response.data.data || response.data;
  } catch (error) {
    throw handleQuestionError(error);
  }
}

async function CheckDraftFit(questionHash, answerText) {
  const response = await apiClient.post(
    `/api/questions/${questionHash}/answer-fit`,
    { answerText },
  );
  return response.data;
}

function handleQuestionError(error) {
  if (!error.response) {
    if (error.code === "ECONNABORTED") {
      return new Error("Request timed out. Please try again.");
    }
    return new Error(
      "Unable to connect to server. Please check your internet connection.",
    );
  }

  const status = error.response.status;
  const backendMessage =
    error.response.data?.msg || error.response.data?.message;

  switch (status) {
    case 400:
      return new Error(backendMessage || "Invalid input data.");
    case 401:
      // Fixed: Changed from 'Invalid email or password' to an appropriate auth/session error for questions
      return new Error(
        backendMessage || "Unauthorized. Please log in to continue.",
      );
    case 403:
      return new Error(backendMessage || "Access denied.");
    case 404:
      return new Error(backendMessage || "Questions not found.");
    case 500:
      return new Error(
        "Something went wrong on our end. Please try again later.",
      );
    default:
      return new Error(backendMessage || "An unexpected error occurred.");
  }
}

 async function QuestionDraftCoach({title,content}){
  const response =await apiClient.post('/api/questions/draft-Coach',{title,content});
return response.data;
}


async function getRelatedQuestion(questionHash) {
  try {
    const response = await apiClient.get(`/api/questions/${questionHash}/similar`);
    return response.data  ||    response.data.data ;
  } catch (error) {
    throw handleQuestionError(error);
  }
}
export const questionService = {
  getQuestions,
  createQuestion,
  getSingleQuestion,
  CheckDraftFit,
  QuestionDraftCoach,
  getRelatedQuestion
};


