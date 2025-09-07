// app/javascript/microfrontends/task-mfe.js
import React from 'react';
import { createRoot } from 'react-dom/client';
import singleSpaReact from 'single-spa-react';

// Simple React component for the microfrontend
const TaskMicrofrontend = (props) => {
  return React.createElement('div', {
    style: {
      padding: '20px',
      backgroundColor: '#e8f5e8',
      border: '2px solid #4caf50',
      borderRadius: '8px',
      margin: '20px 0',
      textAlign: 'center'
    }
  }, [
    React.createElement('h2', {
      key: 'title',
      style: { color: '#2e7d32', margin: '0 0 10px 0' }
    }, '🎉 Single-SPA Microfrontend Working!'),
    React.createElement('p', {
      key: 'desc',
      style: { color: '#388e3c', margin: '0' }
    }, 'This green box proves Single-SPA is successfully loading microfrontends in your Rails app.'),
    React.createElement('p', {
      key: 'info',
      style: { color: '#1b5e20', margin: '10px 0 0 0', fontSize: '14px' }
    }, `Microfrontend mounted at: ${new Date().toLocaleTimeString()}`)
  ]);
};

// Single-SPA React lifecycle
const lifecycles = singleSpaReact({
  React,
  createRoot,
  rootComponent: TaskMicrofrontend,
  errorBoundary: (err, info, props) => {
    console.error('Task MFE Error:', err);
    return React.createElement('div', {
      style: { color: 'red', padding: '20px' }
    }, 'Task Microfrontend Error: ' + err.message);
  },
  domElementGetter: () => {
    // Try to find existing container, create if doesn't exist
    let container = document.getElementById('task-mfe-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'task-mfe-container';
      // Find a good place to mount it
      const mainContent = document.querySelector('main') || document.body;
      mainContent.appendChild(container);
    }
    return container;
  }
});

export const { bootstrap, mount, unmount } = lifecycles;