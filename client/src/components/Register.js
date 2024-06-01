import React, { useState } from 'react';
import { NavLink } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "./mix.css"

const Register = () => {
    const [passShow, setPassShow] = useState(false);
    const [cpassShow, setCPassShow] = useState(false);

    const [inpval, setInpval] = useState({
        fname: "",
        lname: "",
        email: "",
        password: "",
        cpassword: "",
        userType: "",
        company: "",
        jobTitle: "",
        education: "",
        experience: ""
    });

    const setVal = (e) => {
        const { name, value } = e.target;
        setInpval(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const addUserdata = async (e) => {
        e.preventDefault();

        if (!inpval.userType) {
            toast.error("Please select a User Type", { position: "top-center" });
            return;
        }

        if (!inpval.email) {
            toast.error("Please enter your email address", { position: "top-center" });
            return;
        }

        try {
            const response = await fetch("/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(inpval)
            });

            const data = await response.json();

            if (response.status === 201) {
                toast.success("Registration Successful! 😃", { position: "top-center" });
                setInpval({
                    fname: "",
                    lname: "",
                    email: "",
                    password: "",
                    cpassword: "",
                    userType: "",
                    company: "",
                    jobTitle: "",
                    education: "",
                    experience: ""
                });
            } else {
                console.error("Error:", data.message);
                toast.error(data.message, { position: "top-center" });
            }
        } catch (error) {
            console.error("Error:", error);
            toast.error("An error occurred. Please try again later.", { position: "top-center" });
        }
    }


    return (
        <div>
            <section>
                <div className="form_data">
                    <div className="form_heading">
                        <h1>Sign Up</h1>
                        <h2>Welcome to the Mern app</h2>
                    </div>

                    <form>
                        <div className="form_input">
                            <label htmlFor="fname">First Name</label>
                            <input type="text" onChange={setVal} value={inpval.fname} name="fname" id="fname" placeholder='Enter Your First Name' />
                        </div>
                        <div className="form_input">
                            <label htmlFor="lname">Last Name</label>
                            <input type="text" onChange={setVal} value={inpval.lname} name="lname" id="lname" placeholder='Enter Your Last Name' />
                        </div>
                        <div className="form_input">
                            <label htmlFor="email">Email</label>
                            <input type="email" onChange={setVal} value={inpval.email} name="email" id="email" placeholder='Enter Your Email Address' />
                        </div>
                        <div className="form_input">
                            <label htmlFor="password">Password</label>
                            <div className="two">
                                <input type={!passShow ? "password" : "text"} value={inpval.password} onChange={setVal} name="password" id="password" placeholder='Enter Your Password' />
                                <div className="showpass" onClick={() => setPassShow(!passShow)}>
                                    {!passShow ? "Show" : "Hide"}
                                </div>
                            </div>
                        </div>
                        <div className="form_input">
                            <label htmlFor="cpassword">Confirm Password</label>
                            <div className="two">
                                <input type={!cpassShow ? "password" : "text"} value={inpval.cpassword} onChange={setVal} name="cpassword" id="cpassword" placeholder='Confirm Your Password' />
                                <div className="showpass" onClick={() => setCPassShow(!cpassShow)}>
                                    {!cpassShow ? "Show" : "Hide"}
                                </div>
                            </div>
                        </div>
                        <div className="form_input">
                            <label htmlFor="userType">User Type</label>
                            <select name="userType" id="userType" onChange={setVal} value={inpval.userType}>
                                <option value="">Select User Type</option>
                                <option value="recruiter">Recruiter</option>
                                <option value="candidate">Candidate</option>
                            </select>
                        </div>
                        {/* Champs supplémentaires spécifiques aux recruteurs */}
                        {inpval.userType === "recruiter" && (
                            <>
                                <div className="form_input">
                                    <label htmlFor="company">Company</label>
                                    <input type="text" onChange={setVal} value={inpval.company} name="company" id="company" placeholder='Enter Company Name' />
                                </div>
                                <div className="form_input">
                                    <label htmlFor="jobTitle">Job Title</label>
                                    <input type="text" onChange={setVal} value={inpval.jobTitle} name="jobTitle" id="jobTitle" placeholder='Enter Job Title' />
                                </div>
                            </>
                        )}
                        {/* Champs supplémentaires spécifiques aux candidats */}
                        {inpval.userType === "candidate" && (
                            <>
                                <div className="form_input">
                                    <label htmlFor="education">Education</label>
                                    <input type="text" onChange={setVal} value={inpval.education} name="education" id="education" placeholder='Enter Your Education' />
                                </div>
                                <div className="form_input">
                                    <label htmlFor="experience">Experience</label>
                                    <input type="text" onChange={setVal} value={inpval.experience} name="experience" id="experience" placeholder='Enter Your Experience' />
                                </div>
                            </>
                        )}
                        <button className='btn' onClick={addUserdata}>Sign Up</button>
                        <p>Already have an account? <NavLink to="/login">Log In</NavLink></p>
                    </form>
                    <ToastContainer />
                </div>
            </section>
        </div>
    )
}

export default Register;
