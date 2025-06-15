import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrophy, faHome, faRedo } from '@fortawesome/free-solid-svg-icons';
import socketService from '../services/socketService';
import './Leaderboard.css';

const Leaderboard = () => {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const [players, setPlayers] = useState([]);
  const [isGameOver, setIsGameOver] = useState(false);
  const [winner, setWinner] = useState(null);

  useEffect(() => {
    const socket = socketService.getSocket();

    if (!socket) {
      navigate('/');
      return;
    }

    socket.on('leaderboardUpdate', (data) => {
      const sortedPlayers = data.players.sort((a, b) => b.score - a.score);
      setPlayers(sortedPlayers);
    });

    socket.on('gameOver', (data) => {
      setIsGameOver(true);
      setWinner(data.winner);
    });

    // Request initial leaderboard data
    socket.emit('getLeaderboard', { roomCode });

    return () => {
      socket.off('leaderboardUpdate');
      socket.off('gameOver');
    };
  }, [roomCode, navigate]);

  const handlePlayAgain = () => {
    const socket = socketService.getSocket();
    socket.emit('playAgain', { roomCode });
  };

  const handleReturnHome = () => {
    navigate('/');
  };

  return (
    <div className="leaderboard-container">
      <div className="leaderboard-content">
        <div className="leaderboard-header">
          <h1>
            {isGameOver ? 'Final Results' : 'Live Leaderboard'}
          </h1>
        </div>

        <div className="leaderboard-table">
          {players.map((player, index) => (
            <div
              key={player.id}
              className="player-row"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className={`rank ${index < 3 ? `top-${index + 1}` : ''}`}>
                {index + 1}
              </div>
              <div className="player-info">
                <span className="player-name">{player.username}</span>
                <div>
                  <span className="player-score">{player.score}</span>
                  {player.scoreChange && (
                    <span className={`score-change ${player.scoreChange > 0 ? 'positive' : 'negative'}`}>
                      {player.scoreChange > 0 ? '+' : ''}{player.scoreChange}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {isGameOver && winner && (
          <div className="final-results">
            <div className="winner-announcement">
              <FontAwesomeIcon icon={faTrophy} /> {winner.username} Wins!
            </div>
            <p>With a score of {winner.score} points</p>
            
            <div className="action-buttons">
              <button className="action-button" onClick={handleReturnHome}>
                <FontAwesomeIcon icon={faHome} /> Return Home
              </button>
              <button className="action-button primary" onClick={handlePlayAgain}>
                <FontAwesomeIcon icon={faRedo} /> Play Again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard; 