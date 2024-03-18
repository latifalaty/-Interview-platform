import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import Context from './components/ContextProvider/Context';
import { BrowserRouter } from "react-router-dom"
import { SocketProvider } from './components/context/SocketProvider';


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <Context>
    <SocketProvider>
  <BrowserRouter>
      <App />
  </BrowserRouter>
  </SocketProvider>
  </Context>
);


