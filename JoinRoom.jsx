import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import socketService from '../services/socketService';
import './JoinRoom.css';

const JoinRoom = () => {
  const navigate = useNavigate();
  const [roomCode, setRoomCode] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleJoin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!roomCode.trim() || !username.trim()) {
      setError('Please fill in all fields');
      setIsLoading(false);
      return;
    }

    try {
      const socket = await socketService.connect();

      socket.emit('joinRoom', { roomCode: roomCode.toUpperCase(), name: username }, (response) => {
        if (response.success) {
          navigate(`/waiting-participant/${roomCode.toUpperCase()}`, {
            state: {
              roomCode: roomCode.toUpperCase(),
              username
            }
          });
        } else {
          setError(response.error || 'Failed to join room');
        }
        setIsLoading(false);
      });
    } catch (err) {
      setError(err.message || 'Failed to connect to server.');
      console.error('Socket connection error or unexpected error:', err);
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/');
  };

  return (
    <div className="join-room-page">
      <button className="back-button" onClick={handleBack}>← Back</button>

      <div className="join-container">
        <h1>Join Room</h1>
        
        <form onSubmit={handleJoin} className="join-form">
          <div className="form-group">
            <label htmlFor="room-code">Room Code</label>
            <input
              id="room-code"
              type="text"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              placeholder="Enter room code"
              maxLength={6}
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              maxLength={20}
              disabled={isLoading}
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button 
            type="submit" 
            className="join-button"
            disabled={isLoading}
          >
            {isLoading ? 'Joining...' : 'Join Game'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default JoinRoom; 