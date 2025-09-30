// src/hooks/useErrorHandler.js

import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';

export const useErrorHandler = () => {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAsync = useCallback(async (asyncFunction, options = {}) => {
    const {
      loadingMessage = 'Loading...',
      successMessage = null,
      errorMessage = 'An error occurred',
      showLoading = true,
      showSuccess = true,
      showError = true,
      onSuccess = null,
      onError = null,
      finally: onFinally = null
    } = options;

    try {
      setError(null);
      if (showLoading) {
        setIsLoading(true);
        if (loadingMessage) {
          toast.loading(loadingMessage);
        }
      }

      const result = await asyncFunction();

      if (showSuccess && successMessage) {
        toast.success(successMessage);
      }

      if (onSuccess) {
        onSuccess(result);
      }

      return result;

    } catch (err) {
      console.error('Error in useErrorHandler:', err);
      setError(err);

      if (showError) {
        const message = err.response?.data?.message || err.message || errorMessage;
        toast.error(message);
      }

      if (onError) {
        onError(err);
      }

      throw err; // Re-throw so component can handle if needed

    } finally {
      if (showLoading) {
        setIsLoading(false);
        toast.dismiss(); // Dismiss loading toast
      }

      if (onFinally) {
        onFinally();
      }
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const handleError = useCallback((err, message = 'An error occurred') => {
    console.error('Manual error handling:', err);
    setError(err);
    toast.error(message);
  }, []);

  return {
    error,
    isLoading,
    handleAsync,
    clearError,
    handleError
  };
};

// Specialized hooks for common operations
export const useApiCall = (apiFunction) => {
  const { handleAsync, error, isLoading } = useErrorHandler();

  const execute = useCallback((params, options = {}) => {
    return handleAsync(() => apiFunction(params), {
      errorMessage: 'API call failed',
      ...options
    });
  }, [handleAsync, apiFunction]);

  return { execute, error, isLoading };
};

export const useFormSubmit = () => {
  const { handleAsync, error, isLoading } = useErrorHandler();

  const submit = useCallback((submitFunction, options = {}) => {
    return handleAsync(submitFunction, {
      loadingMessage: 'Submitting...',
      successMessage: 'Submitted successfully',
      errorMessage: 'Submission failed',
      ...options
    });
  }, [handleAsync]);

  return { submit, error, isLoading };
};