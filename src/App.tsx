import { AnimatePresence } from 'framer-motion';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import DescriptionPage from './pages/DescriptionPage';
import VisualizePage from './pages/VisualizePage';

export default function App() {
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
