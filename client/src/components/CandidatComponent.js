import React, { useState, useEffect } from 'react';
import OffersByCategory from './offerparcategorie';
import { Navbar, Nav } from 'react-bootstrap';
import {Link} from 'react-router-dom';
import Offerslist from './Offerlist';

const CandidatComponent = () => {
  
    return (<>
     <Navbar bg="light" expand="lg">
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
                <Nav className="mr-auto">
                    <Nav.Link as={Link} to="/interviews">Show Interviews</Nav.Link>
                </Nav>
            </Navbar.Collapse>
        </Navbar>
        <Offerslist />
    </>
    );
};

export default CandidatComponent;
