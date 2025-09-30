// src/components/dashboard/Messages.jsx
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const Messages = () => {
  const { user } = useAuth();

  const [conversations, setConversations] = useState([
    {
      id: 1,
      name: "Dr. John Smith",
      role: "Cardiologist",
      avatar: "👨‍⚕️",
      lastMessage: "The patient's ECG results look concerning. We should schedule a follow-up.",
      timestamp: new Date(Date.now() - 2 * 60 * 1000), // 2 minutes ago
      unread: 2,
      online: true,
      type: "doctor"
    },
    {
      id: 2,
      name: "Sarah Johnson",
      role: "Patient",
      avatar: "👩",
      lastMessage: "Thank you for the prescription. When should I schedule my next appointment?",
      timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
      unread: 1,
      online: false,
      type: "patient"
    },
    {
      id: 3,
      name: "Dr. Emily Brown",
      role: "Neurologist",
      avatar: "👩‍⚕️",
      lastMessage: "The MRI scan has been scheduled for next Tuesday at 2 PM.",
      timestamp: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
      unread: 0,
      online: true,
      type: "doctor"
    },
    {
      id: 4,
      name: "Mike Wilson",
      role: "Patient",
      avatar: "👨",
      lastMessage: "I'm experiencing some side effects from the medication.",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      unread: 3,
      online: false,
      type: "patient"
    },
    {
      id: 5,
      name: "Admin Team",
      role: "System",
      avatar: "🏥",
      lastMessage: "Monthly performance report is ready for review.",
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
      unread: 0,
      online: true,
      type: "admin"
    }
  ]);

  const [selectedConversation, setSelectedConversation] = useState(conversations[0]);
  const [messageText, setMessageText] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [messages, setMessages] = useState([
    {
      id: 1,
      senderId: 1,
      senderName: "Dr. John Smith",
      content: "Hello, I've reviewed the patient's latest test results.",
      timestamp: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
      isOwn: false
    },
    {
      id: 2,
      senderId: "current_user",
      senderName: user?.firstName || "You",
      content: "Thank you for the update. What are your findings?",
      timestamp: new Date(Date.now() - 58 * 60 * 1000), // 58 minutes ago
      isOwn: true
    },
    {
      id: 3,
      senderId: 1,
      senderName: "Dr. John Smith",
      content: "The patient's ECG results look concerning. We should schedule a follow-up appointment within the next few days to monitor the situation closely.",
      timestamp: new Date(Date.now() - 2 * 60 * 1000), // 2 minutes ago
      isOwn: false
    }
  ]);

  const formatTime = (timestamp) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now - timestamp) / (1000 * 60));

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return timestamp.toLocaleDateString();
  };

  const formatMessageTime = (timestamp) => {
    return timestamp.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const sendMessage = () => {
    if (messageText.trim() === "") return;

    const newMessage = {
      id: messages.length + 1,
      senderId: "current_user",
      senderName: user?.firstName || "You",
      content: messageText,
      timestamp: new Date(),
      isOwn: true
    };

    setMessages([...messages, newMessage]);
    setMessageText("");

    // Update conversation's last message
    setConversations(prev =>
      prev.map(conv =>
        conv.id === selectedConversation.id
          ? { ...conv, lastMessage: messageText, timestamp: new Date() }
          : conv
      )
    );
  };

  const markAsRead = (conversationId) => {
    setConversations(prev =>
      prev.map(conv =>
        conv.id === conversationId
          ? { ...conv, unread: 0 }
          : conv
      )
    );
  };

  const filteredConversations = conversations.filter(conv =>
    conv.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalUnreadMessages = conversations.reduce((sum, conv) => sum + conv.unread, 0);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
            <p className="text-gray-600 mt-1">
              {totalUnreadMessages > 0
                ? `${totalUnreadMessages} unread messages`
                : "All messages read"
              }
            </p>
          </div>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
            <span>✉️</span>
            <span>New Message</span>
          </button>
        </div>
      </div>

      {/* Messages Interface */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-96 flex">

        {/* Conversations List */}
        <div className="w-1/3 border-r border-gray-200 flex flex-col">
          {/* Search */}
          <div className="p-4 border-b border-gray-200">
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Conversation List */}
          <div className="flex-1 overflow-y-auto">
            {filteredConversations.map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => {
                  setSelectedConversation(conversation);
                  markAsRead(conversation.id);
                }}
                className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors border-b border-gray-100 ${
                  selectedConversation.id === conversation.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <div className="relative">
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-xl">
                        {conversation.avatar}
                      </div>
                      {conversation.online && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-gray-900 truncate">{conversation.name}</h4>
                        {conversation.unread > 0 && (
                          <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                            {conversation.unread}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">{conversation.role}</p>
                      <p className="text-sm text-gray-700 truncate mt-1">{conversation.lastMessage}</p>
                      <p className="text-xs text-gray-400 mt-1">{formatTime(conversation.timestamp)}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Message Thread */}
        <div className="flex-1 flex flex-col">
          {/* Message Header */}
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-lg">
                  {selectedConversation.avatar}
                </div>
                {selectedConversation.online && (
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                )}
              </div>
              <div>
                <h3 className="font-medium text-gray-900">{selectedConversation.name}</h3>
                <p className="text-sm text-gray-500">
                  {selectedConversation.online ? 'Online' : `Last seen ${formatTime(selectedConversation.timestamp)}`}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button className="p-2 hover:bg-gray-100 rounded-lg">📞</button>
              <button className="p-2 hover:bg-gray-100 rounded-lg">🎥</button>
              <button className="p-2 hover:bg-gray-100 rounded-lg">ℹ️</button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.isOwn
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}>
                  <p className="text-sm">{message.content}</p>
                  <p className={`text-xs mt-1 ${
                    message.isOwn ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {formatMessageTime(message.timestamp)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Message Input */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center space-x-2">
              <button className="p-2 hover:bg-gray-100 rounded-lg">📎</button>
              <input
                type="text"
                placeholder="Type your message..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button className="p-2 hover:bg-gray-100 rounded-lg">😊</button>
              <button
                onClick={sendMessage}
                disabled={messageText.trim() === ""}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  messageText.trim() === ""
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Message Statistics */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Messages</p>
              <p className="text-2xl font-bold text-gray-900">
                {conversations.length}
              </p>
            </div>
            <div className="text-2xl">💬</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Unread</p>
              <p className="text-2xl font-bold text-red-600">{totalUnreadMessages}</p>
            </div>
            <div className="text-2xl">🔔</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Online Now</p>
              <p className="text-2xl font-bold text-green-600">
                {conversations.filter(c => c.online).length}
              </p>
            </div>
            <div className="text-2xl">🟢</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Response Time</p>
              <p className="text-2xl font-bold text-blue-600">2.5m</p>
            </div>
            <div className="text-2xl">⚡</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;