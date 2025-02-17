import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import WeekList from './pages/WeekList';
import GreivinPage from './pages/GreivinPage';
import OscarPage from './pages/OscarPage';

const App = () => {
  return (
    <Router>
      <Routes>
        {/* 🔥 Página principal muestra la lista de semanas */}
        <Route path="/" element={<WeekList />} />

        {/* 🔥 Rutas para las páginas de Greivin y Oscar */}
        <Route path="/salestracker/:weekId/greivin" element={<GreivinPage />} />
        <Route path="/salestracker/:weekId/oscar" element={<OscarPage />} />

        {/* 🔥 Redirección si la ruta no existe */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

export default App;
