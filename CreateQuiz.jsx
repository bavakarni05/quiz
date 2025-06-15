import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import socketService from '../services/socketService';
import CreateQuizSidebar from './CreateQuizSidebar';
import './CreateQuiz.css';

// Utility function to generate a room code
const generateRoomCode = () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let roomCode = '';
  for (let i = 0; i < 6; i++) {
    roomCode += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return roomCode;
};

const CreateQuiz = () => {
  const navigate = useNavigate();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [roomCode, setRoomCode] = useState(null);
  const [quizTitle, setQuizTitle] = useState('');
  const [questions, setQuestions] = useState([{
    question: '',
    options: ['', '', '', ''],
    correctAnswer: null,
    timeLimit: 30
  }]);

  const handleQuestionChange = (index, value) => {
    const newQuestions = [...questions];
    newQuestions[index].question = value;
    setQuestions(newQuestions);
  };

  const handleOptionChange = (questionIndex, optionIndex, value) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].options[optionIndex] = value;
    setQuestions(newQuestions);
  };

  const handleCorrectAnswerChange = (questionIndex, optionIndex) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].correctAnswer = newQuestions[questionIndex].options[optionIndex];
    setQuestions(newQuestions);
  };

  const handleTimeLimitChange = (index, value) => {
    const newQuestions = [...questions];
    newQuestions[index].timeLimit = Math.max(5, Math.min(300, Number(value) || 30));
    setQuestions(newQuestions);
  };

  const addQuestion = () => {
    setQuestions([...questions, {
      question: '',
      options: ['', '', '', ''],
      correctAnswer: null,
      timeLimit: 30
    }]);
    setCurrentQuestionIndex(questions.length);
  };

  const removeQuestion = (index) => {
    if (questions.length > 1) {
      const newQuestions = questions.filter((_, i) => i !== index);
      setQuestions(newQuestions);
      if (currentQuestionIndex >= newQuestions.length) {
        setCurrentQuestionIndex(newQuestions.length - 1);
      }
    }
  };

  const handleCreateRoom = async () => {
    try {
      // Validate questions
      const isValid = questions.every(q => {
        const hasValidQuestion = q.question.trim().length > 0;
        const hasValidOptions = q.options.every(opt => opt.trim().length > 0);
        const hasValidCorrectAnswer = q.correctAnswer !== null;
        if (!hasValidQuestion) {
          throw new Error('Please fill in all questions');
        }
        if (!hasValidOptions) {
          throw new Error('Please fill in all options');
        }
        if (!hasValidCorrectAnswer) {
          throw new Error('Please select a correct answer for each question');
        }
        return hasValidQuestion && hasValidOptions && hasValidCorrectAnswer;
      });
      if (!isValid) {
        throw new Error('Please complete all questions before creating the room');
      }

      const frontendRoomCode = generateRoomCode(); // Generate room code in frontend
      console.log('Generated room code in frontend:', frontendRoomCode);

      const socket = await socketService.connect();
      socket.emit('createRoom', { questions, roomCode: frontendRoomCode }, (response) => {
        console.log('Backend response for createRoom:', response);
        if (response.success && response.roomCode) {
          setRoomCode(response.roomCode);
          console.log('Frontend roomCode state set to:', response.roomCode);
          navigate(`/host/waiting/${response.roomCode}`);
        } else {
          alert(response.error || 'Failed to create room. Please try again.');
        }
      });

    } catch (error) {
      alert(error.message || 'Failed to create room. Please try again.');
      console.error('Room creation error:', error);
    }
  };

  const handleQuestionSelect = (index) => {
    setCurrentQuestionIndex(index);
  };

  return (
    <div className="create-quiz-container">
      <div className="create-quiz-content">
        <div className="create-quiz-header">
          <h1>Create Your Quiz</h1>
        </div>

        <div className="question-form">
          <input
            type="text"
            className="question-input"
            placeholder="Enter your question"
            value={questions[currentQuestionIndex].question}
            onChange={(e) => handleQuestionChange(currentQuestionIndex, e.target.value)}
          />

          <div className="options-grid">
            {questions[currentQuestionIndex].options.map((option, optionIndex) => (
              <div key={optionIndex} className="option-wrapper">
                <input
                  type="text"
                  className="option-input"
                  placeholder={`Option ${optionIndex + 1}`}
                  value={option}
                  onChange={(e) => handleOptionChange(currentQuestionIndex, optionIndex, e.target.value)}
                />
                <div
                  className={`correct-option ${questions[currentQuestionIndex].correctAnswer === option ? 'selected' : ''}`}
                  onClick={() => handleCorrectAnswerChange(currentQuestionIndex, optionIndex)}
                />
              </div>
            ))}
          </div>

          <div className="time-limit">
            <span>Time Limit (seconds):</span>
            <input
              type="number"
              className="time-input"
              value={questions[currentQuestionIndex].timeLimit}
              onChange={(e) => handleTimeLimitChange(currentQuestionIndex, e.target.value)}
              min="5"
              max="300"
            />
          </div>

          {questions.length > 1 && (
            <button
              className="action-button remove-button"
              onClick={() => removeQuestion(currentQuestionIndex)}
            >
              <FontAwesomeIcon icon={faTrash} /> Remove Question
            </button>
          )}
        </div>

        <button className="add-question" onClick={addQuestion}>
          <FontAwesomeIcon icon={faPlus} /> Add Question
        </button>
      </div>

      {console.log('CreateQuiz rendering with roomCode:', roomCode, 'and quizTitle:', quizTitle)}

      <CreateQuizSidebar
        questions={questions}
        currentQuestionIndex={currentQuestionIndex}
        roomCode={roomCode}
        onCreateRoom={handleCreateRoom}
        onQuestionSelect={handleQuestionSelect}
      />
    </div>
  );
};

export default CreateQuiz; 