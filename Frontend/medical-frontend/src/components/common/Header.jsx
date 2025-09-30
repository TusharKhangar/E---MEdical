import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AppointmentModal from '../modals/AppointmentModal';

const Header = () => {
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleAppointmentClick = () => {
    if (isAuthenticated) {
      setShowAppointmentModal(true);
    } else {
      navigate('/login', { state: { redirectTo: '/appointment' } });
    }
  };

  return (
    <>
      <header className="bg-white shadow-md sticky top-0 z-40">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="text-2xl text-blue-600">🏥</div>
              <span className="text-2xl font-bold text-gray-800">
                RE<span className="text-blue-600">MEDIC</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex space-x-8">
              <Link
                to="/"
                className="text-gray-600 hover:text-blue-600 transition duration-300 font-medium"
              >
                Home
              </Link>
              <Link
                to="/about"
                className="text-gray-600 hover:text-blue-600 transition duration-300 font-medium"
              >
                About
              </Link>
              <Link
                to="/departments"
                className="text-gray-600 hover:text-blue-600 transition duration-300 font-medium"
              >
                Departments
              </Link>
              <Link
                to="/doctors"
                className="text-gray-600 hover:text-blue-600 transition duration-300 font-medium"
              >
                Doctors
              </Link>
              <Link
                to="/blog"
                className="text-gray-600 hover:text-blue-600 transition duration-300 font-medium"
              >
                Blog
              </Link>
              <Link
                to="/contact"
                className="text-gray-600 hover:text-blue-600 transition duration-300 font-medium"
              >
                Contact
              </Link>
            </nav>

            {/* Auth Buttons & Actions */}
            <div className="flex items-center space-x-4">
              {isAuthenticated? (
                <>
                  <Link
                    to="/dashboard"
                    className="hidden md:block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition duration-300 font-medium"
                  >
                    Dashboard
                  </Link>
                  <div className="hidden md:block text-sm text-gray-600">
                    Welcome, <span className="font-semibold">{user?.fullName || user?.email}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition duration-300 font-medium"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="hidden md:block text-gray-600 hover:text-blue-600 transition duration-300 font-medium"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="hidden md:block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition duration-300 font-medium"
                  >
                    Register
                  </Link>
                </>
              )}

              {/* Appointment Button */}
              <button
                onClick={handleAppointmentClick}
                className="bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white px-6 py-2 rounded-full transition duration-300 font-medium transform hover:scale-105 shadow-lg"
              >
                Make an Appointment
              </button>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden text-gray-600 hover:text-blue-600 transition duration-300"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="lg:hidden border-t border-gray-200 py-4">
              <nav className="flex flex-col space-y-4">
                <Link
                  to="/"
                  className="text-gray-600 hover:text-blue-600 transition duration-300 font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Home
                </Link>
                <Link
                  to="/about"
                  className="text-gray-600 hover:text-blue-600 transition duration-300 font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  About
                </Link>
                <Link
                  to="/departments"
                  className="text-gray-600 hover:text-blue-600 transition duration-300 font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Departments
                </Link>
                <Link
                  to="/doctors"
                  className="text-gray-600 hover:text-blue-600 transition duration-300 font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Doctors
                </Link>
                <Link
                  to="/blog"
                  className="text-gray-600 hover:text-blue-600 transition duration-300 font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Blog
                </Link>
                <Link
                  to="/contact"
                  className="text-gray-600 hover:text-blue-600 transition duration-300 font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Contact
                </Link>

                {/* Mobile Auth Links */}
                {isAuthenticated ? (
                  <>
                    <Link
                      to="/dashboard"
                      className="text-gray-600 hover:text-blue-600 transition duration-300 font-medium"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="text-red-500 hover:text-red-600 transition duration-300 font-medium text-left"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="text-gray-600 hover:text-blue-600 transition duration-300 font-medium"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      className="text-blue-600 hover:text-blue-700 transition duration-300 font-medium"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Register
                    </Link>
                  </>
                )}
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Emergency Banner */}
      <div className="bg-red-600 text-white text-center py-2 text-sm">
        <span className="font-semibold">🚨 Emergency? Call 911 or </span>
        <a href="tel:+15559110000" className="underline hover:no-underline">
          +1 (555) 911-0000
        </a>
        <span> - Available 24/7</span>
      </div>

      {/* Appointment Modal */}
      <AppointmentModal
        isOpen={showAppointmentModal}
        onClose={() => setShowAppointmentModal(false)}
      />
    </>
  );
};

export default Header;