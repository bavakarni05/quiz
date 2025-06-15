import React, { createContext, useContext, useState } from 'react';

export const QuizContext = createContext(null);

export const useQuiz = () => useContext(QuizContext);

export const QuizProvider = ({ children }) => {
  const [quizData, setQuizData] = useState({
    roomCode: null,
    username: null,
    participants: [],
    currentQuestion: null,
    questionNumber: 0,
    totalQuestions: 0,
    leaderboard: [],
    correctAnswer: null,
  });

  return (
    <QuizContext.Provider value={{ quizData, setQuizData }}>
      {children}
    </QuizContext.Provider>
  );
}; 