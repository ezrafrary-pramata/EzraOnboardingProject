import React from 'react';
import ReactDOM from 'react-dom';
import { createRoot } from 'react-dom/client';
import singleSpaReact from 'single-spa-react';
import Header from './Header';

console.log('🔵 [MFE-DEBUG] Header MFE Loading...');
console.log('🔵 [MFE-DEBUG] Environment check:', {
  React: typeof React,
  ReactDOM: typeof ReactDOM,
  createRoot: typeof createRoot,
  singleSpaReact: typeof singleSpaReact,
  Header: typeof Header,
  windowReact: typeof window.React,
  windowReactDOM: typeof window.ReactDOM,
  userAgent: navigator.userAgent.substring(0, 50)
});

// Use global React if available, fallback to imports
const ReactToUse = window.React || React;
const ReactDOMToUse = window.ReactDOM || ReactDOM;

console.log('🔵 [MFE-DEBUG] Using React libraries:', {
  ReactToUse: typeof ReactToUse,
  ReactDOMToUse: typeof ReactDOMToUse
});

const lifecycles = singleSpaReact({
  React: ReactToUse,
  ReactDOM: ReactDOMToUse,
  createRoot,
  rootComponent: Header,
  errorBoundary: (err, info, props) => {
    console.error('🔴 [MFE-DEBUG] Header MFE Error Boundary:', {
      error: err,
      errorInfo: info,
      props: props
    });
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
      React.createElement('h3', { key: 'title' }, '❌ Header MFE Error'),
      React.createElement('p', { key: 'message' }, err.message),
      React.createElement('details', { key: 'details' }, [
        React.createElement('summary', { key: 'summary' }, 'Error Details'),
        React.createElement('pre', { 
          key: 'stack', 
          style: { fontSize: '12px', overflow: 'auto', maxHeight: '200px' } 
        }, err.stack)
      ])
    ]);
  }
});

console.log('🔵 [MFE-DEBUG] Single-SPA lifecycles created:', {
  bootstrap: typeof lifecycles.bootstrap,
  mount: typeof lifecycles.mount,
  unmount: typeof lifecycles.unmount
});

// Standalone mode
if (!window.singleSpaNavigate) {
  console.log('🔵 [MFE-DEBUG] Running in standalone mode');
  
  let container = document.getElementById('header-mfe-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'header-mfe-container';
    document.body.appendChild(container);
  }
  
  const root = createRoot(container);
  root.render(React.createElement(Header, {
    isAuthenticated: true,
    userEmail: 'demo.user@example.com',
    organizationName: 'Demo Organization'
  }));
  
  console.log('🔵 [MFE-DEBUG] Standalone mode mounted successfully');
}

// Export for single-spa
export const { bootstrap, mount, unmount } = lifecycles;

// CRITICAL: Expose globally with enhanced debugging
const globalExport = {
  bootstrap: lifecycles.bootstrap,
  mount: lifecycles.mount,
  unmount: lifecycles.unmount
};

window.headerMfe = globalExport;

console.log('🔵 [MFE-DEBUG] Global export created:', {
  windowHeaderMfe: typeof window.headerMfe,
  methods: window.headerMfe ? Object.keys(window.headerMfe) : 'N/A',
  bootstrap: typeof window.headerMfe?.bootstrap,
  mount: typeof window.headerMfe?.mount,
  unmount: typeof window.headerMfe?.unmount
});

// Test the functions
try {
  if (typeof window.headerMfe.bootstrap === 'function') {
    console.log('✅ [MFE-DEBUG] Bootstrap function accessible');
  } else {
    console.error('❌ [MFE-DEBUG] Bootstrap function not accessible');
  }
} catch (e) {
  console.error('❌ [MFE-DEBUG] Error testing bootstrap function:', e);
}

// Also export as default
export default globalExport;

console.log('✅ [MFE-DEBUG] Header MFE initialization complete');

// Debug helper for manual testing
window.debugHeaderMFE = () => {
  console.log('🔍 [MFE-DEBUG] Manual debug check:', {
    windowHeaderMfe: window.headerMfe,
    methods: window.headerMfe ? Object.keys(window.headerMfe) : 'N/A',
    container: document.getElementById('header-mfe-container'),
    React: typeof window.React,
    ReactDOM: typeof window.ReactDOM
  });
};
