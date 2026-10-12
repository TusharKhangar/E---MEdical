// src/pages/ForgotPassword.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { EnvelopeIcon } from '@heroicons/react/24/outline';
import api from '../services/api';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const validateEmail = () => {
        if (!email) {
            setError('Email is required');
            return false;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError('Enter a valid email address');
            return false;
        }
        setError('');
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateEmail()) return;

        setIsLoading(true);
        try {
            // Spring Boot endpoint that generates a token and emails the reset link
            await api.post('/forgotPassword',  email ,{
                headers: {
                    'Content-Type':'text/plain'
                }
            });
            setSubmitted(true);
            toast.success('If that email exists, a reset link has been sent.');
        } catch (error) {
            const message = error.response?.data || 'Something went wrong. Please try again.';
            toast.error(message);
        } finally {
            setIsLoading(false);
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
                        Forgot your password?
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Enter your email and we'll send you a reset link.
                    </p>
                </div>

                {submitted ? (
                    <div className="bg-white py-8 px-6 shadow-lg rounded-lg text-center space-y-4">
                        <p className="text-gray-700">Check your inbox for a reset link.</p>
                        <Link to="/login" className="inline-block font-medium text-blue-600 hover:text-blue-500">
                            Back to Login
                        </Link>
                    </div>
                ) : (
                    <form className="mt-8 space-y-6 bg-white py-8 px-6 shadow-lg rounded-lg" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                Email address
                            </label>
                            <div className="mt-1 relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    className={`block w-full pl-10 pr-3 py-2 border ${
                                        error ? 'border-red-300' : 'border-gray-300'
                                    } rounded-md shadow-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value);
                                        if (error) setError('');
                                    }}
                                />
                            </div>
                            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            ) : (
                                'Send Reset Link'
                            )}
                        </button>

                        <div className="text-center">
                            <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
                                Back to Login
                            </Link>
                        </div>
                    </form>
                )}
            </motion.div>
        </div>
    );
};

export default ForgotPassword;