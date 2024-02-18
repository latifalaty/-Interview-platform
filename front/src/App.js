import React from 'react';
import SignUp from './components/SignUp';
import Login from './components/Login';
import './App.css';
import ReconnaissanceFacial from './components/ReconnaissanceFacial';

const App = () => {
  return (
    <div>
      <SignUp />
      <Login />
      <ReconnaissanceFacial/>
    </div>
  );
};

export default App;
