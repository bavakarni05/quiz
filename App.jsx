import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import RoomCreation from './components/RoomCreation';
import QuestionPage from './components/QuestionPage';
import WaitingHostPage from './components/HostWaitingRoom';
import GameHostPage from './components/GameHostPage';
import JoinRoom from './components/JoinRoom';
import WaitingParticipantPage from './components/WaitingParticipantPage';
import GameParticipantPage from './components/GameParticipantPage';
import HostJoinRoom from './components/HostJoinRoom';
import HostQuizPage from './components/HostQuizPage';
import ParticipantQuizPage from './components/ParticipantQuizPage';
import HostLeaderboardPage from './components/HostLeaderboardPage';
import ParticipantLeaderboardPage from './components/ParticipantLeaderboardPage';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<RoomCreation />} />
        <Route path="/question-page" element={<QuestionPage />} />
        <Route path="/waiting-host" element={<WaitingHostPage />} />
        <Route path="/game-host" element={<GameHostPage />} />
        <Route path="/join-room" element={<JoinRoom />} />
        <Route path="/waiting-participant/:roomCode" element={<WaitingParticipantPage />} />
        <Route path="/game-participant" element={<GameParticipantPage />} />
        <Route path="/host/join" element={<HostJoinRoom />} />
        <Route path="/host/waiting/:roomCode" element={<WaitingHostPage />} />
        <Route path="/host/quiz/:roomCode" element={<HostQuizPage />} />
        <Route path="/player/quiz/:roomCode" element={<ParticipantQuizPage />} />
        <Route path="/host/leaderboard/:roomCode" element={<HostLeaderboardPage />} />
        <Route path="/player/leaderboard/:roomCode" element={<ParticipantLeaderboardPage />} />
      </Routes>
    </Router>
  );
}

export default App;
