
import { apiClient } from "../core/api.client.js";


async function createAnswer (questionId, answerContent) {
    try {
        const response = await apiClient.post(`/api/answers`, {
            questionId: questionId,
            content: answerContent,
        });
        return response?.data;
    } catch (error) {
       console.log(error)
    }
    
}
export const answerService = {
createAnswer
}