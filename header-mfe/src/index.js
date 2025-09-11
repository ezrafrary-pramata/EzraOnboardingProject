import React from 'react';
import ReactDOM from 'react-dom';
import { createRoot } from 'react-dom/client';
import singleSpaReact from 'single-spa-react';
import Header from './Header';

console.log('🔵 [MFE-DEBUG] Header MFE Loading...');

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
  // FIXED: Enhanced domElementGetter that always returns fresh elements
  domElementGetter: (props) => {
    console.log('🔵 [MFE-DEBUG] Header domElementGetter called with props:', props);
    
    // If domElement is provided and is an HTMLElement, verify it's still in DOM
    if (props.domElement instanceof HTMLElement) {
      if (document.contains(props.domElement)) {
        console.log('🔵 [MFE-DEBUG] Props.domElement is valid HTMLElement in DOM');
        return props.domElement;
      } else {
        console.warn('🔴 [MFE-DEBUG] Props.domElement is stale, finding fresh element');
      }
    }
    
    // Always try to find fresh element by ID
    const elementId = props.domElement instanceof HTMLElement ? 
      props.domElement.id : 
      (typeof props.domElement === 'string' ? props.domElement : 'header-mfe-container');
    
    const selector = elementId.startsWith('#') ? elementId : `#${elementId}`;
    const element = document.querySelector(selector);
    
    console.log('🔵 [MFE-DEBUG] Fresh element search:', {
      selector,
      found: !!element,
      elementId: element?.id
    });
    
    if (!element) {
      console.error('🔴 [MFE-DEBUG] Element not found:', selector);
      throw new Error(`Element not found: ${selector}`);
    }
    
    return element;
  },
  errorBoundary: (err, info, props) => {
    console.error('🔴 [MFE-DEBUG] Header MFE Error Boundary:', err);
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
      React.createElement('button', {
        key: 'refresh',
        onClick: () => window.location.reload(),
        style: {
          marginTop: '10px',
          padding: '8px 16px',
          backgroundColor: '#d32f2f',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }
      }, 'Refresh Page')
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
