import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './GameHostPage.css';

const GameHostPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { roomCode, questions, participants } = location.state || {};
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);
  const [gameStarted, setGameStarted] = useState(false);

  useEffect(() => {
    if (!questions || questions.length === 0) {
      navigate('/');
      return;
    }
  }, [questions, navigate]);

  useEffect(() => {
    if (!gameStarted) return;

    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer);
          setShowLeaderboard(true);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameStarted, currentQuestionIndex]);

  const startQuestion = () => {
    setGameStarted(true);
    setShowLeaderboard(false);
    setTimeLeft(questions[currentQuestionIndex].timeLimit);
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setGameStarted(false);
      setShowLeaderboard(false);
    } else {
      // Game finished
      navigate('/game-finished', { state: { leaderboard } });
    }
  };

  const handleBack = () => {
    if (window.confirm('Are you sure you want to end the game?')) {
      navigate('/');
    }
  };

  const currentQuestion = questions?.[currentQuestionIndex];

  if (!currentQuestion) return null;

  return (
    <div className="game-host-page">
      <button className="back-button" onClick={handleBack}>← Back</button>

      <div className="game-container">
        {!showLeaderboard ? (
          <div className="question-display">
            <div className="game-header">
              <div className="room-info">
                <h2>Room: {roomCode}</h2>
                <p>Question {currentQuestionIndex + 1} of {questions.length}</p>
              </div>
              <div className="timer">
                {timeLeft > 0 ? `${timeLeft}s` : 'Times up!'}
              </div>
            </div>

            <div className="question-content">
              <h1>{currentQuestion.text}</h1>
              <div className="options-grid">
                {currentQuestion.options.map((option, index) => (
                  <div 
                    key={index} 
                    className={`option-box ${currentQuestion.correctAnswer === index ? 'correct' : ''}`}
                  >
                    {option}
                  </div>
                ))}
              </div>
            </div>

            {!gameStarted && (
              <button className="start-question-button" onClick={startQuestion}>
                Start Question
              </button>
            )}
          </div>
        ) : (
          <div className="leaderboard">
            <h2>Leaderboard</h2>
            <div className="leaderboard-list">
              {leaderboard.length > 0 ? (
                leaderboard.slice(0, 5).map((player, index) => (
                  <div key={index} className="leaderboard-item">
                    <span className="rank">#{index + 1}</span>
                    <span className="player-name">{player.username}</span>
                    <span className="score">{player.score} pts</span>
                  </div>
                ))
              ) : (
                <p>Waiting for answers...</p>
              )}
            </div>
            <button className="next-button" onClick={nextQuestion}>
              {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'End Game'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameHostPage; 