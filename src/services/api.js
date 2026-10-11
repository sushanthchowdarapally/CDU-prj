// Axios-ready service layer helper

export const apiClient = {
  get: async (url, options = {}) => {
    // Simulated network delay
    await new Promise((resolve) => setTimeout(resolve, 80));
    return { data: null, status: 200 };
  },
  post: async (url, body = {}, options = {}) => {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return { data: body, status: 201 };
  },
  put: async (url, body = {}, options = {}) => {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return { data: body, status: 200 };
  },
  delete: async (url, options = {}) => {
    await new Promise((resolve) => setTimeout(resolve, 80));
    return { data: { success: true }, status: 200 };
  }
};
