import { AnimatePresence } from 'framer-motion';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { LangProvider } from './i18n/LangContext';
import HomePage from './pages/HomePage';
import DescriptionPage from './pages/DescriptionPage';
import VisualizePage from './pages/VisualizePage';

function AppRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.key}>
        <Route path="/" element={<HomePage />} />
        <Route path="/algo/:id" element={<DescriptionPage />} />
        <Route path="/algo/:id/run" element={<VisualizePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <LangProvider>
      <AppRoutes />
    </LangProvider>
  );
}
