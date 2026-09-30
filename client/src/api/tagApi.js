import api from './axios';

export const tagApi = {
  // Get all tags owned by the user
  getTags: async () => {
    const response = await api.get('/tags');
    return response.data;
  },

  // Get full tag document + owner status
  getTagById: async (tagId) => {
    const response = await api.get(`/tags/${tagId}`);
    return response.data;
  },

  // Authoritative dynamic state check (Primary NFC Entry endpoint)
  getTagState: async (tagId) => {
    const response = await api.get(`/tags/${tagId}/state`);
    return response.data;
  },

  // Get dynamic tag configuration (fields, functions, access levels)
  getTagConfig: async (tagId) => {
    const response = await api.get(`/tags/${tagId}/config`);
    return response.data;
  },

  // Activate context (with dynamic fields)
  activateTag: async (tagId, payload) => {
    const response = await api.post(`/tags/${tagId}/activate`, payload);
    return response.data;
  },

  // Deactivate context
  deactivateTag: async (tagId) => {
    const response = await api.post(`/tags/${tagId}/deactivate`);
    return response.data;
  },

  // Get functional data for an active tag
  getTagFunctionData: async (tagId, functionName) => {
    const response = await api.get(`/tags/${tagId}/data/${functionName}`);
    return response.data;
  },
};
