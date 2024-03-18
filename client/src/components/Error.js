import React from "react"
import { NavLink } from "react-router-dom"
const Error = ()=>{
    return(
        <>
        <div className="container">
            <div style={{ minHeight: "85vh", display: "flex",justifyContent: "center", flexDirection:"column", alignItems:"center"}}>
                <img src="/404.svg" alt="error" style={{width:"500px", marginBottom: 20}} />
                <h2 className="mb-3">PAGE NOT FOUND</h2>
                <NavLink to = "/" className="btn btn-primary" style={{fontSize: 18}}> Back To Home PAGE</NavLink>
            </div>
        </div>
        </>
    )

}
export default Error