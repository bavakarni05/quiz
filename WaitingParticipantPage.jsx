import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import socketService from '../services/socketService';
import { useQuiz } from '../contexts/QuizContext.jsx';
import './WaitingParticipantPage.css';

const WaitingParticipantPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { roomCode, username } = location.state || {};
  const { setQuizData } = useQuiz();

  useEffect(() => {
    console.log('[WaitingParticipantPage] Component mounted. roomCode:', roomCode, 'username:', username);

    const socket = socketService.getSocket();

    if (!socket || !roomCode || !username) {
      console.log('[WaitingParticipantPage] Missing socket, roomCode, or username. Navigating to home.');
      navigate('/'); // Redirect if essential data is missing
      return;
    }

    // Set roomCode and username in QuizContext for the participant
    setQuizData(prev => ({ ...prev, roomCode: roomCode, username: username }));

    // Listen for quiz starting event from the host
    socket.on('quizStarting', (data) => {
      console.log('[WaitingParticipantPage] Quiz starting event received:', data);
      setQuizData(prev => ({ 
        ...prev, 
        totalQuestions: data.totalQuestions, 
        message: data.message // Store any starting message
      }));
      navigate(`/player/quiz/${roomCode}`, { state: { username } });
    });

    // Handle if host cancels the quiz
    socket.on('quizCancelled', () => {
      console.log('[WaitingParticipantPage] Quiz cancelled event received.');
      alert('The host has cancelled the quiz.');
      navigate('/');
    });

    return () => {
      // Clean up socket listeners on component unmount
      console.log('[WaitingParticipantPage] Cleaning up socket listeners.');
      socket.off('quizStarting');
      socket.off('quizCancelled');
    };
  }, [roomCode, username, navigate, location.state, setQuizData]);

  const handleBack = () => {
    if (window.confirm('Are you sure you want to leave the game?')) {
      const socket = socketService.getSocket();
      if (socket) {
        // Optionally, emit a 'leaveRoom' event to inform the backend
        // socket.emit('leaveRoom', { roomCode, username });
      }
      navigate('/');
    }
  };

  return (
    <div className="waiting-participant-page">
      <button className="back-button" onClick={handleBack}>← Back</button>

      <div className="waiting-container">
        <div className="room-info">
          <h2>Room Code: {roomCode}</h2>
          <p className="username">Playing as: {username}</p>
        </div>

        <div className="waiting-animation">
          <div className="loading-circle"></div>
          <div className="loading-circle"></div>
          <div className="loading-circle"></div>
        </div>

        <h1>Welcome to the Quiz!</h1>
        <p>Wait till the host starts the quiz.</p>
        
        <div className="rules-section">
          <h3>Quiz Rules:</h3>
          <ul>
            <li>Answer questions as quickly as possible to earn more points.</li>
            <li>Points are awarded based on correctness and speed.</li>
            <li>Do not refresh the page during the quiz, or you might lose your progress.</li>
            <li>Good luck and have fun!</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default WaitingParticipantPage; 