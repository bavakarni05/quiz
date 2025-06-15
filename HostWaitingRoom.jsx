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
import { useQuiz } from '../contexts/QuizContext.jsx';
import './HostWaitingRoom.css';

const HostWaitingRoom = () => {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const [participants, setParticipants] = useState([]);
  const [copied, setCopied] = useState(false);
  const { setQuizData } = useQuiz();

  useEffect(() => {
    const socket = socketService.getSocket();

    if (!socket) {
      navigate('/');
      return;
    }

    // Set roomCode in QuizContext when host enters waiting room
    setQuizData(prev => ({ ...prev, roomCode: roomCode }));

    // Listen for participant updates
    socket.on('participantJoined', (data) => {
      console.log('Participant joined event received:', data);
      setParticipants(data.participants);
      setQuizData(prev => ({ ...prev, participants: data.participants }));
    });

    socket.on('participantLeft', (data) => {
      console.log('Participant left event received:', data);
      setParticipants(data.participants);
      setQuizData(prev => ({ ...prev, participants: data.participants }));
    });

    // Request current participants list when component mounts
    socket.emit('getParticipants', { roomCode });
    socket.once('currentParticipants', (data) => {
      console.log('Initial participants received:', data);
      setParticipants(data.participants);
      setQuizData(prev => ({ ...prev, participants: data.participants }));
    });

    // Handle potential errors from socket
    socket.on('error', (message) => {
      console.error('Socket error on HostWaitingRoom:', message);
      alert(`Error: ${message}`);
      navigate('/'); // Redirect to home on critical error
    });

    return () => {
      socket.off('participantJoined');
      socket.off('participantLeft');
      socket.off('currentParticipants'); // Clean up this listener too
      socket.off('error');
    };
  }, [roomCode, navigate, setQuizData]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStartQuiz = () => {
    const socket = socketService.getSocket();
    socket.emit('startQuiz', { roomCode });
    navigate(`/host/quiz/${roomCode}`);
  };

  const handleCancelQuiz = () => {
    const socket = socketService.getSocket();
    socket.emit('cancelQuiz', { roomCode });
    navigate('/');
  };

  const getParticipantInitial = (name) => {
    return name.charAt(0).toUpperCase();
  };

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
            {participants.map((participant) => (
              <div key={participant.id} className="participant-item">
                <div className="participant-avatar">
                  {getParticipantInitial(participant.username)}
                </div>
                <span className="participant-name">{participant.username}</span>
              </div>
            ))}
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

export default HostWaitingRoom; 