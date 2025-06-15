import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCopy,
  faPlay,
  faTimes,
  faUsers
} from '@fortawesome/free-solid-svg-icons';
import socketService from '../services/socketService';
import './WaitingHostPage.css'; // Ensure this CSS file is used

const WaitingHostPage = () => {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const [participants, setParticipants] = useState([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const socket = socketService.getSocket();

    if (!socket) {
      navigate('/');
      return;
    }

    // Host joins the room to receive updates
    socket.emit('joinAsHost', { roomCode }, (response) => {
      if (!response.success) {
        console.error('Failed to join as host:', response.message);
        alert(response.message || 'Failed to join room as host.');
        navigate('/');
      }
    });

    // Listen for participant updates
    socket.on('participantJoined', (data) => {
      console.log('Participant joined event received:', data);
      setParticipants(data.participants);
    });

    socket.on('participantLeft', (data) => {
      console.log('Participant left event received:', data);
      setParticipants(data.participants);
    });

    // Request current participants list when component mounts or re-mounts
    socket.emit('getParticipants', { roomCode }, (response) => {
      if (response.success) {
        console.log('Initial participants received (on getParticipants callback):', response.participants);
        setParticipants(response.participants);
      } else {
        console.error('Failed to get initial participants:', response.message);
      }
    });

    // Listen for quiz starting event from backend
    socket.on('quizStarting', () => {
      console.log('Quiz starting event received by host from backend.');
      navigate(`/host/quiz/${roomCode}`); // Navigate to the host quiz page
    });

    // Listen for quiz cancelled
    socket.on('quizCancelled', () => {
      alert('Quiz has been cancelled by the host or host disconnected.');
      navigate('/');
    });

    // Handle potential errors from socket
    socket.on('error', (message) => {
      console.error('Socket error on WaitingHostPage:', message);
      alert(`Error: ${message}`);
      navigate('/'); // Redirect to home on critical error
    });

    return () => {
      socket.off('participantJoined');
      socket.off('participantLeft');
      socket.off('quizStarting');
      socket.off('quizCancelled');
      socket.off('error');
    };
  }, [roomCode, navigate]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStartQuiz = () => {
    const socket = socketService.getSocket();
    if (socket) {
      socket.emit('startQuiz', { roomCode }, (response) => {
        if (response.success) {
          console.log('Quiz start initiated:', response.message);
          // Navigation is now handled by the 'quizStarting' socket event listener
        } else {
          console.error('Failed to start quiz:', response.error);
          alert(response.error || 'Failed to start quiz.');
        }
      });
    } else {
      alert('Socket not connected. Please refresh the page.');
    }
  };

  const handleCancelQuiz = () => {
    const socket = socketService.getSocket();
    if (socket) {
      socket.emit('cancelQuiz', { roomCode });
      navigate('/');
    }
  };

  const getParticipantInitial = (name) => {
    return name.charAt(0).toUpperCase();
  };

  console.log('Rendering WaitingHostPage. Participants:', participants, 'Length:', participants.length);

  return (
    <div className="host-waiting-container">
      <div className="host-waiting-content">
        <div className="host-header">
          <h1>Waiting Room</h1>
        </div>

        <div className="room-info">
          <div className="room-code-display">
            <div className="room-code-label">Room Code</div>
            <div className="room-code-value">{roomCode}</div>
          </div>

          <button className="copy-button" onClick={handleCopyCode}>
            <FontAwesomeIcon icon={faCopy} />
            {copied ? 'Copied!' : 'Copy Code'}
          </button>
        </div>

        <div className="participants-section">
          <div className="participants-header">
            <h2 className="participants-title">
              <FontAwesomeIcon icon={faUsers} /> Participants
            </h2>
            <div className="participant-count">
              {participants.length} {participants.length === 1 ? 'Player' : 'Players'}
            </div>
          </div>

          <div className="participants-list">
            {participants.length === 0 ? (
              <p className="no-participants">Waiting for participants to join...</p>
            ) : (
              participants.map((participant) => (
                <div key={participant._id || participant.id} className="participant-item">
                  <div className="participant-avatar">
                    {getParticipantInitial(participant.username)}
                  </div>
                  <span className="participant-name">{participant.username}</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="action-buttons">
          <button className="action-button cancel-button" onClick={handleCancelQuiz}>
            <FontAwesomeIcon icon={faTimes} /> Cancel Quiz
          </button>
          <button 
            className="action-button start-button" 
            onClick={handleStartQuiz}
            disabled={participants.length === 0}
          >
            <FontAwesomeIcon icon={faPlay} /> Start Quiz
          </button>
        </div>
      </div>
    </div>
  );
};

export default WaitingHostPage; 