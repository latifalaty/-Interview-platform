import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoginContext } from './ContextProvider/Context';
import "./Dashboardw.css";
import Video from './Video';

const Dashboard = () => {
    const { logindata, setLoginData } = useContext(LoginContext);
    const [data, setData] = useState(false);
    const history = useNavigate();

    const DashboardValid = async () => {
        let token = localStorage.getItem("usersdatatoken");

        const res = await fetch("/validuser", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": token
            }
        });

        const data = await res.json();

        if (data.status === 401 || !data) {
            history("");
        } else {
            console.log("user verified");
            setLoginData(data);
            history("/dash");
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            DashboardValid();
            setData(true);
        }, 2000);

        return () => clearTimeout(timer);
    }, []);

    return (
      <div>
                      <Video permissions={true} />
                  </div>
           
  );
};

export default Dashboard;
