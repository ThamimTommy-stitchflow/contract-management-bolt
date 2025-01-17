import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { CompanyProvider } from './context/CompanyContext';
import { AppRoutes } from './routes';

function App() {
  return (
    <CompanyProvider>
      <Router>
        <AppRoutes />
      </Router>
    </CompanyProvider>
  );
}

export default App;