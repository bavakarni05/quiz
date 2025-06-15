import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { SocketContext } from '../contexts/SocketContext';
import { QuizContext } from '../contexts/QuizContext';
import './HostLeaderboardPage.css'; // Assuming you'll create this CSS file

const HostLeaderboardPage = () => {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const { socket } = useContext(SocketContext);
  const { quizState, dispatch } = useContext(QuizContext);
  const [leaderboard, setLeaderboard] = useState([]);
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [isQuizCompleted, setIsQuizCompleted] = useState(false);

  useEffect(() => {
    if (!socket) return;

    socket.on('questionEnd', ({ leaderboard: newLeaderboard, correctAnswer: ans }) => {
      console.log("[HostLeaderboardPage] Received 'questionEnd' event. Leaderboard:", newLeaderboard);
      setLeaderboard(newLeaderboard);
      setCorrectAnswer(ans);
      // Backend now handles automatic progression after a delay, so no need for manual next question button
    });

    socket.on('quizCompleted', ({ finalLeaderboard }) => {
      console.log("[HostLeaderboardPage] Received 'quizCompleted' event. Final Leaderboard:", finalLeaderboard);
      setLeaderboard(finalLeaderboard);
      setIsQuizCompleted(true);
      // Optionally, navigate to a dedicated final results page
    });

    socket.on('quizCancelled', () => {
      console.log("[HostLeaderboardPage] Quiz cancelled.");
      alert("The quiz has been cancelled by the host.");
      navigate('/'); // Navigate back to home or a suitable page
    });

    // Clean up event listeners on unmount
    return () => {
      socket.off('questionEnd');
      socket.off('quizCompleted');
      socket.off('quizCancelled');
    };
  }, [socket, navigate, roomCode, dispatch]);

  const handleEndQuiz = () => {
    if (socket && roomCode) {
      socket.emit('cancelQuiz', { roomCode }, (response) => {
        if (response.success) {
          console.log("Host manually cancelled quiz.");
          // Navigation handled by 'quizCancelled' event listener
        } else {
          console.error("Failed to cancel quiz:", response.message);
          alert("Failed to cancel quiz: " + response.message);
        }
      });
    }
  };

  return (
    <div className="leaderboard-container">
      {isQuizCompleted ? (
        <>
          <h1>Quiz Completed!</h1>
          <h2>Final Leaderboard for Room: {roomCode}</h2>
        </>
      ) : (
        <>
          <h1>Leaderboard for Room: {roomCode}</h1>
          {correctAnswer && <p className="correct-answer-display">Correct Answer: <strong>{correctAnswer}</strong></p>}
        </>
      )}

      {leaderboard.length > 0 ? (
        <ul className="leaderboard-list">
          {leaderboard.map((participant, index) => (
            <li key={participant.id} className="leaderboard-item">
              <span className="leaderboard-rank">#{index + 1}</span>
              <span className="leaderboard-username">{participant.username}</span>
              <span className="leaderboard-score">{participant.score} points</span>
            </li>
          ))}
        </ul>
      ) : (
        <p>No participants on the leaderboard yet.</p>
      )}

      {isQuizCompleted && (
        <button onClick={() => navigate('/')} className="leaderboard-home-button">
          Back to Home
        </button>
      )}
      {!isQuizCompleted && (
        <button onClick={handleEndQuiz} className="leaderboard-end-button">
          End Quiz
        </button>
      )}
    </div>
  );
};

export default HostLeaderboardPage; 