import React from 'react';
import { BrowserRouter as Router, Route,Routes} from 'react-router-dom';
import SignUp from './components/SignUp';
import Login from './components/Login';
import './App.css';
import ReconnaissanceFacial from './components/ReconnaissanceFacial';
import Header from './components/Header';

const App = () => {
  return (
    <div>
       
 <Router>
  <Header/>
  <Routes>
        <Route path="/signup" element={<SignUp />} />
        <Route path="/signin" element={<Login />} />
        <Route path="/reconnaissancefacial" element={<ReconnaissanceFacial/>} />
        </Routes>
    </Router>
     
      
      
    </div>
  );
};

export default App;
