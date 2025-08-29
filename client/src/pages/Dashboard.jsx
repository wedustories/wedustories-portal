import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data);
      } catch (err) {
        console.error(err);
        handleLogout(); // auto logout on token failure
      }
    };
    fetchUser();
  }, []);

  return (
    <div>
      <h1>Dashboard</h1>
      {user ? (
        <>
          <p>Hello, {user.name} ({user.email})</p>
          <button onClick={handleLogout}>Logout</button>
        </>
      ) : (
        <p>Loading user...</p>
      )}
    </div>
  );
};

export default Dashboard;
