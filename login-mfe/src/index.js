import React from 'react';
import ReactDOM from 'react-dom';
import { createRoot } from 'react-dom/client';
import singleSpaReact from 'single-spa-react';
import LoginForm from './LoginForm';

console.log('🔵 [MFE-DEBUG] Login MFE Loading...');

// Use global React if available, fallback to imports
const ReactToUse = window.React || React;
const ReactDOMToUse = window.ReactDOM || ReactDOM;

const lifecycles = singleSpaReact({
  React: ReactToUse,
  ReactDOM: ReactDOMToUse,
  createRoot,
  rootComponent: LoginForm,
  // FIXED: Proper domElementGetter
  domElementGetter: (props) => {
    console.log('🔵 [MFE-DEBUG] Login domElementGetter called with props:', props);
    
    if (props.domElement instanceof HTMLElement) {
      return props.domElement;
    }
    
    if (typeof props.domElement === 'string') {
      const selector = props.domElement.startsWith('#') ? props.domElement : `#${props.domElement}`;
      const element = document.querySelector(selector);
      
      if (!element) {
        throw new Error(`Element not found: ${selector}`);
      }
      
      return element;
    }
    
    const fallbackElement = document.getElementById('login-mfe-container');
    if (fallbackElement) {
      return fallbackElement;
    }
    
    throw new Error('No suitable DOM element found for Login MFE');
  },
  errorBoundary: (err, info, props) => {
    console.error('🔴 [MFE-DEBUG] Login MFE Error Boundary:', err);
    return React.createElement('div', {
      style: { 
        color: 'red', 
        padding: '20px',
        border: '2px solid red',
        borderRadius: '8px',
        margin: '10px',
        backgroundColor: '#ffebee'
      }
    }, [
      React.createElement('h3', { key: 'title' }, '❌ Login MFE Error'),
      React.createElement('p', { key: 'message' }, err.message)
    ]);
  }
});

// Standalone mode
if (!window.singleSpaNavigate) {
  console.log('🔵 [MFE-DEBUG] Running in standalone mode');
  
  let container = document.getElementById('login-mfe-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'login-mfe-container';
    document.body.appendChild(container);
  }
  
  const root = createRoot(container);
  root.render(React.createElement(LoginForm, {
    sessionPath: '/session',
    newPasswordPath: '/password/new',
    newUserPath: '/users/new',
    flashAlert: null,
    flashNotice: null,
    emailValue: ''
  }));
  
  console.log('🔵 [MFE-DEBUG] Standalone mode mounted successfully');
}

// Export for single-spa
export const { bootstrap, mount, unmount } = lifecycles;

// CRITICAL: Expose globally
const globalExport = {
  bootstrap: lifecycles.bootstrap,
  mount: lifecycles.mount,
  unmount: lifecycles.unmount
};

window.loginMfe = globalExport;

console.log('✅ [MFE-DEBUG] Login MFE initialization complete');

// Also export as default
export default globalExport;
