import api from './axios';

export const adminApi = {
  // Tags
  getAllAdminTags: async () => {
    const response = await api.get('/admin/tags');
    return response.data;
  },

  createAdminTag: async (payload) => {
    const response = await api.post('/admin/tags', payload);
    return response.data;
  },

  updateTagConfig: async (tagId, configPayload) => {
    const response = await api.put(`/admin/tags/${tagId}/config`, configPayload);
    return response.data;
  },

  // Users
  getAllUsers: async () => {
    const response = await api.get('/admin/users');
    return response.data;
  },

  updateUserRole: async (userId, role) => {
    const response = await api.put(`/admin/users/${userId}/role`, { role });
    return response.data;
  },
};
