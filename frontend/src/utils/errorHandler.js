// frontend/src/utils/errorHandler.js
export const handleApiError = (error) => {
    if (error.response) {
      // Server responded with error
      if (error.response.status === 401) {
        return 'Please login to continue';
      }
      if (error.response.status === 403) {
        return 'You do not have permission to perform this action';
      }
      if (error.response.data?.message) {
        return error.response.data.message;
      }
    } else if (error.request) {
      // Request made but no response
      return 'Unable to connect to server';
    }
    return 'An unexpected error occurred';
  };
  
  // Usage in components
  import { handleApiError } from '../../utils/errorHandler';
  
  try {
    await hangarService.createHangar(data);
  } catch (err) {
    setError(handleApiError(err));
  }