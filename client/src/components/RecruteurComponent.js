import React from 'react';
import { Navbar, Nav } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import CvAnalysisComponent from './Cvanalyse';
import CandidateDataComponent from './Analysevideo';
import ApplicantsList from './Applicantslist';
import EmotionComponent from './Lesemotions';
import EmailData from './Cnadidateinfo';
import CVVideoClassifier from './Classifyvideo';
import VideoList from './Videolist';

const RecruteurComponent = () => {
    return (<div>
        <Navbar bg="light" expand="lg">
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
                <Nav className="mr-auto">
                    <Nav.Link as={Link} to="/questionsreponses">Questions et Réponses</Nav.Link>
                    <Nav.Link as={Link} to="/offers">Offres</Nav.Link>
                    <Nav.Link as={Link} to="/call">Call</Nav.Link>
                    <Nav.Link as={Link} to="/createtechnicaltest">Create test</Nav.Link>
                    
                </Nav>
            </Navbar.Collapse>
        </Navbar>
        <body>
            <h1> Dashbord</h1>
            <ApplicantsList />
       
                <EmotionComponent/>
                <CVVideoClassifier/>
                <EmailData/>
                <VideoList/>
        </body>
        </div>
    );
};

export default RecruteurComponent;
