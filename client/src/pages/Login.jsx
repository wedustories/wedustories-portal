import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

 const handleSubmit = async (e) => {
  e.preventDefault();
  const { email, password } = formData;
  try {
    const res = await axios.post('http://localhost:5000/api/auth/login', {
      email,
      password
    });
    localStorage.setItem("token", res.data.token);
    alert("Login successful!");
    navigate('/dashboard'); // ✅ Add this line
  } catch (err) {
    alert(err.response?.data?.message || 'Login failed');
  }
};
  return (
    <form onSubmit={handleSubmit}>
      <h2>Login</h2>
      <input type="email" name="email" placeholder="Email" onChange={handleChange} required />
      <input type="password" name="password" placeholder="Password" onChange={handleChange} required />
      <button type="submit">Login</button>
    </form>
  );
};

export default Login;
