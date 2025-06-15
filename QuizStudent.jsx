import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { submitAnswer } from '../utils/mockData';
import './QuizStudent.css';

const QuizStudent = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { 
    question, 
    timeLimit, 
    timeUnit, 
    options,
    questionIndex,
    participantId 
  } = location.state?.currentQuestion || {};
  const [timeLeft, setTimeLeft] = useState(parseInt(timeLimit) || 0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswerLocked, setIsAnswerLocked] = useState(false);

  useEffect(() => {
    if (!timeLimit) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // If time runs out without an answer, submit -1 as selected option
          if (!isAnswerLocked) {
            submitAnswer(participantId, questionIndex, -1, 0);
          }
          setTimeout(() => {
            navigate('/leaderboard-student', { 
              state: { participantId } 
            });
          }, 1000);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLimit, navigate, isAnswerLocked, participantId, questionIndex]);

  const handleOptionSelect = (index) => {
    if (isAnswerLocked) return;
    
    setSelectedOption(index);
    setIsAnswerLocked(true);
    submitAnswer(participantId, questionIndex, index, timeLeft);
  };

  if (!question) return <div>Waiting for question...</div>;

  return (
    <div className="quiz-student-container">
      <div className="quiz-header">
        <div className="timer">
          <div className="timer-circle">
            {timeLeft}
            <span>{timeUnit}</span>
          </div>
        </div>
      </div>

      <div className="question-display">
        <h2>{question}</h2>
      </div>

      <div className="options-grid">
        {options.map((option, index) => (
          <button
            key={index}
            className={`option-button ${selectedOption === index ? 'selected' : ''} ${isAnswerLocked ? 'locked' : ''}`}
            onClick={() => handleOptionSelect(index)}
            disabled={isAnswerLocked}
          >
            {option}
          </button>
        ))}
      </div>

      {isAnswerLocked && (
        <div className="answer-message">
          Answer submitted! Waiting for others...
        </div>
      )}
    </div>
  );
};

export default QuizStudent; 