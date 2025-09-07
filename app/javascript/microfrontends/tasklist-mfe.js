// app/javascript/microfrontends/tasklist-mfe.js
import React from 'react';
import { createRoot } from 'react-dom/client';
import TaskList from 'components/TaskList';

console.log('🔵 TaskList MFE: Module loading...');

let reactRoot = null;

const TaskListMicrofrontend = {
  bootstrap: (props) => {
    console.log('🔵 TaskList MFE: Bootstrapping...', props);
    return Promise.resolve();
  },

  mount: async (props) => {
    console.log('🔵 TaskList MFE: Mounting...', props);
    
    try {
      // Get the container element
      const container = document.getElementById('tasklist-mfe-container');
      if (!container) {
        throw new Error('TaskList MFE container not found');
      }

      // Get tasks and users data from the global window object or props
      const tasksData = window.tasksData || props.tasks || [];
      const usersData = window.usersData || props.users || [];

      console.log('🔵 TaskList MFE: Data loaded', { 
        tasksCount: tasksData.length, 
        usersCount: usersData.length 
      });

      // Create React root and render TaskList
      reactRoot = createRoot(container);
      
      // Add a wrapper with microfrontend identification
      const TaskListWrapper = () => {
        return React.createElement('div', {
          style: {
            border: '2px dashed #2196f3',
            borderRadius: '8px',
            padding: '10px',
            margin: '10px 0'
          }
        }, [
          React.createElement('div', {
            key: 'mfe-header',
            style: {
              background: '#e3f2fd',
              padding: '8px 12px',
              borderRadius: '4px',
              marginBottom: '10px',
              fontSize: '12px',
              color: '#1976d2',
              fontWeight: 'bold',
              textAlign: 'center'
            }
          }, '📋 TaskList Microfrontend (Independently Loaded)'),
          
          React.createElement(TaskList, {
            key: 'tasklist',
            tasks: tasksData,
            users: usersData
          })
        ]);
      };

      reactRoot.render(React.createElement(TaskListWrapper));
      
      console.log('✅ TaskList MFE: Mounted successfully');
      return Promise.resolve();
      
    } catch (error) {
      console.error('❌ TaskList MFE: Mount error:', error);
      throw error;
    }
  },

  unmount: (props) => {
    console.log('🔵 TaskList MFE: Unmounting...', props);
    
    try {
      if (reactRoot) {
        reactRoot.unmount();
        reactRoot = null;
      }
      
      // Clear the container
      const container = document.getElementById('tasklist-mfe-container');
      if (container) {
        container.innerHTML = '<div style="text-align: center; color: #666; padding: 20px;">TaskList Microfrontend Unloaded</div>';
      }
      
      console.log('✅ TaskList MFE: Unmounted successfully');
      return Promise.resolve();
      
    } catch (error) {
      console.error('❌ TaskList MFE: Unmount error:', error);
      return Promise.resolve(); // Don't fail the unmount process
    }
  }
};

// Export the microfrontend
export default () => Promise.resolve(TaskListMicrofrontend);