import { Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Follow from './pages/Follow';
import Player from './pages/Player';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/follows" element={<Follow />} />
      <Route path="/player" element={<Player />} />
      <Route path="/player/:slug" element={<Player />} />
    </Routes>
  );
}
