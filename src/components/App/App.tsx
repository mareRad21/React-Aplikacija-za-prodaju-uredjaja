import React from 'react'; 
import './App.css';
import {Container, Card} from 'react-bootstrap';
import {faHome, faUpload} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

function App() {
  return (
    <Container className="App"> 
      <FontAwesomeIcon icon={faHome}/> Home
    </Container>
  );
}

export default App;
