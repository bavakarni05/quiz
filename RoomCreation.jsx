import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faSignInAlt, faUserShield, faHome } from '@fortawesome/free-solid-svg-icons';
import './RoomCreation.css';

const RoomCreation = () => {
  const navigate = useNavigate();

  const handleCreateRoom = () => {
    navigate('/question-page');
  };

  const handleEnterRoom = () => {
    navigate('/join-room');
  };

  const handleJoinAsHost = () => {
    navigate('/host/join');
  };

  return (
    <div className="app-container">
      {/* Sidebar */}
      <motion.div 
        className="sidebar"
        initial={{ x: -250 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="sidebar-header">
          <FontAwesomeIcon icon={faHome} className="home-icon" />
          <h1>Quiz App</h1>
        </div>
        
        <div className="sidebar-buttons">
          <motion.button 
            className="sidebar-button create-room"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleCreateRoom}
          >
            <FontAwesomeIcon icon={faPlus} className="button-icon" />
            <span>Create Room</span>
          </motion.button>

          <motion.button 
            className="sidebar-button enter-room"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleEnterRoom}
          >
            <FontAwesomeIcon icon={faSignInAlt} className="button-icon" />
            <span>Join as Player</span>
          </motion.button>

          <motion.button 
            className="sidebar-button host-room"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleJoinAsHost}
          >
            <FontAwesomeIcon icon={faUserShield} className="button-icon" />
            <span>Join as Host</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Main Content */}
      <motion.div 
        className="main-content"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="welcome-section">
          <h1>Welcome to Quiz App</h1>
          <p>Create or join a quiz room to get started!</p>
        </div>
      </motion.div>
    </div>
  );
};

export default RoomCreation; 