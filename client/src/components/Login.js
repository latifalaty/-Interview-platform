import React, { useState } from 'react';
import { NavLink, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "./mix.css"

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const loginUser = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch("/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();
            console.log("Response:", data);

            if (response.status === 200) {
                // Stocker le token dans localStorage ou sessionStorage
                localStorage.setItem('token', data.token);
                // Sauvegarder l'e-mail dans le local storage
                localStorage.setItem('userEmail', data.user.email); // Utilisation de 'userEmail' au lieu de 'usermail'

                // Rediriger en fonction du type d'utilisateur
                if (data.user && data.user.userType === 'recruiter') {
                    navigate("/recruiter"); // Rediriger vers la page du recruteur
                } else if (data.user && data.user.userType === 'candidate') {
                    navigate("/candidate"); // Rediriger vers la page du candidat
                }
                toast.success("Logged in successfully!", {
                    position: "top-center"
                });
            } else {
                toast.error(data.error, {
                    position: "top-center"
                });
            }
        } catch (error) {
            console.error("Error:", error);
        }
    }

    return (
        <>
            <section>
                <div className="form_data">
                    <div className="form_heading">
                        <h1>Login</h1>
                    </div>

                    <form>
                        <div className="form_input">
                            <label htmlFor="email">Email</label>
                            <input type="email" onChange={(e) => setEmail(e.target.value)} value={email} name="email" id="email" placeholder='Enter Your Email Address' />
                        </div>
                        <div className="form_input">
                            <label htmlFor="password">Password</label>
                            <div className="two">
                                <input type="password" onChange={(e) => setPassword(e.target.value)} value={password} name="password" id="password" placeholder='Enter Your Password' />
                            </div>
                        </div>
                        <button className='btn' onClick={loginUser}>Login</button>
                        <p>Don't have an account? <NavLink to="/register">Sign Up</NavLink></p>
                    </form>
                    <ToastContainer />
                </div>
            </section>
        </>
    )
}

export default Login;
