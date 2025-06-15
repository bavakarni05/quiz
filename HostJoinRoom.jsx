import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import socketService from '../services/socketService';
import './HostJoinRoom.css';

const HostJoinRoom = () => {
  const navigate = useNavigate();
  const [roomCode, setRoomCode] = useState('');
  const [hostPin, setHostPin] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleJoinRoom = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!roomCode.trim() || !hostPin.trim()) {
      setError('Please enter both room code and host PIN');
      setIsLoading(false);
      return;
    }

    try {
      const socket = await socketService.connect(); // Await the connection
      
      socket.emit('joinAsHost', { roomCode: roomCode.toUpperCase(), hostPin }, (response) => {
        if (response.success) {
          sessionStorage.setItem('hostRoomCode', roomCode.toUpperCase()); // Store room code for rejoining
          sessionStorage.setItem('hostPin', hostPin); // Store host PIN
          navigate(`/host/waiting/${roomCode.toUpperCase()}`, { state: { roomCode: roomCode.toUpperCase(), hostPin } });
        } else {
          setError(response.message || 'Failed to join room');
          // Do not disconnect socket immediately on failed join, allow re-attempts
          // socketService.disconnect(); 
        }
        setIsLoading(false);
      });

      // Remove old socket event listeners to avoid multiple listeners
      socket.off('connect'); 
      socket.off('connect_error');

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
    <div className="host-join-room">
      <button className="back-button" onClick={handleBack}>
        <FontAwesomeIcon icon={faArrowLeft} /> Back
      </button>

      <div className="join-room-content">
        <h1>Join as Host</h1>
        
        <form onSubmit={handleJoinRoom} className="join-form">
          <div className="input-group">
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

          <div className="input-group">
            <label htmlFor="host-pin">Host PIN</label>
            <input
              id="host-pin"
              type="password"
              value={hostPin}
              onChange={(e) => setHostPin(e.target.value)}
              placeholder="Enter host PIN"
              maxLength={4}
              disabled={isLoading}
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button 
            type="submit" 
            className="join-button"
            disabled={isLoading}
          >
            {isLoading ? 'Joining...' : 'Join Room'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default HostJoinRoom; 