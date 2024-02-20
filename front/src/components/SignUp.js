import React, { useState } from 'react';
import axios from 'axios';
import { navigate } from 'react-router-dom';

const SignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState('candidate');

  const handleSignUp = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/auth/signup', { email, password, userType });
      console.log(response.data);
      alert('Compte bien créer !'); 
      navigate('/login'); 
    } catch (error) {
      console.error(error.response.data.error);
    }
  };

  return (
    <div className="form-container">
      <h2>Sign Up</h2>
      <input type="email" className="form-input" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input type="password" className="form-input" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <select className="form-input" value={userType} onChange={(e) => setUserType(e.target.value)}>
        <option value="candidate">Candidate</option>
        <option value="recruiter">Recruiter</option>
      </select>
      <button className="form-button" onClick={handleSignUp}>Sign Up</button>
    </div>
  );
};

export default SignUp;
