import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChalkboardTeacher, faUserGraduate } from '@fortawesome/free-solid-svg-icons';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();

  const handleCreateRoom = () => {
    navigate('/create');
  };

  const handleEnterRoom = () => {
    navigate('/join');
  };

  return (
    <div className="home-container">
      <h1 className="home-title">Interactive Quiz Platform</h1>
      <div className="cards-container">
        <div className="card" onClick={handleCreateRoom}>
          <FontAwesomeIcon icon={faChalkboardTeacher} className="card-icon" />
          <h2>Create Quiz</h2>
          <p>Create an interactive quiz room and engage your audience</p>
        </div>
        <div className="card" onClick={handleEnterRoom}>
          <FontAwesomeIcon icon={faUserGraduate} className="card-icon" />
          <h2>Join Quiz</h2>
          <p>Enter a room code to participate in an active quiz</p>
        </div>
      </div>
    </div>
  );
};

export default Home; 