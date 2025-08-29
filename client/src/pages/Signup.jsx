import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // ✅ Add this

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const navigate = useNavigate(); // ✅ Add this

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, email, password } = formData;

    try {
      const res = await axios.post('http://localhost:5000/api/auth/signup', {
        name,
        email,
        password
      });
      alert("Signup successful!");
      navigate('/login'); // ✅ Now works
    } catch (err) {
      alert(err.response?.data?.message || 'Signup failed');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Signup</h2>
      <input type="text" name="name" placeholder="Name" onChange={handleChange} required />
      <input type="email" name="email" placeholder="Email" onChange={handleChange} required />
      <input type="password" name="password" placeholder="Password" onChange={handleChange} required />
      <button type="submit">Signup</button>
    </form>
  );
};

export default Signup;
