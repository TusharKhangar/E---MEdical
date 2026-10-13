import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Blog = () => {
  const blogPosts = [
    {
      id: 1,
      title: 'Revolutionary Heart Surgery Techniques',
      excerpt: 'Discover the latest minimally invasive cardiac procedures that are transforming patient outcomes and recovery times.',
      image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56',
      date: 'March 15, 2025',
      author: 'Dr. Sarah Johnson',
      category: 'Cardiology',
      readTime: '5 min read',
      tags: ['Heart Surgery', 'Medical Technology', 'Patient Care']
    },
    {
      id: 2,
      title: 'Mental Health in the Digital Age',
      excerpt: 'How modern technology affects our mental well-being and strategies for maintaining psychological health.',
      image: 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063',
      date: 'March 12, 2025',
      author: 'Dr. Lisa Anderson',
      category: 'Mental Health',
      readTime: '7 min read',
      tags: ['Mental Health', 'Technology', 'Wellness']
    },
    {
      id: 3,
      title: 'Breakthrough in Cancer Treatment',
      excerpt: 'New immunotherapy approaches showing remarkable success rates in treating various forms of cancer.',
      image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56',
      date: 'March 10, 2025',
      author: 'Dr. Michael Chen',
      category: 'Oncology',
      readTime: '6 min read',
      tags: ['Cancer', 'Immunotherapy', 'Research']
    },
    {
      id: 4,
      title: 'Preventive Care: Your First Line of Defense',
      excerpt: 'Understanding the importance of regular check-ups and preventive measures for long-term health.',
      image: 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063',
      date: 'March 8, 2025',
      author: 'Dr. Emily Rodriguez',
      category: 'Preventive Care',
      readTime: '4 min read',
      tags: ['Prevention', 'Health Screening', 'Wellness']
    },
    {
      id: 5,
      title: 'Advanced Diagnostic Imaging',
      excerpt: 'How AI-powered imaging technologies are revolutionizing early disease detection and diagnosis.',
      image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56',
      date: 'March 5, 2025',
      author: 'Dr. Robert Kim',
      category: 'Diagnostic',
      readTime: '8 min read',
      tags: ['Imaging', 'AI', 'Diagnostics']
    },
    {
      id: 6,
      title: 'Nutrition and Longevity',
      excerpt: 'Evidence-based dietary approaches that promote healthy aging and disease prevention.',
      image: 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063',
      date: 'March 3, 2025',
      author: 'Dr. Maria Santos',
      category: 'Nutrition',
      readTime: '6 min read',
      tags: ['Nutrition', 'Longevity', 'Diet']
    }
  ];

  const categories = ['All', 'Cardiology', 'Mental Health', 'Oncology', 'Preventive Care', 'Diagnostic', 'Nutrition'];

  const [selectedCategory, setSelectedCategory] = React.useState('All');

  const filteredPosts = selectedCategory === 'All'
    ? blogPosts
    : blogPosts.filter(post => post.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gray-50">
     
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-bold mb-6"
          >
            RECENT FROM BLOG
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl opacity-90 max-w-3xl mx-auto"
          >
            Stay updated with the latest medical breakthroughs, health tips, and insights from our expert medical team
          </motion.p>
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-8 bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-4">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-2 rounded-full transition duration-300 ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Post */}
      {filteredPosts.length > 0 && (
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl overflow-hidden shadow-lg"
            >
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="p-8">
                  <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm font-medium">
                    Featured Post
                  </span>
                  <h2 className="text-3xl font-bold text-gray-800 mt-4 mb-4">
                    {filteredPosts[0].title}
                  </h2>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {filteredPosts[0].excerpt}
                  </p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500 mb-6">
                    <span>{filteredPosts[0].author}</span>
                    <span>•</span>
                    <span>{filteredPosts[0].date}</span>
                    <span>•</span>
                    <span>{filteredPosts[0].readTime}</span>
                  </div>
                  <Link to="/doctors" className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition duration-300">
                    Talk to a doctor
                  </Link>
                </div>
                <div className="h-64 md:h-full">
                  <img
                    src={filteredPosts[0].image}
                    alt={filteredPosts[0].title}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* Blog Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.slice(1).map((post, index) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition duration-300 transform hover:scale-105"
              >
                <div className="h-48 overflow-hidden">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      post.category === 'Cardiology' ? 'bg-red-100 text-red-600' :
                      post.category === 'Mental Health' ? 'bg-purple-100 text-purple-600' :
                      post.category === 'Oncology' ? 'bg-orange-100 text-orange-600' :
                      post.category === 'Preventive Care' ? 'bg-green-100 text-green-600' :
                      post.category === 'Diagnostic' ? 'bg-blue-100 text-blue-600' :
                      'bg-yellow-100 text-yellow-600'
                    }`}>
                      {post.category}
                    </span>
                    <span className="text-xs text-gray-500">{post.readTime}</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-3 hover:text-blue-600 transition duration-300">
                    {post.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-500">
                      <div>{post.author}</div>
                      <div>{post.date}</div>
                    </div>
                    <Link to="/doctors" className="text-blue-600 hover:text-blue-700 font-medium text-sm transition duration-300">
                      Find a doctor →
                    </Link>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {post.tags.map(tag => (
                      <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Subscription */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto"
          >
            <h2 className="text-3xl font-bold mb-4">Stay Updated with Health Tips</h2>
            <p className="text-xl opacity-90 mb-8">
              Subscribe to our newsletter for the latest medical insights and health advice
            </p>
            <div className="flex flex-col md:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-6 py-3 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-white"
              />
              <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition duration-300">
                Subscribe
              </button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Blog;