import React, { useState, useEffect } from 'react';
import OffersByCategory from './offerparcategorie';
import { Navbar, Nav } from 'react-bootstrap';
import {Link} from 'react-router-dom';

const CandidatComponent = () => {
  
    return (<>
     <Navbar bg="light" expand="lg">
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
                <Nav className="mr-auto">
                    <Nav.Link as={Link} to="/call">Call</Nav.Link>
                    <Nav.Link as={Link} to="/interviews">Show Interviews</Nav.Link>
                </Nav>
            </Navbar.Collapse>
        </Navbar>
    <OffersByCategory/>
    </>
    );
};

export default CandidatComponent;
