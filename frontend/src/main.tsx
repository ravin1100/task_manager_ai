import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Create custom CSS class for styling react-calendar in dark mode
const style = document.createElement('style');
style.textContent = `
  .dark .react-calendar {
    background-color: rgba(17, 24, 39, 0.7);
    color: white;
    border-color: rgba(75, 85, 99, 0.3);
  }
  .dark .react-calendar__tile {
    color: white;
    background-color: transparent;
  }
  .dark .react-calendar__tile:enabled:hover,
  .dark .react-calendar__tile:enabled:focus {
    background-color: rgba(255, 255, 255, 0.1);
  }
  .dark .react-calendar__tile--active {
    background-color: #0ea5e9;
  }
  .dark .react-calendar__month-view__days__day--weekend {
    color: #f87171;
  }
  .dark .react-calendar__month-view__days__day--neighboringMonth {
    color: #6b7280;
  }
  .dark .react-calendar__navigation button {
    color: white;
  }
  .dark .react-calendar__navigation button:enabled:hover,
  .dark .react-calendar__navigation button:enabled:focus {
    background-color: rgba(255, 255, 255, 0.1);
  }
`;
document.head.appendChild(style);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
