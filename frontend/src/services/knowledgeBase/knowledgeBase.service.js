import { apiClient } from "../core/api.client.js";

async function uploadService(formData) {
  try {
    const response = await apiClient.post(
      "/api/knowledge-base/upload",
      formData,
    );

    return response?.data;
  } catch (error) {
    console.log(error.message);
  }
}

async function DeleteDocService(id) {
  const response = await apiClient.delete(
    `/api/knowledge-base/documents/${id}`,
  );

  return response || response.message;
}
async function getDocuments(){
    try {
        const response = await apiClient.get('/api/knowledge-base/get-documents');
      
        return response.data || response;
      } catch (error) {
        console.error("Error fetching documents:", error);
        throw error;
      }
}

export const knowledgeService = {
  uploadService,
  DeleteDocService,
  getDocuments
};
