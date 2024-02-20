import React, { useState } from 'react';
import axios from 'axios';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      console.log(response.data);
    } catch (error) {
      console.error(error.response.data.error);
    }
  };

  return (
    <div className="form-container">
    <h1 className="text-center" >Login</h1>
    <input type="email" className="form-input" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
    <input type="password" className="form-input" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
    <button className="form-button" onClick={handleLogin}>Login</button>
  </div>
  );
};

export default Login;
