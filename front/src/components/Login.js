import React, { useState } from 'react';
import axios from 'axios';
import { navigate } from 'react-router-dom'; 

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null); 

  const handleLogin = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      console.log(response.data);
      navigate('/'); 
    } catch (error) {
      console.error(error.response.data.error);
      setError(error.response.data.error); 
    }
  };

  return (
    <div className="form-container">
      <h1 className="text-center">Login</h1>
      <input type="email" className="form-input" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input type="password" className="form-input" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
      {error && <p className="error-message">{error}</p>} {/* Display error if exists */}
      <button className="form-button" onClick={handleLogin}>Login</button>
    </div>
  );
};

export default Login;
