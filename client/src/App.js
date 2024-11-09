import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProjectDetail from './components/ProjectDetail';
import NotFound from './components/NotFound';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/projects/:id" element={<ProjectDetail />} />
       
        <Route path="*" element={<NotFound />} /> {/* This will catch all undefined routes */}
      </Routes>
    </Router>
  );
}

export default App;