import React from 'react';
import Header from '../components/common/Header';
import { motion } from 'framer-motion';

const About = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      
      <div className="container mx-auto px-4 py-16">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">About REMEDIC</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We are committed to providing exceptional healthcare services with the most advanced technology 
            and compassionate care. Your health is our top priority.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
            <p className="text-gray-600 mb-4">
              To provide comprehensive, accessible, and high-quality healthcare services that promote 
              wellness and healing in our community. We strive to be a trusted partner in your health 
              journey, offering personalized care with the latest medical technology.
            </p>
            <p className="text-gray-600">
              Our team of experienced healthcare professionals is dedicated to excellence in patient care, 
              continuous learning, and innovation in medical practices.
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-blue-500 to-purple-600 p-8 rounded-2xl text-white"
          >
            <h3 className="text-2xl font-bold mb-4">Why Choose REMEDIC?</h3>
            <ul className="space-y-3">
              <li className="flex items-center">
                <span className="mr-3">✓</span>
                24/7 Emergency Services
              </li>
              <li className="flex items-center">
                <span className="mr-3">✓</span>
                State-of-the-art Technology
              </li>
              <li className="flex items-center">
                <span className="mr-3">✓</span>
                Experienced Medical Team
              </li>
              <li className="flex items-center">
                <span className="mr-3">✓</span>
                Comprehensive Care
              </li>
              <li className="flex items-center">
                <span className="mr-3">✓</span>
                Patient-Centered Approach
              </li>
            </ul>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Our Values</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="text-4xl mb-4">❤️</div>
              <h3 className="text-xl font-semibold mb-2">Compassion</h3>
              <p className="text-gray-600">We treat every patient with empathy, respect, and dignity.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-xl font-semibold mb-2">Excellence</h3>
              <p className="text-gray-600">We strive for the highest standards in medical care and service.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="text-4xl mb-4">🤝</div>
              <h3 className="text-xl font-semibold mb-2">Integrity</h3>
              <p className="text-gray-600">We act with honesty, transparency, and ethical principles.</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default About;