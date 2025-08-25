// Configure your import map in config/importmap.rb. Read more: https://github.com/rails/importmap-rails
import "@hotwired/turbo-rails"
import "controllers"

console.log('Application.js loaded');

document.addEventListener('DOMContentLoaded', function() {
  // Mount Login Form
  console.log('DOM loaded, looking for login form...');
  const loginRoot = document.getElementById('login-form-root');
  
  if (loginRoot) {
    console.log('Found login root, trying to load React...');
    
    // Import all modules at once
    Promise.all([
      import('react'),
      import('react-dom/client'),
      import('components/LoginPage')
    ]).then(([React, ReactDOMClient, LoginPageModule]) => {
      console.log('All modules loaded successfully');
      
      const LoginPage = LoginPageModule.default;
      
      const props = {
        sessionPath: loginRoot.dataset.sessionPath,
        newPasswordPath: loginRoot.dataset.newPasswordPath,
        newUserPath: loginRoot.dataset.newUserPath,
        flashAlert: loginRoot.dataset.flashAlert === 'null' ? null : loginRoot.dataset.flashAlert,
        flashNotice: loginRoot.dataset.flashNotice === 'null' ? null : loginRoot.dataset.flashNotice,
        emailValue: loginRoot.dataset.emailValue || ''
      };
      
      const root = ReactDOMClient.createRoot(loginRoot);
      root.render(React.createElement(LoginPage, props));
      
    }).catch(error => {
      console.error('Error loading components:', error);
    });
  } else {
    console.log('No login root found');
  }

  // Mount Task Form
  console.log('Looking for task form...');
  const taskRoot = document.getElementById('task-form-root');
  
  if (taskRoot) {
    console.log('Found task root, trying to load React...');
    
    Promise.all([
      import('react'),
      import('react-dom/client'),
      import('components/TaskForm')
    ]).then(([React, ReactDOMClient, TaskFormModule]) => {
      console.log('TaskForm modules loaded successfully');
      
      const TaskForm = TaskFormModule.default;
      
      const props = {
        taskId: taskRoot.dataset.taskId || null,
        taskName: taskRoot.dataset.taskName || '',
        taskDescription: taskRoot.dataset.taskDescription || '',
        taskDueDate: taskRoot.dataset.taskDueDate || '',
        errors: JSON.parse(taskRoot.dataset.errors || '[]'),
        formAction: taskRoot.dataset.formAction,
        formMethod: taskRoot.dataset.formMethod,
        isEdit: taskRoot.dataset.isEdit === 'true'
      };
      
      const root = ReactDOMClient.createRoot(taskRoot);
      root.render(React.createElement(TaskForm, props));
      
    }).catch(error => {
      console.error('Error loading TaskForm:', error);
    });
  } else {
    console.log('No task root found');
  }
});

// Handle Turbo navigation
document.addEventListener('turbo:load', function() {
  // Mount Login Form
  const loginRoot = document.getElementById('login-form-root');
  
  if (loginRoot) {
    Promise.all([
      import('react'),
      import('react-dom/client'),
      import('components/LoginPage')
    ]).then(([React, ReactDOMClient, LoginPageModule]) => {
      const LoginPage = LoginPageModule.default;
      
      const props = {
        sessionPath: loginRoot.dataset.sessionPath,
        newPasswordPath: loginRoot.dataset.newPasswordPath,
        newUserPath: loginRoot.dataset.newUserPath,
        flashAlert: loginRoot.dataset.flashAlert === 'null' ? null : loginRoot.dataset.flashAlert,
        flashNotice: loginRoot.dataset.flashNotice === 'null' ? null : loginRoot.dataset.flashNotice,
        emailValue: loginRoot.dataset.emailValue || ''
      };
      
      const root = ReactDOMClient.createRoot(loginRoot);
      root.render(React.createElement(LoginPage, props));
    });
  }

  // Mount Task Form
  const taskRoot = document.getElementById('task-form-root');
  
  if (taskRoot) {
    Promise.all([
      import('react'),
      import('react-dom/client'),
      import('components/TaskForm')
    ]).then(([React, ReactDOMClient, TaskFormModule]) => {
      const TaskForm = TaskFormModule.default;
      
      const props = {
        taskId: taskRoot.dataset.taskId || null,
        taskName: taskRoot.dataset.taskName || '',
        taskDescription: taskRoot.dataset.taskDescription || '',
        taskDueDate: taskRoot.dataset.taskDueDate || '',
        errors: JSON.parse(taskRoot.dataset.errors || '[]'),
        formAction: taskRoot.dataset.formAction,
        formMethod: taskRoot.dataset.formMethod,
        isEdit: taskRoot.dataset.isEdit === 'true'
      };
      
      const root = ReactDOMClient.createRoot(taskRoot);
      root.render(React.createElement(TaskForm, props));
    });
  }
});