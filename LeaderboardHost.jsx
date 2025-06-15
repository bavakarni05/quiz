import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getLeaderboard } from '../utils/mockData';
import './Leaderboard.css';

const LeaderboardHost = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [participants, setParticipants] = useState([]);

  useEffect(() => {
    // Get leaderboard data
    setParticipants(getLeaderboard());
  }, []);

  const handleNextQuestion = () => {
    navigate('/quiz-host');
  };

  return (
    <div className="leaderboard-container">
      <h1 className="leaderboard-title">Leaderboard</h1>
      
      <div className="leaderboard-grid">
        <div className="leaderboard-header">
          <span>Rank</span>
          <span>Player</span>
          <span>Score</span>
          <span>Correct</span>
        </div>
        
        {participants.map((participant, index) => (
          <div 
            key={participant.id} 
            className={`leaderboard-row ${index < 3 ? `top-${index + 1}` : ''}`}
          >
            <span className="rank">{index + 1}</span>
            <span className="player-name">{participant.name}</span>
            <span className="score">{participant.score}</span>
            <span className="correct">{participant.correct}</span>
          </div>
        ))}
      </div>

      <button className="next-button" onClick={handleNextQuestion}>
        Continue
      </button>
    </div>
  );
};

export default LeaderboardHost; 