import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faCheck, faClock } from '@fortawesome/free-solid-svg-icons';
import './QuestionSidebar.css';

const QuestionSidebar = ({ 
  questions, 
  currentQuestionIndex, 
  completedQuestions, 
  isOpen, 
  toggleSidebar,
  isHost 
}) => {
  const getQuestionStatus = (index) => {
    if (completedQuestions.includes(index)) return 'completed';
    if (index === currentQuestionIndex) return 'current';
    return 'pending';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <FontAwesomeIcon icon={faCheck} />;
      case 'current':
        return <FontAwesomeIcon icon={faClock} />;
      default:
        return null;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'current':
        return 'In Progress';
      default:
        return 'Pending';
    }
  };

  const progressPercentage = (completedQuestions.length / questions.length) * 100;

  return (
    <>
      <button className="sidebar-toggle" onClick={toggleSidebar}>
        <FontAwesomeIcon icon={faBars} />
      </button>

      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2 className="sidebar-title">Quiz Progress</h2>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        <div className="questions-list">
          {questions.map((question, index) => {
            const status = getQuestionStatus(index);
            return (
              <div
                key={index}
                className={`question-item ${status}`}
              >
                <div className="question-number">
                  Question {index + 1} of {questions.length}
                </div>
                <div className="question-text">
                  {question.question}
                </div>
                <div className="question-status">
                  <div className={`status-icon ${status}`}>
                    {getStatusIcon(status)}
                  </div>
                  <span className="status-text">
                    {getStatusText(status)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default QuestionSidebar; 