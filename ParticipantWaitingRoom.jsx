import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers } from '@fortawesome/free-solid-svg-icons';
import socketService from '../services/socketService';
import './ParticipantWaitingRoom.css';

const ParticipantWaitingRoom = () => {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const [participantCount, setParticipantCount] = useState(1);
  const [status, setStatus] = useState('Waiting for host to start...');

  useEffect(() => {
    const socket = socketService.getSocket();

    if (!socket) {
      navigate('/');
      return;
    }

    socket.on('participantCountUpdate', (count) => {
      setParticipantCount(count);
    });

    socket.on('quizStart', () => {
      navigate(`/quiz/${roomCode}`);
    });

    socket.on('roomClosed', () => {
      setStatus('Room has been closed by the host');
      setTimeout(() => navigate('/'), 3000);
    });

    return () => {
      socket.off('participantCountUpdate');
      socket.off('quizStart');
      socket.off('roomClosed');
    };
  }, [roomCode, navigate]);

  return (
    <div className="waiting-room-container">
      <div className="waiting-room-content">
        <h2>Waiting Room</h2>
        
        <div className="room-code">
          <p>Room Code</p>
          <span>{roomCode}</span>
        </div>

        <div className="participant-count">
          <div className="count-circle">
            <FontAwesomeIcon icon={faUsers} />
          </div>
          <p>{participantCount} {participantCount === 1 ? 'Participant' : 'Participants'}</p>
        </div>

        <div className="loading-spinner"></div>
        <p className="status-message">{status}</p>
      </div>
    </div>
  );
};

export default ParticipantWaitingRoom; 