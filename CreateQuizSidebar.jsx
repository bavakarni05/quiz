import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCopy } from '@fortawesome/free-solid-svg-icons';
import './CreateQuizSidebar.css';

const CreateQuizSidebar = ({ 
  questions, 
  currentQuestionIndex,
  roomCode,
  onCreateRoom,
  onQuestionSelect 
}) => {
  console.log('CreateQuizSidebar received roomCode prop:', roomCode);
  const handleCopyRoomCode = () => {
    if (roomCode) {
      navigator.clipboard.writeText(roomCode);
    }
  };

  return (
    <div className="create-quiz-sidebar">
      {roomCode && (
        <div className="room-code-display">
          <div className="room-code-label">Room Code</div>
          <div className="room-code-value" onClick={handleCopyRoomCode}>
            {roomCode}
            <FontAwesomeIcon icon={faCopy} style={{ marginLeft: '0.5rem', fontSize: '1rem' }} />
          </div>
        </div>
      )}

      <div className="questions-overview">
        <h3 className="overview-title">Questions Overview</h3>
        <div className="question-list">
          {questions.map((question, index) => (
            <div
              key={index}
              className={`question-preview ${index === currentQuestionIndex ? 'active' : ''}`}
              onClick={() => onQuestionSelect(index)}
            >
              <div className="preview-header">
                <span className="question-number">Question {index + 1}</span>
                <span className="time-limit">{question.timeLimit}s</span>
              </div>
              <div className="preview-text">{question.question}</div>
            </div>
          ))}
        </div>
      </div>

      {!roomCode && questions.length > 0 && (
        <button 
          className="create-room-button"
          onClick={onCreateRoom}
        >
          Create Room
        </button>
      )}
    </div>
  );
};

export default CreateQuizSidebar; 