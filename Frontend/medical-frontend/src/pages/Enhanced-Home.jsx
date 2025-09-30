import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from '../components/common/Header';

const Home = () => {
  const [selectedDepartment, setSelectedDepartment] = useState(0);

  const departments = [
    {
      id: 1,
      name: 'Cardiology',
      icon: '💓',
      description: 'Comprehensive heart care and cardiovascular treatments with state-of-the-art equipment and experienced cardiologists.',
      color: '#e91e63'
    },
    {
      id: 2,
      name: 'Neurology',
      icon: '🧠',
      description: 'Advanced neurological care and brain treatments including diagnosis and treatment of nervous system disorders.',
      color: '#3f51b5'
    },
    {
      id: 3,
      name: 'Diagnostic',
      icon: '🔬',
      description: 'State-of-the-art diagnostic and imaging services including MRI, CT scan, X-ray, and laboratory tests.',
      color: '#4caf50'
    },
    {
      id: 4,
      name: 'Dental',
      icon: '🦷',
      description: 'Complete dental care and oral health services including general dentistry, orthodontics, and oral surgery.',
      color: '#ff9800'
    },
    {
      id: 5,
      name: 'Ophthalmology',
      icon: '👁️',
      description: 'Comprehensive eye care and vision services including cataract surgery, retinal treatments, and vision correction.',
      color: '#9c27b0'
    },
    {
      id: 6,
      name: 'Emergency',
      icon: '🚨',
      description: '24/7 emergency medical care and services with fully equipped trauma center and emergency specialists.',
      color: '#f44336'
    }
  ];

  const services = [
    {
      name: 'Laboratory Services',
      description: 'Advanced diagnostic testing with quick and accurate results.',
      icon: '🔬'
    },
    {
      name: 'General Treatment',
      description: 'Comprehensive primary care for all your health needs.',
      icon: '🏥'
    },
    {
      name: 'Emergency Service',
      description: '24/7 emergency care with specialized trauma team.',
      icon: '🚨'
    },
    {
      name: '24/7 Help & Support',
      description: 'Round-the-clock patient support and medical assistance.',
      icon: '📞'
    }
  ];

  // New Medical Services Cards
  const medicalServices = [
    {
      title: 'Preventive Care',
      description: 'Regular checkups and screenings to prevent illness',
      icon: '🛡️',
      features: ['Annual Health Checkups', 'Vaccination Programs', 'Health Screenings', 'Lifestyle Counseling']
    },
    {
      title: 'Specialized Surgery',
      description: 'Advanced surgical procedures with latest technology',
      icon: '⚕️',
      features: ['Minimally Invasive Surgery', 'Robotic Surgery', 'Day Care Surgery', 'Post-op Recovery']
    },
    {
      title: 'Mental Health',
      description: 'Comprehensive mental health and wellness services',
      icon: '🧘‍♀️',
      features: ['Psychology Services', 'Stress Management', 'Therapy Sessions', 'Wellness Programs']
    },
    {
      title: 'Maternity Care',
      description: 'Complete care for mothers and newborns',
      icon: '👶',
      features: ['Prenatal Care', 'Delivery Services', 'Postnatal Care', 'Newborn Care']
    }
  ];

  // New Health Tips Cards
  const healthTips = [
    {
      title: 'Heart Health',
      tip: 'Exercise for 30 minutes daily to keep your heart strong',
      icon: '❤️',
      category: 'Cardiology'
    },
    {
      title: 'Mental Wellness',
      tip: 'Practice meditation for 10 minutes daily to reduce stress',
      icon: '🧠',
      category: 'Mental Health'
    },
    {
      title: 'Nutrition',
      tip: 'Include 5 servings of fruits and vegetables in your daily diet',
      icon: '🥗',
      category: 'General Health'
    },
    {
      title: 'Sleep Quality',
      tip: 'Get 7-8 hours of quality sleep for better health and recovery',
      icon: '😴',
      category: 'Wellness'
    }
  ];

  // Enhanced Statistics
  const statistics = [
    { number: '500+', label: 'Happy Patients', icon: '😊' },
    { number: '50+', label: 'Expert Doctors', icon: '👨‍⚕️' },
    { number: '15+', label: 'Years Experience', icon: '🏆' },
    { number: '24/7', label: 'Emergency Care', icon: '🚨' }
  ];

  // New Testimonials Data
  const testimonials = [
    {
      name: 'Sarah Williams',
      role: 'Patient',
      text: 'The cardiac team at REMEDIC saved my life. Their expertise and care exceeded all expectations.',
      rating: 5,
      avatar: '👩‍💼'
    },
    {
      name: 'Michael Johnson',
      role: 'Patient',
      text: 'Outstanding service and professional staff. The diagnostic center is world-class.',
      rating: 5,
      avatar: '👨‍💼'
    },
    {
      name: 'Emily Chen',
      role: 'Patient',
      text: 'The maternity care was exceptional. Thank you for making our experience so special.',
      rating: 5,
      avatar: '👩‍🎓'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
       {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url("https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3")',
            filter: 'brightness(0.4)'
          }}
        ></div>
        <div className="hero-overlay absolute inset-0"></div>
        <div className="relative z-10 text-center text-white px-4">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-6xl font-bold mb-6"
          >
            THE MOST VALUABLE<br />
            THING IS YOUR HEALTH
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl mb-8 max-w-2xl mx-auto"
          >
            We care about your health. Advanced medical technology meets compassionate care
            for comprehensive healthcare solutions.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="space-x-4"
          >
            <Link
              to="/departments"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-lg text-lg transition duration-300 transform hover:scale-105"
            >
              Explore Departments
            </Link>
            <Link
              to="/appointment"
              className="inline-block bg-pink-600 hover:bg-pink-700 text-white font-bold py-4 px-8 rounded-lg text-lg transition duration-300 transform hover:scale-105"
            >
              Book Appointment
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">SOME FUN FACTS</h2>
            <p className="text-xl opacity-90">Numbers that speak for our excellence</p>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            {statistics.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-5xl mb-4">{stat.icon}</div>
                <div className="text-4xl font-bold mb-2">{stat.number}</div>
                <div className="text-lg opacity-90">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Departments Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row rounded-2xl overflow-hidden shadow-2xl">
            {/* Sidebar */}
            <div className="lg:w-1/3 bg-blue-600 text-white p-8">
              <h3 className="text-2xl font-bold mb-6">Medical Departments</h3>
              <div className="space-y-2">
                {departments.map((dept, index) => (
                  <motion.div
                    key={dept.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`flex items-center p-4 rounded-lg cursor-pointer transition duration-300 ${
                      selectedDepartment === index ? 'bg-blue-700' : 'hover:bg-blue-700'
                    }`}
                    onClick={() => setSelectedDepartment(index)}
                  >
                    <span className="text-2xl mr-4">{dept.icon}</span>
                    <span className="font-semibold">{dept.name}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="lg:w-2/3 p-12 bg-gray-50">
              <motion.div
                key={selectedDepartment}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center"
              >
                <div className="text-6xl mb-6">{departments[selectedDepartment].icon}</div>
                <h2 className="text-3xl font-bold text-gray-800 mb-6">
                  {departments[selectedDepartment].name} Department
                </h2>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {departments[selectedDepartment].description}
                </p>
                <p className="text-gray-600 mb-8 leading-relaxed">
                  Our specialized team uses cutting-edge technology and evidence-based practices
                  to deliver exceptional patient care. We are committed to your health and recovery
                  with personalized treatment plans.
                </p>
                <button
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300 transform hover:scale-105"
                  style={{ backgroundColor: departments[selectedDepartment].color }}
                >
                  Learn More
                </button>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Medical Services Section */}
      <section className="py-20 bg-gray-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Comprehensive Medical Services</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We offer a wide range of specialized medical services designed to meet all your healthcare needs
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {medicalServices.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition duration-300 transform hover:scale-105"
              >
                <div className="text-4xl mb-4">{service.icon}</div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">{service.title}</h3>
                <p className="text-gray-600 mb-4">{service.description}</p>
                <ul className="space-y-2">
                  {service.features.map((feature, idx) => (
                    <li key={idx} className="text-sm text-gray-500 flex items-center">
                      <span className="text-green-500 mr-2">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Health Tips Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Daily Health Tips</h2>
            <p className="text-xl text-gray-600">Simple tips for a healthier lifestyle</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {healthTips.map((tip, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-xl border border-blue-100 hover:shadow-lg transition duration-300"
              >
                <div className="flex items-center mb-3">
                  <span className="text-3xl mr-3">{tip.icon}</span>
                  <div>
                    <h4 className="font-semibold text-gray-800">{tip.title}</h4>
                    <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">{tip.category}</span>
                  </div>
                </div>
                <p className="text-gray-600 text-sm">{tip.tip}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Services Grid */}
      <section className="py-20 bg-gray-100">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition duration-300 transform hover:scale-105"
              >
                <div className="flex items-center mb-4">
                  <div className="bg-blue-100 p-3 rounded-lg mr-4">
                    <span className="text-blue-600 text-2xl">{service.icon}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {service.name}
                  </h3>
                </div>
                <p className="text-gray-600">
                  {service.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">TESTIMONIALS</h2>
            <p className="text-xl text-gray-600">What our patients say about us</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
                className="bg-gray-50 p-8 rounded-xl shadow-md hover:shadow-lg transition duration-300"
              >
                <div className="flex items-center mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-4">
                    <span className="text-white text-2xl">{testimonial.avatar}</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">{testimonial.name}</h4>
                    <p className="text-gray-500 text-sm">{testimonial.role}</p>
                    <div className="flex text-yellow-400">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <span key={i}>⭐</span>
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-gray-600 italic">"{testimonial.text}"</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Doctors Section */}
      <section className="py-20 bg-gray-100">
        <div className="container mx-auto px-4 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold text-gray-800 mb-4"
          >
            OUR EXPERIENCED DOCTORS
          </motion.h2>
          <p className="text-xl text-gray-600 mb-12">Meet our team of medical experts</p>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: 'Dr. Sarah Johnson', specialty: 'Cardiologist', experience: '15 years', icon: '👩‍⚕️' },
              { name: 'Dr. Michael Chen', specialty: 'Neurologist', experience: '12 years', icon: '👨‍⚕️' },
              { name: 'Dr. Emily Rodriguez', specialty: 'Pediatrician', experience: '10 years', icon: '👩‍⚕️' }
            ].map((doctor, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
                className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition duration-300"
              >
                <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-white text-4xl">{doctor.icon}</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{doctor.name}</h3>
                <p className="text-blue-600 font-medium mb-2">{doctor.specialty}</p>
                <p className="text-gray-600 mb-4">{doctor.experience} experience</p>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition duration-300">
                  View Profile
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">REMEDIC</h3>
              <p className="text-gray-300 mb-4">Your health is our priority. We provide comprehensive medical care with the latest technology and experienced professionals.</p>
              <div className="flex space-x-4">
                <span className="text-2xl cursor-pointer hover:text-blue-400">📘</span>
                <span className="text-2xl cursor-pointer hover:text-blue-400">📱</span>
                <span className="text-2xl cursor-pointer hover:text-red-400">📺</span>
                <span className="text-2xl cursor-pointer hover:text-blue-300">🐦</span>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><Link to="/about" className="text-gray-300 hover:text-white transition duration-300">About Us</Link></li>
                <li><Link to="/departments" className="text-gray-300 hover:text-white transition duration-300">Departments</Link></li>
                <li><Link to="/doctors" className="text-gray-300 hover:text-white transition duration-300">Doctors</Link></li>
                <li><Link to="/contact" className="text-gray-300 hover:text-white transition duration-300">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Services</h4>
              <ul className="space-y-2">
                <li className="text-gray-300">Emergency Care</li>
                <li className="text-gray-300">Laboratory Services</li>
                <li className="text-gray-300">Surgical Procedures</li>
                <li className="text-gray-300">Health Consultations</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact Info</h4>
              <div className="space-y-2 text-gray-300">
                <p>📍 123 Medical Street, Health City</p>
                <p>📞 +1 (555) 123-4567</p>
                <p>✉️ info@remedic.com</p>
                <p>🚨 Emergency: 911</p>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-300">
            <p>&copy; 2025 REMEDIC Medical System. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;