import React, { useState } from 'react';
import { motion } from 'framer-motion';

const MedicalProcedures = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');

  const procedures = [
    {
      id: 1,
      name: 'Cardiac Catheterization',
      category: 'Cardiology',
      description: 'Minimally invasive procedure to diagnose and treat heart conditions',
      duration: '1-3 hours',
      recovery: '1-2 days',
      icon: '💓',
      image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56',
      features: ['Outpatient Procedure', 'Local Anesthesia', 'Same Day Discharge', 'Minimal Scarring'],
      price: 'Contact for pricing'
    },
    {
      id: 2,
      name: 'MRI Brain Scan',
      category: 'Diagnostic',
      description: 'High-resolution imaging of brain structures and abnormalities',
      duration: '30-60 minutes',
      recovery: 'Immediate',
      icon: '🧠',
      image: 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063',
      features: ['Non-invasive', 'No Radiation', 'Detailed Images', 'Contrast Available'],
      price: '$1,200 - $3,000'
    },
    {
      id: 3,
      name: 'Arthroscopic Surgery',
      category: 'Orthopedics',
      description: 'Minimally invasive joint surgery using tiny cameras',
      duration: '1-2 hours',
      recovery: '2-6 weeks',
      icon: '🦴',
      image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56',
      features: ['Small Incisions', 'Faster Recovery', 'Less Pain', 'Same Day Surgery'],
      price: '$5,000 - $15,000'
    },
    {
      id: 4,
      name: 'Cataract Surgery',
      category: 'Ophthalmology',
      description: 'Remove cloudy lens and replace with artificial intraocular lens',
      duration: '15-30 minutes',
      recovery: '1-2 weeks',
      icon: '👁️',
      image: 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063',
      features: ['Outpatient', 'Local Anesthesia', 'Quick Procedure', 'High Success Rate'],
      price: '$3,500 - $5,000'
    },
    {
      id: 5,
      name: 'Colonoscopy',
      category: 'Gastroenterology',
      description: 'Screening and diagnostic procedure for colon health',
      duration: '30-45 minutes',
      recovery: '24 hours',
      icon: '🔬',
      image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56',
      features: ['Cancer Screening', 'Polyp Removal', 'Sedation Available', 'Preventive Care'],
      price: '$800 - $1,500'
    },
    {
      id: 6,
      name: 'Dental Implants',
      category: 'Dental',
      description: 'Permanent tooth replacement with titanium implants',
      duration: '1-2 hours per implant',
      recovery: '3-6 months',
      icon: '🦷',
      image: 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063',
      features: ['Permanent Solution', 'Natural Look', 'Durable', 'Preserve Bone'],
      price: '$1,500 - $4,000'
    },
    {
      id: 7,
      name: 'CT Angiography',
      category: 'Diagnostic',
      description: 'Non-invasive imaging of blood vessels using CT technology',
      duration: '15-30 minutes',
      recovery: 'Immediate',
      icon: '🫀',
      image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56',
      features: ['Contrast Enhanced', 'Quick Scan', '3D Visualization', 'Heart & Vessels'],
      price: '$1,000 - $2,500'
    },
    {
      id: 8,
      name: 'Laparoscopic Surgery',
      category: 'Surgery',
      description: 'Minimally invasive abdominal surgery with small incisions',
      duration: '1-4 hours',
      recovery: '1-3 weeks',
      icon: '⚕️',
      image: 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063',
      features: ['Small Incisions', 'Less Pain', 'Shorter Stay', 'Faster Healing'],
      price: '$8,000 - $25,000'
    }
  ];

  const categories = ['All', 'Cardiology', 'Diagnostic', 'Orthopedics', 'Ophthalmology', 'Gastroenterology', 'Dental', 'Surgery'];

  const filteredProcedures = selectedCategory === 'All'
    ? procedures
    : procedures.filter(procedure => procedure.category === selectedCategory);

  const getCategoryColor = (category) => {
    const colors = {
      'Cardiology': 'from-red-500 to-red-600',
      'Diagnostic': 'from-blue-500 to-blue-600',
      'Orthopedics': 'from-green-500 to-green-600',
      'Ophthalmology': 'from-purple-500 to-purple-600',
      'Gastroenterology': 'from-yellow-500 to-yellow-600',
      'Dental': 'from-indigo-500 to-indigo-600',
      'Surgery': 'from-pink-500 to-pink-600'
    };
    return colors[category] || 'from-gray-500 to-gray-600';
  };

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
            Medical Procedures & Services
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-600 max-w-3xl mx-auto"
          >
            Advanced medical procedures performed by our expert specialists using
            state-of-the-art technology and minimally invasive techniques
          </motion.p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-2 rounded-full transition duration-300 font-medium ${
                selectedCategory === category
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-600 shadow'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Procedures Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredProcedures.map((procedure, index) => (
            <motion.div
              key={procedure.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition duration-300 transform hover:scale-105"
            >
              {/* Header */}
              <div className={`bg-gradient-to-r ${getCategoryColor(procedure.category)} p-4 text-white`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">{procedure.icon}</span>
                  <span className="text-xs bg-white bg-opacity-20 px-2 py-1 rounded-full">
                    {procedure.category}
                  </span>
                </div>
                <h3 className="text-lg font-bold">{procedure.name}</h3>
              </div>

              {/* Content */}
              <div className="p-6">
                <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                  {procedure.description}
                </p>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-xs text-gray-500 mb-1">Duration</div>
                    <div className="font-semibold text-blue-600 text-sm">{procedure.duration}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-500 mb-1">Recovery</div>
                    <div className="font-semibold text-green-600 text-sm">{procedure.recovery}</div>
                  </div>
                </div>

                {/* Features */}
                <div className="mb-4">
                  <h4 className="font-semibold text-gray-800 text-sm mb-2">Key Features:</h4>
                  <div className="grid grid-cols-2 gap-1">
                    {procedure.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center text-xs text-gray-600">
                        <span className="text-green-500 mr-1 text-xs">✓</span>
                        <span className="truncate">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Price */}
                <div className="bg-gray-50 p-3 rounded-lg mb-4">
                  <div className="text-xs text-gray-500 mb-1">Estimated Cost</div>
                  <div className="font-bold text-gray-800">{procedure.price}</div>
                </div>

                {/* Actions */}
                <div className="flex space-x-2">
                  <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded text-sm font-medium transition duration-300">
                    Learn More
                  </button>
                  <button className="flex-1 border border-blue-600 text-blue-600 hover:bg-blue-50 py-2 px-3 rounded text-sm font-medium transition duration-300">
                    Book Consult
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Insurance Information */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-16 bg-blue-50 border border-blue-200 rounded-xl p-8"
        >
          <div className="text-center">
            <h3 className="text-2xl font-bold text-blue-800 mb-4">
              💳 Insurance & Payment Options
            </h3>
            <p className="text-blue-700 mb-6 max-w-3xl mx-auto">
              We accept most major insurance plans and offer flexible payment options.
              Contact our billing department for pre-authorization and coverage verification.
            </p>
            <div className="flex justify-center space-x-4">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition duration-300">
                Check Insurance Coverage
              </button>
              <button className="border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-6 py-3 rounded-lg transition duration-300">
                Payment Plans Available
              </button>
            </div>
          </div>
        </motion.div>

        {/* Contact CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-12 text-center"
        >
          <h3 className="text-2xl font-bold text-gray-800 mb-4">
            Need Help Choosing the Right Procedure?
          </h3>
          <p className="text-gray-600 mb-6">
            Our medical specialists are here to help you understand your options and make informed decisions.
          </p>
          <button className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg text-lg font-medium transition duration-300 transform hover:scale-105">
            📞 Schedule a Consultation
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default MedicalProcedures;