import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import socketService from '../services/socketService';
import './ParticipantQuizPage.css'; // We'll create this CSS file later

const ParticipantQuizPage = () => {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { username } = location.state || {}; // Get username from navigation state

  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [timer, setTimer] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [quizStatus, setQuizStatus] = useState('loading'); // 'loading', 'active', 'questionEnd', 'completed'
  const [leaderboard, setLeaderboard] = useState([]);
  const [message, setMessage] = useState('');
  const [answeredCorrectly, setAnsweredCorrectly] = useState(null); // true/false/null

  useEffect(() => {
    const socket = socketService.getSocket();

    if (!socket) {
      navigate('/'); // Redirect if socket not connected
      return;
    }

    // Ensure participant rejoins the room on refresh or direct access
    if (!username) {
      const storedUsername = sessionStorage.getItem('participantUsername');
      const storedRoomCode = sessionStorage.getItem('participantRoomCode');
      if (storedUsername && storedRoomCode === roomCode) {
        // Attempt to rejoin as participant
        socket.emit('joinRoom', { roomCode, name: storedUsername }, (response) => {
          if (!response.success) {
            console.error('[ParticipantQuizPage] Failed to rejoin room:', response.error);
            alert(response.error || 'Failed to rejoin room.');
            navigate('/');
          } else {
            console.log('[ParticipantQuizPage] Successfully rejoined room.');
            // Backend should send current question state upon successful rejoin if quiz is active
          }
        });
      } else {
        alert('Username or Room Code not found. Please rejoin the room.');
        navigate('/');
        return;
      }
    } else {
      // If username is from navigation state, ensure it's stored
      sessionStorage.setItem('participantUsername', username);
      sessionStorage.setItem('participantRoomCode', roomCode);
    }


    // Listen for new question event
    socket.on('newQuestion', (data) => {
      console.log('New question received by participant:', data);
      setCurrentQuestion(data.question);
      setQuestionIndex(data.questionIndex);
      setTimer(data.timeLimit);
      setSelectedOption(null); // Reset selected option for new question
      setAnsweredCorrectly(null); // Reset correctness for new question
      setQuizStatus('active');
      setMessage('');
      // setLeaderboard([]); // Clear leaderboard display from previous question
    });

    // Listen for timer updates
    socket.on('timerUpdate', (data) => {
      setTimer(data.timeLeft);
    });

    // Listen for question end (timer over) and leaderboard
    socket.on('questionEnd', (data) => {
      console.log('Question ended, leaderboard received by participant:', data);
      // Navigate to leaderboard page, passing data via state
      navigate(`/player/leaderboard/${roomCode}`, { 
        state: { 
          leaderboard: data.leaderboard, 
          correctAnswer: data.correctAnswer 
        } 
      });
    });

    // Listen for quiz completion
    socket.on('quizCompleted', (data) => {
      console.log('Quiz completed for participant:', data);
      setQuizStatus('completed');
      setLeaderboard(data.finalLeaderboard);
      setMessage('Quiz has ended!');
    });

    // Listen for quiz cancelled
    socket.on('quizCancelled', () => {
      alert('Quiz has been cancelled by the host or host disconnected.');
      navigate('/');
    });

    // Handle potential errors from socket
    socket.on('error', (errorMessage) => {
      console.error('Socket error on ParticipantQuizPage:', errorMessage);
      alert(`Error: ${errorMessage}`);
      navigate('/'); // Redirect to home on critical error
    });

    return () => {
      socket.off('newQuestion');
      socket.off('timerUpdate');
      socket.off('questionEnd');
      socket.off('quizCompleted');
      socket.off('quizCancelled');
      socket.off('error');
    };
  }, [roomCode, navigate, username]);

  const handleSubmitAnswer = (option) => {
    if (selectedOption !== null) { // Prevent multiple submissions
      return;
    }
    setSelectedOption(option); // Freeze screen

    const socket = socketService.getSocket();
    if (socket) {
      socket.emit('submitAnswer', { roomCode, questionIndex, selectedOption: option }, (response) => {
        if (response.success) {
          console.log('Answer submitted:', response.message, 'Correct:', response.isCorrect);
          setAnsweredCorrectly(response.isCorrect);
        } else {
          console.error('Failed to submit answer:', response.message);
          alert(response.message || 'Failed to submit answer.');
          setSelectedOption(null); // Allow re-selection if submission failed
        }
      });
    }
  };

  const getOptionClassName = (option) => {
    let className = "option-item";
    if (selectedOption !== null) {
      className += " selected"; // Apply selected style
      if (answeredCorrectly !== null) {
        if (selectedOption === option) {
          className += answeredCorrectly ? " correct" : " incorrect";
        }
      }
    }
    return className;
  };

  if (quizStatus === 'loading') {
    return <div className="participant-quiz-page">Waiting for quiz to start...</div>;
  }

  if (quizStatus === 'completed') {
    return (
      <div className="participant-quiz-page quiz-completed">
        <h1>Quiz Completed!</h1>
        {/* Leaderboard will be displayed on the LeaderboardPage (final leaderboard) */}
        <p>You can view the final results on the leaderboard page, or navigate back to home.</p>
        <button onClick={() => navigate('/')}>Return to Home</button>
      </div>
    );
  }

  return (
    <div className="participant-quiz-page">
      <h1>Room: {roomCode} - {username}</h1>
      {currentQuestion ? (
        <div className={`quiz-content ${selectedOption !== null ? 'submitted' : ''}`}>
          <div className="question-header">
            <h2>Question {questionIndex + 1}</h2>
            <div className="timer">Time Left: {timer}s</div>
          </div>
          <p className="question-text">{currentQuestion.question}</p>
          <div className="options-container">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                className={getOptionClassName(option)}
                onClick={() => handleSubmitAnswer(option)}
                disabled={selectedOption !== null || timer === 0} // Disable after selection or timer ends
              >
                {option}
              </button>
            ))}
          </div>
          {message && <p className="quiz-message">{message}</p>}
          {/* Leaderboard display removed from here, now handled by LeaderboardPage */}
        </div>
      ) : ( 
        <p>Waiting for the quiz to start...</p>
      )}
    </div>
  );
};

export default ParticipantQuizPage; 