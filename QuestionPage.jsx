import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import socketService from '../services/socketService'; // Import socketService
import './QuestionPage.css';

const QuestionPage = () => {
  const navigate = useNavigate();
  const [roomCode, setRoomCode] = useState('');
  const [hostPin, setHostPin] = useState(null); // New state for hostPin
  const [questions, setQuestions] = useState([{
    id: 1,
    text: '',
    options: ['', '', '', ''],
    correctAnswer: null,
    timeLimit: 30
  }]);
  const [selectedQuestion, setSelectedQuestion] = useState(1);

  // Utility function to generate a room code (kept as it was already here)
  const generateRoomCode = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return code;
  };

  useEffect(() => {
    // Generate random room code on component mount
    const generatedCode = generateRoomCode();
    setRoomCode(generatedCode);
  }, []);

  const handleAddQuestion = () => {
    const newQuestion = {
      id: questions.length + 1,
      text: '',
      options: ['', '', '', ''],
      correctAnswer: null,
      timeLimit: 30
    };
    setQuestions([...questions, newQuestion]);
    setSelectedQuestion(newQuestion.id);
  };

  const handleQuestionChange = (field, value) => {
    const updatedQuestions = questions.map(q => {
      if (q.id === selectedQuestion) {
        return { ...q, [field]: value };
      }
      return q;
    });
    setQuestions(updatedQuestions);
  };

  const handleOptionChange = (index, value) => {
    const updatedQuestions = questions.map(q => {
      if (q.id === selectedQuestion) {
        const newOptions = [...q.options];
        newOptions[index] = value;
        return { ...q, options: newOptions };
      }
      return q;
    });
    setQuestions(updatedQuestions);
  };

  const handleCorrectAnswerChange = (optionIndex) => {
    const updatedQuestions = questions.map(q => {
      if (q.id === selectedQuestion) {
        // Store the actual option text as the correct answer
        return { ...q, correctAnswer: q.options[optionIndex] };
      }
      return q;
    });
    setQuestions(updatedQuestions);
  };

  const handleCreateGame = async () => {
    try {
      // Frontend validation
      const isValid = questions.every(q => {
        const hasValidQuestion = q.text.trim().length > 0;
        const hasValidOptions = q.options.every(opt => opt.trim().length > 0);
        const hasValidCorrectAnswer = q.correctAnswer !== null && q.options.includes(q.correctAnswer); // Check if option text is in options

        if (!hasValidQuestion) {
          throw new Error(`Question ${q.id}: Please fill in the question text.`);
        }
        if (!hasValidOptions) {
          throw new Error(`Question ${q.id}: Please fill in all 4 options.`);
        }
        if (!hasValidCorrectAnswer) {
          throw new Error(`Question ${q.id}: Please select a correct answer.`);
        }
        if (q.options.length !== 4) {
          throw new Error(`Question ${q.id}: Must have exactly 4 options`);
        }
        return hasValidQuestion && hasValidOptions && hasValidCorrectAnswer && q.options.length === 4;
      });

      if (!isValid) {
        // This block will now be unreachable if any `throw new Error` above is hit
        // The individual `throw new Error` statements will directly trigger the catch block
      }

      const quizData = {
        roomCode: roomCode, // Use the generated roomCode
        questions: questions.map(q => ({
          question: q.text.trim(),
          options: q.options.map(opt => opt.trim()),
          correctAnswer: q.correctAnswer.trim(), // Ensure it's the actual answer string
          timeLimit: q.timeLimit
        }))
      };

      console.log('Sending quiz data via socket from QuestionPage:', quizData);

      const socket = await socketService.connect();
      socket.emit('createRoom', quizData, (response) => {
        console.log('Backend response for createRoom (QuestionPage):', response);
        if (response.success && response.roomCode && response.hostPin) {
          setHostPin(response.hostPin); // Store the host PIN
          sessionStorage.setItem('hostRoomCode', response.roomCode); // Store room code as well for rejoining
          sessionStorage.setItem('hostPin', response.hostPin); // Store host PIN
          alert(`Quiz created! Your Host PIN is: ${response.hostPin}. Please save this PIN to rejoin as host later.`);
          navigate(`/host/waiting/${response.roomCode}`, {
            state: { roomCode: response.roomCode, hostPin: response.hostPin } // Pass hostPin to waiting page
          });
        } else {
          alert(response.error || 'Failed to create room via socket. Please try again.');
        }
      });

    } catch (error) {
      console.error('Error creating game:', error);
      alert(error.message || 'Failed to create game. Please try again.');
    }
  };

  const handleBack = () => {
    navigate('/');
  };

  const currentQuestion = questions.find(q => q.id === selectedQuestion) || questions[0];

  return (
    <div className="question-page">
      <div className="sidebar">
        <button className="back-button" onClick={handleBack}>← Back</button>
        <div className="room-code">Room Code: {roomCode}</div>
        {hostPin && (
          <div className="host-pin-display">
            Host PIN: <strong>{hostPin}</strong>
            <p className="pin-warning">Save this PIN to rejoin as host!</p>
          </div>
        )}
        <div className="question-slides">
          {questions.map((q, index) => (
            <div 
              key={q.id}
              className={`question-slide ${selectedQuestion === q.id ? 'selected' : ''}`}
              onClick={() => setSelectedQuestion(q.id)}
            >
              Question {index + 1}
            </div>
          ))}
        </div>
        <button className="add-question-button" onClick={handleAddQuestion}>
          Add Question
        </button>
        <button className="create-game-button" onClick={handleCreateGame}>
          Create Game
        </button>
      </div>

      <div className="main-content">
        <div className="question-editor">
          <div className="question-header">
            <h2>Question {selectedQuestion}</h2>
            <div className="time-setting">
              <label>Time Limit:</label>
              <input
                type="number"
                min="5"
                max="120"
                value={currentQuestion.timeLimit || ''}
                onChange={(e) => handleQuestionChange('timeLimit', parseInt(e.target.value))}
              />
              <span>seconds</span>
            </div>
          </div>

          <textarea
            className="question-text"
            placeholder="Enter your question"
            value={currentQuestion.text}
            onChange={(e) => handleQuestionChange('text', e.target.value)}
          />

          <div className="options-container">
            {currentQuestion.options.map((option, index) => (
              <div key={index} className="option-input-wrapper">
                <input
                  type="text"
                  placeholder={`Option ${index + 1}`}
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                />
                <input
                  type="radio"
                  name={`correct-answer-${currentQuestion.id}`}
                  checked={currentQuestion.correctAnswer === option}
                  onChange={() => handleCorrectAnswerChange(index)}
                />
              </div>
            ))}
          </div>

          <div className="add-option-button">
            {/* Add option button (if needed, currently fixed to 4 options) */}
          </div>

        </div>
      </div>
    </div>
  );
};

export default QuestionPage; 