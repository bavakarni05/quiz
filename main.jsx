import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { SocketProvider } from './contexts/SocketContext.jsx'
import { QuizProvider } from './contexts/QuizContext.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <SocketProvider>
      <QuizProvider>
        <App />
      </QuizProvider>
    </SocketProvider>
  </React.StrictMode>,
)
