import React, { useContext } from 'react'
import Avatar from '@mui/material/Avatar';
import "./header.css"
import { LoginContext } from './ContextProvider/Context';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { useNavigate, NavLink } from "react-router-dom"
import axios from "axios";


const Header = () => {

    const { logindata, setLoginData } = useContext(LoginContext);

    const history = useNavigate();
    let navigate = useNavigate();

    const [anchorEl, setAnchorEl] = React.useState(null);
    const open = Boolean(anchorEl);
    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };
    const handleCloseUserMenu = () => {
        setAnchorEl(null);
      };
    const handleLogoutClick = () => {
        
        axios
          .get("/logout", { withCredentials: true })
          .then((response) => {
            navigate("/");
          })
          .catch((error) => {
            console.error("Logout failed:", error);
          });
        handleCloseUserMenu();
      };

    

const goDash = () => {
    history("/dash")
}




return (
    <>
        <header>
            <nav>

                <NavLink to="/"><h1>Mern App</h1></NavLink>
                <div className="avtar">
                    {
                        (logindata?.ValidUserOne) ? <Avatar style={{ background: "salmon", fontWeight: "bold", textTransform: "capitalize" }} onClick={handleClick}>{logindata.ValidUserOne.fname[0].toUpperCase()}</Avatar> :
                            <Avatar style={{ background: "blue" }} onClick={handleClick} />
                    }

                </div>

                <Menu
                    id="basic-menu"
                    anchorEl={anchorEl}
                    open={open}
                    onClose={handleClose}
                    MenuListProps={{
                        'aria-labelledby': 'basic-button',
                    }}
                >
                    {
                        <>
                            <MenuItem onClick={() => {
                                goDash()
                                handleClose()
                            }}>Profile</MenuItem>
                            <MenuItem onClick={() => {
                                handleLogoutClick()
                                handleCloseUserMenu()
                            }}>Logout</MenuItem>
                        </>

                    }

                </Menu>
            </nav>
        </header>
    </>
)
             
                }
export default Header