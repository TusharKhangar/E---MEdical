// src/pages/EmailConfirmation.jsx
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircleIcon, XCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import api from '../services/api';

const EmailConfirmation = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'error'
  const [message, setMessage] = useState('');
  const [token, setToken] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const urlToken = searchParams.get('token');

    if (!urlToken) {
      setStatus('error');
      setMessage('No confirmation token provided.');
      return;
    }

    setToken(urlToken);
    confirmEmail(urlToken);
  }, [searchParams]);

  const confirmEmail = async (confirmationToken) => {
    try {
      // Call your Spring Boot confirmation endpoint
      const response = await api.get(`/confirm?token=${confirmationToken}`);

      if (response.status === 200) {
        setStatus('success');
        setMessage('Email confirmed successfully! You can now set your password.');
        // Redirect to password setup after 2 seconds
        setTimeout(() => {
          navigate(`/set-password?token=${confirmationToken}`);
        }, 2000);
      }
    } catch (error) {
      setStatus('error');
      setMessage(error.response?.data?.message || 'Invalid or expired confirmation link.');
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'verifying':
        return (
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        );
      case 'success':
        return <CheckCircleIcon className="h-12 w-12 text-green-500 mx-auto" />;
      case 'error':
        return <XCircleIcon className="h-12 w-12 text-red-500 mx-auto" />;
      default:
        return <ExclamationTriangleIcon className="h-12 w-12 text-yellow-500 mx-auto" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'success': return 'text-green-600';
      case 'error': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full space-y-8"
      >
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Email Confirmation
          </h2>
        </div>

        <div className="bg-white py-8 px-6 shadow-lg rounded-lg">
          <div className="text-center space-y-6">
            {getStatusIcon()}

            <div>
              <h3 className={`text-lg font-medium ${getStatusColor()}`}>
                {status === 'verifying' && 'Verifying your email...'}
                {status === 'success' && 'Email Confirmed!'}
                {status === 'error' && 'Confirmation Failed'}
              </h3>

              <p className="mt-2 text-sm text-gray-600">
                {message}
              </p>
            </div>

            {status === 'error' && (
              <div className="space-y-4">
                <Link
                  to="/register"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Try Registration Again
                </Link>
                <Link
                  to="/login"
                  className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Back to Login
                </Link>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default EmailConfirmation;