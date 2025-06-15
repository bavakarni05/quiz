import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import socketService from '../services/socketService';
import './HostQuizPage.css'; // We'll create this CSS file later

const HostQuizPage = () => {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [timer, setTimer] = useState(0);
  const [answersCount, setAnswersCount] = useState({});
  const [leaderboard, setLeaderboard] = useState([]);
  const [quizStatus, setQuizStatus] = useState('loading');

  useEffect(() => {
    console.log('[HostQuizPage] useEffect triggered.');
    console.log('  Current roomCode (params): ', roomCode);
    console.log('  Current quizStatus: ', quizStatus);

    const socket = socketService.getSocket();

    if (!socket) {
      console.log('[HostQuizPage] Socket not connected, navigating to home.');
      navigate('/'); // Redirect if socket not connected
      return;
    }

    // Derive hostPin directly at the beginning of the effect
    const hostPin = location.state?.hostPin || sessionStorage.getItem('hostPin');
    const storedRoomCode = sessionStorage.getItem('hostRoomCode');
    console.log('  hostPin (derived): ', hostPin);
    console.log('  storedRoomCode: ', storedRoomCode);

    // Host joins the quiz room using the hostPin for persistence
    if (roomCode && hostPin && storedRoomCode === roomCode) {
      console.log('[HostQuizPage] Attempting to join as host...');
      socket.emit('joinAsHost', { roomCode, hostPin }, (response) => {
        if (!response.success) {
          console.error('[HostQuizPage] Failed to join as host on quiz page:', response.message);
          alert(response.message || 'Failed to join quiz as host. Please check room code and PIN.');
          navigate('/');
        } else {
          console.log('[HostQuizPage] Successfully joined as host with PIN.');
          setQuizStatus('active'); // Assume active once successfully joined as host
          console.log('[HostQuizPage] quizStatus set to active after joinAsHost success.');
          // Upon successful re-join, the backend should send the current quiz state
          // via `newQuestion` or `quizStarting` events if the quiz is ongoing.
          // If the quiz is completed, `quizCompleted` should be triggered.
        }
      });
    } else {
      console.warn('[HostQuizPage] Host PIN or roomCode mismatch/not found, cannot re-establish host session.');
      console.log('[HostQuizPage] Debugging Host PIN issue:');
      console.log('  location.state?.hostPin:', location.state?.hostPin);
      console.log('  sessionStorage.getItem(\'hostPin\'):', sessionStorage.getItem('hostPin'));
      console.log('  roomCode (from URL params):', roomCode);
      console.log('  storedRoomCode (from sessionStorage):', storedRoomCode);
      alert('Host PIN or room code not found/matched. Please rejoin via waiting room or create a new quiz.');
      navigate('/');
      return;
    }

    // Listen for quiz starting event
    socket.on('quizStarting', (data) => {
      console.log('Quiz starting for host (event received):', data);
      setQuizStatus('active');
      console.log('[HostQuizPage] quizStatus set to active by quizStarting event.');
      // No initial question data here, backend will send `newQuestion`
    });

    // Listen for new question event
    socket.on('newQuestion', (data) => {
      console.log('New question received by host (event received):', data);
      setCurrentQuestion(data.question);
      setQuestionIndex(data.questionIndex);
      setTimer(data.timeLimit);
      setAnswersCount({}); // Reset answers count for new question
      // setLeaderboard([]); // Removed: Clear leaderboard for new question
      console.log('[HostQuizPage] Current question and timer updated.');
    });

    // Listen for timer updates
    socket.on('timerUpdate', (data) => {
        // console.log('Timer update received:', data.timeLeft); // Too verbose
        setTimer(data.timeLeft);
    });

    // Listen for participant answer updates
    socket.on('updateAnswers', (data) => {
      console.log('Host received answer update:', data);
      console.log('Updated answersCount on HostQuizPage:', data.answersCount);
      setAnswersCount(data.answersCount);
    });

    // Listen for question end (timer over) and leaderboard
    socket.on('questionEnd', (data) => {
      console.log('Question ended, leaderboard received by host:', data);
      // Navigate to leaderboard page, passing data via state
      navigate(`/host/leaderboard/${roomCode}`, { 
        state: { 
          leaderboard: data.leaderboard, 
          correctAnswer: data.correctAnswer 
        } 
      });
    });

    // Listen for quiz completion
    socket.on('quizCompleted', (data) => {
      console.log('Quiz completed for host:', data);
      setQuizStatus('completed');
      setLeaderboard(data.finalLeaderboard);
      // Navigate to results page or display final leaderboard
    });

    // Listen for quiz cancelled
    socket.on('quizCancelled', () => {
      alert('Quiz has been cancelled by the host or host disconnected.');
      navigate('/');
    });

    return () => {
      socket.off('quizStarting');
      socket.off('newQuestion');
      socket.off('timerUpdate'); // Clean up timerUpdate listener
      socket.off('updateAnswers');
      socket.off('questionEnd');
      socket.off('quizCompleted');
      socket.off('quizCancelled');
    };
  }, [roomCode, navigate, quizStatus, location.state]); // Removed timer from dependencies as it's updated via socket

  // This function will be called to advance to the next question
  // Only the host will have this button/control
  const handleNextQuestion = () => {
    const socket = socketService.getSocket();
    if (socket) {
      socket.emit('hostNextQuestion', { roomCode, currentQuestionIndex: questionIndex }, (response) => {
        if (!response.success) {
          console.error('Failed to advance question:', response.message);
          alert(response.message || 'Failed to advance question.');
        } else {
          console.log('Host advanced to next question.');
          // State will be updated by 'newQuestion' event from backend
        }
      });
    } else {
      alert('Socket not connected. Please refresh the page.');
    }
  };

  if (quizStatus === 'loading') {
    return <div className="host-quiz-page">Loading quiz...</div>;
  }

  if (!currentQuestion && quizStatus === 'active') {
    return <div className="host-quiz-page">Waiting for quiz to start...</div>;
  }

  if (quizStatus === 'completed') {
    return (
      <div className="host-quiz-page quiz-completed">
        <h1>Quiz Completed!</h1>
        {/* Leaderboard will be displayed on the LeaderboardPage (final leaderboard) */}
        <p>You can view the final results on the leaderboard page, or navigate back to home.</p>
        <button onClick={() => navigate('/')}>Return to Home</button>
      </div>
    );
  }

  return (
    <div className="host-quiz-page">
      <h1>Host Quiz: Room {roomCode}</h1>
      {currentQuestion ? (
        <div className="quiz-content">
          <div className="question-header">
            <h2>Question {questionIndex + 1}</h2>
            <div className="timer">Time Left: {timer}s</div>
          </div>
          <p className="question-text">{currentQuestion.question}</p>
          <div className="options-container">
            {currentQuestion.options.map((option, index) => (
              <div key={index} className="option-item">
                <div className="option-text">{option}</div>
                <div className="answer-count">Answers: {answersCount[option] || 0}</div>
              </div>
            ))}
          </div>
          {/* Leaderboard display removed from here, now handled by LeaderboardPage */}
          {/* Host control to move to next question will be on LeaderboardPage */}
        </div>
      ) : (
        <p>Quiz will start shortly...</p>
      )}
    </div>
  );
};

export default HostQuizPage; 