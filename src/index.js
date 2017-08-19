/* global Opal */

import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';

// https://stackoverflow.com/questions/31707725/embedding-a-ruby-interpreter-in-browser
Opal.load('opal-parser');

ReactDOM.render(<App />, document.getElementById('root'));
