import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';

import '@shopify/polaris/dist/styles.css';

import {AppProvider} from '@shopify/polaris';

ReactDOM.render(
  <React.StrictMode>
    <AppProvider>
      <App />
    </AppProvider>
  </React.StrictMode>,
  document.getElementById('root')
);