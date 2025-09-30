import React from 'react';
import { motion } from 'framer-motion';

const EmergencyServices = () => {
  const emergencyServices = [
    {
      title: '24/7 Emergency Room',
      description: 'Fully equipped emergency department with trauma specialists',
      icon: '🚨',
      features: ['Immediate Care', 'Trauma Team', 'Critical Care', 'Fast Track'],
      color: 'from-red-500 to-red-600'
    },
    {
      title: 'Ambulance Service',
      description: 'Advanced life support ambulances with paramedics',
      icon: '🚑',
      features: ['Life Support', 'Quick Response', '24/7 Available', 'GPS Tracked'],
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Cardiac Emergency',
      description: 'Specialized cardiac emergency and intervention unit',
      icon: '💓',
      features: ['Heart Attack Care', 'Angioplasty', 'Pacemaker', 'CCU'],
      color: 'from-pink-500 to-pink-600'
    },
    {
      title: 'Stroke Unit',
      description: 'Rapid stroke assessment and treatment protocols',
      icon: '🧠',
      features: ['Clot Removal', 'Brain Imaging', 'Neuro Team', 'Rehab Planning'],
      color: 'from-purple-500 to-purple-600'
    }
  ];

  const emergencyNumbers = [
    { service: 'Emergency Hotline', number: '911', icon: '📞' },
    { service: 'Ambulance Direct', number: '+1 (555) 911-0000', icon: '🚑' },
    { service: 'Poison Control', number: '+1 (800) 222-1222', icon: '☠️' },
    { service: 'Mental Health Crisis', number: '+1 (988) 123-4567', icon: '🧠' }
  ];

  const emergencyTips = [
    {
      situation: 'Heart Attack',
      symptoms: ['Chest pain', 'Shortness of breath', 'Nausea', 'Sweating'],
      action: 'Call 911 immediately. Chew aspirin if available.',
      icon: '💔'
    },
    {
      situation: 'Stroke',
      symptoms: ['Face drooping', 'Arm weakness', 'Speech difficulty', 'Time critical'],
      action: 'Remember FAST. Call emergency services now.',
      icon: '🧠'
    },
    {
      situation: 'Severe Bleeding',
      symptoms: ['Heavy blood loss', 'Deep cuts', 'Arterial bleeding'],
      action: 'Apply direct pressure. Elevate if possible.',
      icon: '🩸'
    },
    {
      situation: 'Choking',
      symptoms: ['Cannot speak', 'Cannot breathe', 'Blue lips'],
      action: 'Perform Heimlich maneuver. Call for help.',
      icon: '🫁'
    }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold text-gray-800 mb-4"
          >
            Emergency Services
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-600 max-w-3xl mx-auto"
          >
            When every second counts, trust our emergency medical team to provide
            immediate, life-saving care 24 hours a day, 7 days a week
          </motion.p>
        </div>

        {/* Emergency Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {emergencyServices.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition duration-300 transform hover:scale-105"
            >
              <div className={`bg-gradient-to-r ${service.color} p-6 text-white text-center`}>
                <div className="text-4xl mb-3">{service.icon}</div>
                <h3 className="text-xl font-bold">{service.title}</h3>
              </div>
              <div className="p-6">
                <p className="text-gray-600 mb-4">{service.description}</p>
                <ul className="space-y-2">
                  {service.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center text-sm text-gray-700">
                      <span className="text-green-500 mr-2">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Emergency Contact Numbers */}
        <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-8 mb-16">
          <h3 className="text-2xl font-bold text-red-800 mb-6 text-center">
            🚨 Emergency Contact Numbers
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {emergencyNumbers.map((contact, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white p-4 rounded-lg shadow text-center"
              >
                <div className="text-2xl mb-2">{contact.icon}</div>
                <h4 className="font-semibold text-gray-800 mb-1">{contact.service}</h4>
                <a href={`tel:${contact.number}`} className="text-red-600 font-bold text-lg hover:text-red-700">
                  {contact.number}
                </a>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Emergency Tips */}
        <div className="mb-16">
          <h3 className="text-3xl font-bold text-gray-800 mb-8 text-center">
            Emergency Response Tips
          </h3>
          <div className="grid md:grid-cols-2 gap-8">
            {emergencyTips.map((tip, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-orange-500"
              >
                <div className="flex items-center mb-4">
                  <span className="text-3xl mr-3">{tip.icon}</span>
                  <h4 className="text-xl font-bold text-gray-800">{tip.situation}</h4>
                </div>
                <div className="mb-4">
                  <h5 className="font-semibold text-gray-700 mb-2">Symptoms:</h5>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {tip.symptoms.map((symptom, idx) => (
                      <li key={idx} className="flex items-center">
                        <span className="text-red-500 mr-2">•</span>
                        {symptom}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-orange-50 p-3 rounded-lg">
                  <h5 className="font-semibold text-orange-800 mb-1">Action:</h5>
                  <p className="text-orange-700 text-sm">{tip.action}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Emergency Preparation */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-50 rounded-xl p-8 text-center"
        >
          <h3 className="text-3xl font-bold text-blue-800 mb-4">
            Be Prepared for Emergencies
          </h3>
          <p className="text-blue-700 mb-6 max-w-3xl mx-auto">
            Download our Emergency App for quick access to medical records,
            emergency contacts, and direct connection to our emergency services.
          </p>
          <div className="flex justify-center space-x-4">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition duration-300">
              📱 Download Emergency App
            </button>
            <button className="border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-6 py-3 rounded-lg transition duration-300">
              📋 Emergency Checklist
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default EmergencyServices;