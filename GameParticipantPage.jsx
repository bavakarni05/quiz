import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './GameParticipantPage.css';

const GameParticipantPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { roomCode, username } = location.state || {};

  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);
  const [answered, setAnswered] = useState(false);

  // TODO: Implement Socket.IO connection to handle game events

  useEffect(() => {
    if (!roomCode || !username) {
      navigate('/');
    }
  }, [roomCode, username, navigate]);

  const handleAnswerSelect = (index) => {
    if (answered) return;
    setSelectedAnswer(index);
    setAnswered(true);
    // TODO: Send answer to server via Socket.IO
  };

  const handleBack = () => {
    if (window.confirm('Are you sure you want to leave the game?')) {
      navigate('/');
    }
  };

  return (
    <div className="game-participant-page">
      <button className="back-button" onClick={handleBack}>← Back</button>

      <div className="game-container">
        {!showLeaderboard ? (
          <div className="question-section">
            <div className="game-header">
              <div className="player-info">
                <p className="username">{username}</p>
                <p className="room-code">Room: {roomCode}</p>
              </div>
              {timeLeft > 0 && (
                <div className="timer">
                  {timeLeft}s
                </div>
              )}
            </div>

            {currentQuestion ? (
              <>
                <h1 className="question-text">{currentQuestion.text}</h1>
                <div className="options-grid">
                  {currentQuestion.options.map((option, index) => (
                    <button
                      key={index}
                      className={`option-button ${selectedAnswer === index ? 'selected' : ''}`}
                      onClick={() => handleAnswerSelect(index)}
                      disabled={answered}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <div className="waiting-next">
                <h2>Get Ready!</h2>
                <p>Waiting for the next question...</p>
              </div>
            )}
          </div>
        ) : (
          <div className="leaderboard">
            <h2>Top Players</h2>
            <div className="leaderboard-list">
              {leaderboard.slice(0, 5).map((player, index) => (
                <div key={index} className="leaderboard-item">
                  <span className="rank">#{index + 1}</span>
                  <span className="player-name">{player.username}</span>
                  <span className="score">{player.score} pts</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameParticipantPage; 