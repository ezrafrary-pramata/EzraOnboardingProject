import React from 'react';
import ReactDOM from 'react-dom';
import { createRoot } from 'react-dom/client';
import singleSpaReact from 'single-spa-react';
import TaskList from './TaskList';

console.log('🔵 [MFE-DEBUG] TaskList MFE Loading...');

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
  rootComponent: TaskList,
  errorBoundary: (err, info, props) => {
    console.error('🔴 [MFE-DEBUG] TaskList MFE Error Boundary:', err);
    // Return error UI
    return React.createElement('div', { style: { padding: '20px', textAlign: 'center' } }, [
      React.createElement('h3', { key: 'title' }, '❌ TaskList MFE Error'),
      React.createElement('p', { key: 'message' }, err.message)
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
  
  const getDemoTasks = () => [
    { id: 1, name: 'Demo Task 1', description: 'This is a demo task', user_id: 1, due_date: '2024-12-31T15:30', assigned_to: 2 },
    { id: 2, name: 'Demo Task 2', description: 'Another demo task', user_id: 2, due_date: null, assigned_to: null },
    { id: 3, name: 'Overdue Demo Task', description: 'This task is overdue', user_id: 1, due_date: '2023-12-01T10:00', assigned_to: 1 }
  ];
  
  const getDemoUsers = () => [
    { id: 1, email_address: 'demo.user1@example.com' },
    { id: 2, email_address: 'demo.user2@example.com' }
  ];
  
  let container = document.getElementById('tasklist-mfe-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'tasklist-mfe-container';
    document.body.appendChild(container);
  }
  
  const root = createRoot(container);
  root.render(React.createElement(TaskList, {
    tasks: getDemoTasks(),
    users: getDemoUsers()
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

window.tasklistMfe = globalExport;

console.log('🔵 [MFE-DEBUG] Global export created:', {
  windowTasklistMfe: typeof window.tasklistMfe,
  methods: window.tasklistMfe ? Object.keys(window.tasklistMfe) : 'N/A',
  bootstrap: typeof window.tasklistMfe?.bootstrap,
  mount: typeof window.tasklistMfe?.mount,
  unmount: typeof window.tasklistMfe?.unmount
});

// Test the functions
try {
  if (typeof window.tasklistMfe.bootstrap === 'function') {
    console.log('✅ [MFE-DEBUG] Bootstrap function accessible');
  } else {
    console.error('❌ [MFE-DEBUG] Bootstrap function not accessible');
  }
} catch (e) {
  console.error('❌ [MFE-DEBUG] Error testing bootstrap function:', e);
}

// Also export as default
export default globalExport;

console.log('✅ [MFE-DEBUG] TaskList MFE initialization complete');
