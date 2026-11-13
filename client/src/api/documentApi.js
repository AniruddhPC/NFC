import api from './axios';

export const documentApi = {
  // Upload a file document
  uploadDocument: async (formData) => {
    const response = await api.post('/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Get user's own documents
  getUserDocuments: async () => {
    const response = await api.get('/documents');
    return response.data;
  },

  // Get documents attached to a tag (Public)
  getTagDocuments: async (tagId = 'TAG001') => {
    const response = await api.get(`/documents/tag/${tagId}`);
    return response.data;
  },

  // Delete a document
  deleteDocument: async (id) => {
    const response = await api.delete(`/documents/${id}`);
    return response.data;
  },

  // Get custom categories for a tag
  getTagCategories: async (tagId = 'TAG001') => {
    const response = await api.get(`/documents/tag/${tagId}/categories`);
    return response.data;
  },
};
