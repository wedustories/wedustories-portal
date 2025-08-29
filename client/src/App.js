import PrivateRoute from './components/PrivateRoute'; // ✅ updated path
import ClientGallery from './pages/ClientGallery';
import Dashboard from './pages/Dashboard';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';

function Navbar() {
  return (
    <nav>
      <Link to="/login">Login</Link> | <Link to="/signup">Signup</Link> | <Link to="/dashboard">Dashboard</Link> | <Link to="/gallery">Gallery</Link>
    </nav>
  );
}

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/gallery" element={<ClientGallery />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route path="/" element={<Login />} />
        <Route path="*" element={<div>Page not found</div>} />
      </Routes>
    </Router>
  );
}

export default App;
