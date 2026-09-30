import api from './axios';

export const userApi = {
  getUserProfile: async () => {
    const response = await api.get('/user/profile');
    return response.data;
  },

  updateUserProfile: async (payload) => {
    const response = await api.put('/user/profile', payload);
    return response.data;
  },

  getTagDocuments: async (tagId) => {
    const response = await api.get(`/user/documents/${tagId}`);
    return response.data;
  },

  saveTagDocument: async (tagId, functionName, payload) => {
    const response = await api.put(`/user/documents/${tagId}/${functionName}`, payload);
    return response.data;
  },
};
