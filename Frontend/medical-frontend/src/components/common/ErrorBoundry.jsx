// src/components/common/ErrorBoundary.jsx

import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      eventId: null 
    };
  }

  static getDerivedStateFromError(_error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo,
      eventId: Math.random().toString(36).substr(2, 9)
    });

    // You can also log the error to an error reporting service here
    // Example: Sentry.captureException(error, { contexts: { react: errorInfo } });
  }

  handleRetry = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null,
      eventId: null 
    });
    
    // Optionally reload the page for critical errors
    if (this.props.fallbackType === 'page') {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI based on props
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.handleRetry);
      }

      // Default fallback UI
      return (
        <div className="min-h-screen bg-canvas flex flex-col justify-center py-12 sm:px-6 lg:px-8">
          <div className="sm:mx-auto sm:w-full sm:max-w-md">
            <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
              <div className="text-center">
                <AlertTriangle className="mx-auto h-12 w-12 text-red-500" />
                <h2 className="mt-4 text-lg font-medium text-slate-900">
                  {this.props.title || 'Something went wrong'}
                </h2>
                <p className="mt-2 text-sm text-slate-600">
                  {this.props.message || 'We apologize for the inconvenience. An unexpected error has occurred.'}
                </p>
                
                {import.meta.env.DEV && this.state.error && (
                  <details className="mt-4 text-left">
                    <summary className="cursor-pointer text-sm text-slate-600 hover:text-slate-700">
                      Error Details (Development Only)
                    </summary>
                    <div className="mt-2 p-3 bg-red-50 rounded border text-xs text-red-700 overflow-auto">
                      <div className="font-mono">
                        <strong>Error:</strong> {this.state.error.toString()}
                      </div>
                      {this.state.errorInfo && (
                        <div className="mt-2 font-mono">
                          <strong>Component Stack:</strong>
                          <pre className="whitespace-pre-wrap">
                            {this.state.errorInfo.componentStack}
                          </pre>
                        </div>
                      )}
                    </div>
                  </details>
                )}

                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={this.handleRetry}
                    className="w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-700 hover:bg-brand-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500"
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Try Again
                  </button>
                  
                  <button
                    onClick={() => window.location.href = '/'}
                    className="w-full flex justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-slate-700 hover:bg-canvas focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500"
                  >
                    Go Home
                  </button>
                </div>

                {this.state.eventId && (
                  <p className="mt-4 text-xs text-slate-600">
                    Error ID: {this.state.eventId}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Higher-order component for wrapping components with error boundaries
export const withErrorBoundary = (Component, errorBoundaryProps = {}) => {
  const WrappedComponent = (props) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );
  
  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  return WrappedComponent;
};

// Specialized error boundaries for different use cases
export const PageErrorBoundary = ({ children }) => (
  <ErrorBoundary 
    fallbackType="page"
    title="Page Error"
    message="This page encountered an error. Please try refreshing."
  >
    {children}
  </ErrorBoundary>
);

export const ComponentErrorBoundary = ({ children, componentName }) => (
  <ErrorBoundary 
    fallbackType="component"
    title={`${componentName} Error`}
    message={`The ${componentName} component encountered an error.`}
    fallback={(error, retry) => (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 m-4">
        <div className="flex">
          <AlertTriangle className="h-5 w-5 text-red-400" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">
              Component Error
            </h3>
            <p className="text-sm text-red-700 mt-1">
              The {componentName} component failed to load.
            </p>
            <button
              onClick={retry}
              className="mt-2 text-sm bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    )}
  >
    {children}
  </ErrorBoundary>
);

// Async Error Boundary Hook for functional components
import { useState, useEffect } from 'react';

export const useAsyncError = () => {
  const [error, setError] = useState(null);

  useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  const throwError = (error) => {
    setError(error);
  };

  return throwError;
};

// Custom hook for handling async operations with error boundaries
export const useAsyncOperation = () => {
  const throwError = useAsyncError();
  
  const executeAsync = async (asyncOperation) => {
    try {
      return await asyncOperation();
    } catch (error) {
      throwError(error);
    }
  };

  return executeAsync;
};

export default ErrorBoundary;