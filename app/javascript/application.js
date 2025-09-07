// Configure your import map in config/importmap.rb. Read more: https://github.com/rails/importmap-rails
import "@hotwired/turbo-rails"
import "controllers"

console.log('🟢 Application.js loaded');

// Self-contained Single-SPA implementation
class MiniSingleSPA {
  constructor() {
    this.apps = [];
    this.started = false;
    console.log('🔵 Mini Single-SPA initialized');
  }

  registerApplication(config) {
    console.log('🔵 Registering application:', config.name, config);
    this.apps.push({
      name: config.name,
      loadApp: config.loadApp,
      activeWhen: config.activeWhen,
      customProps: config.customProps || {},
      status: 'NOT_LOADED',
      appInstance: null
    });

    if (this.started) {
      this.loadAndMountApp(this.apps[this.apps.length - 1]);
    }
  }

  async loadAndMountApp(app) {
    try {
      console.log('🔵 Loading app:', app.name);
      console.log('🔵 App config:', app);
      console.log('🔵 Current path:', window.location.pathname);
      console.log('🔵 Should be active:', this.shouldAppBeActive(app));
      
      app.status = 'LOADING';

      console.log('🔵 Calling loadApp function for:', app.name);
      const appModule = await app.loadApp();
      console.log('🔵 App module loaded:', app.name, appModule);
      
      app.appInstance = appModule;
      app.status = 'LOADED';

      if (this.shouldAppBeActive(app)) {
        console.log('🔵 Mounting app:', app.name);
        app.status = 'MOUNTING';

        if (appModule.bootstrap) {
          console.log('🔵 Bootstrapping app:', app.name);
          await appModule.bootstrap(app.customProps);
        }

        if (appModule.mount) {
          console.log('🔵 Mounting app:', app.name);
          await appModule.mount(app.customProps);
        }

        app.status = 'MOUNTED';
        console.log('✅ App mounted successfully:', app.name);
      } else {
        console.log('🟡 App should not be active:', app.name);
      }
    } catch (error) {
      console.error('❌ Error loading/mounting app:', app.name, error);
      console.error('❌ Error stack:', error.stack);
      app.status = 'LOAD_ERROR';
      
      // Show error in UI
      const container = document.getElementById(app.customProps.domElement);
      if (container) {
        container.innerHTML = `
          <div style="background: #ffebee; border: 2px solid #f44336; border-radius: 8px; padding: 20px; margin: 10px 0;">
            <h3 style="color: #d32f2f; margin: 0 0 10px 0;">❌ ${app.name} Error</h3>
            <p style="color: #c62828; margin: 0; font-family: monospace; font-size: 12px;">
              ${error.message}
            </p>
            <details style="margin-top: 10px;">
              <summary style="cursor: pointer; color: #d32f2f;">Show Stack Trace</summary>
              <pre style="font-size: 10px; overflow: auto; max-height: 200px; background: #fff; padding: 10px; margin-top: 5px;">${error.stack}</pre>
            </details>
          </div>
        `;
      }
    }
  }

  shouldAppBeActive(app) {
    const currentPath = window.location.pathname;
    console.log('🔵 Checking if app should be active:', {
      app: app.name,
      currentPath,
      activeWhen: app.activeWhen
    });

    if (Array.isArray(app.activeWhen)) {
      const result = app.activeWhen.some(path => {
        const matches = currentPath.startsWith(path) || currentPath === path;
        console.log('🔵 Path check:', { path, currentPath, matches });
        return matches;
      });
      console.log('🔵 Array result:', result);
      return result;
    }

    if (typeof app.activeWhen === 'string') {
      const result = currentPath.startsWith(app.activeWhen) || currentPath === app.activeWhen;
      console.log('🔵 String result:', result);
      return result;
    }

    if (typeof app.activeWhen === 'function') {
      const result = app.activeWhen(window.location);
      console.log('🔵 Function result:', result);
      return result;
    }

    console.log('🔵 Default result: false');
    return false;
  }

  start() {
    console.log('🔵 Starting Mini Single-SPA');
    console.log('🔵 Registered apps:', this.apps.map(app => ({ name: app.name, status: app.status })));
    this.started = true;

    this.apps.forEach(app => {
      console.log('🔵 Processing app:', app.name, 'Status:', app.status);
      if (app.status === 'NOT_LOADED') {
        this.loadAndMountApp(app);
      }
    });

    console.log('✅ Mini Single-SPA started successfully!');
  }

  getAppNames() {
    return this.apps.map(app => app.name);
  }
}

// Create global instance
const miniSPA = new MiniSingleSPA();

// Simple task microfrontend
const createTaskMicrofrontend = () => {
  console.log('🔵 Creating demo task microfrontend...');
  return Promise.resolve({
    bootstrap: () => {
      console.log('🔵 Demo task microfrontend bootstrapping...');
      return Promise.resolve();
    },

    mount: () => {
      console.log('✅ Demo task microfrontend mounting...');
      
      const container = document.getElementById('task-mfe-container');
      if (container) {
        container.innerHTML = `
          <div style="
            padding: 20px; 
            background: linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%); 
            border: 3px solid #4caf50; 
            border-radius: 12px; 
            margin: 20px 0; 
            text-align: center;
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
          ">
            <h2 style="color: #2e7d32; margin: 0 0 15px 0; font-size: 24px;">
              🎉 Single-SPA Demo Microfrontend Working!
            </h2>
            <p style="color: #388e3c; margin: 0 0 10px 0; font-size: 16px;">
              This proves that Single-SPA is successfully loading and mounting microfrontends in your Rails app!
            </p>
            <div style="background: rgba(255,255,255,0.8); padding: 10px; border-radius: 6px; margin-top: 15px;">
              <p style="color: #1b5e20; margin: 0; font-size: 14px;">
                ✅ Microfrontend Status: <strong>MOUNTED</strong><br>
                🕐 Mounted at: <strong>${new Date().toLocaleTimeString()}</strong><br>
                📍 Route: <strong>${window.location.pathname}</strong>
              </p>
            </div>
            <div style="margin-top: 15px;">
              <button onclick="console.log('Mini Single-SPA Debug:', window.miniSPA)" 
                      style="background: #4caf50; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">
                Debug in Console
              </button>
            </div>
          </div>
        `;
        console.log('✅ Demo task microfrontend mounted successfully');
      } else {
        console.error('❌ Container #task-mfe-container not found');
      }
      return Promise.resolve();
    },

    unmount: () => {
      console.log('🔵 Demo task microfrontend unmounting...');
      const container = document.getElementById('task-mfe-container');
      if (container) {
        container.innerHTML = '<div style="text-align: center; color: #666; padding: 40px;">Loading Single-SPA Demo Microfrontend...</div>';
      }
      return Promise.resolve();
    }
  });
};

// Test import function
async function testTaskListImport() {
  console.log('🔵 Testing TaskList import...');
  try {
    const module = await import('microfrontends/tasklist-mfe');
    console.log('✅ TaskList import successful:', module);
    return module;
  } catch (error) {
    console.error('❌ TaskList import failed:', error);
    throw error;
  }
}

// Initialize Single-SPA
function initSingleSPA() {
  console.log('🔵 Initializing Single-SPA system...');

  // Register the Header microfrontend (appears on ALL routes)
  miniSPA.registerApplication({
    name: 'header-mfe',
    loadApp: async () => {
      console.log('🔵 Header MFE loadApp called...');
      try {
        const module = await import('microfrontends/header-mfe');
        console.log('🔵 Header module imported:', module);
        
        if (module.default && typeof module.default === 'function') {
          const appInstance = await module.default();
          console.log('🔵 Header app instance created:', appInstance);
          return appInstance;
        } else {
          throw new Error('Header module does not export a default function');
        }
      } catch (error) {
        console.error('❌ Header loadApp error:', error);
        throw error;
      }
    },
    activeWhen: () => true, // Always active on all routes
    customProps: {
      domElement: 'header-mfe-container'
    }
  });

  // Register the demo task microfrontend
  miniSPA.registerApplication({
    name: 'task-mfe',
    loadApp: createTaskMicrofrontend,
    activeWhen: ['/tasks', '/'],
    customProps: {
      domElement: 'task-mfe-container'
    }
  });

  // Register the TaskList microfrontend with enhanced error handling
  miniSPA.registerApplication({
    name: 'tasklist-mfe',
    loadApp: async () => {
      console.log('🔵 TaskList MFE loadApp called...');
      try {
        const module = await testTaskListImport();
        console.log('🔵 TaskList module imported:', module);
        
        if (module.default && typeof module.default === 'function') {
          const appInstance = await module.default();
          console.log('🔵 TaskList app instance created:', appInstance);
          return appInstance;
        } else {
          throw new Error('TaskList module does not export a default function');
        }
      } catch (error) {
        console.error('❌ TaskList loadApp error:', error);
        throw error;
      }
    },
    activeWhen: ['/tasks'], // Will match /tasks, /tasks/1, /tasks/edit, etc.
    customProps: {
      domElement: 'tasklist-mfe-container'
    }
  });

  // Start the system
  miniSPA.start();

  // Make available globally for debugging
  window.miniSPA = miniSPA;
  window.singleSpa = {
    getAppNames: () => miniSPA.getAppNames(),
    apps: miniSPA.apps
  };

  console.log('✅ Single-SPA system fully initialized!');
}

document.addEventListener('DOMContentLoaded', function() {
  console.log('🟢 DOM loaded, initializing Single-SPA...');
  initSingleSPA();
});

// Handle Turbo navigation
document.addEventListener('turbo:load', function() {
  console.log('🟡 Turbo navigation detected');
  
  // Re-evaluate apps for new route
  if (window.miniSPA && window.miniSPA.started) {
    console.log('🔵 Re-evaluating apps for route:', window.location.pathname);
    window.miniSPA.apps.forEach(app => {
      if (window.miniSPA.shouldAppBeActive(app) && app.status !== 'MOUNTED') {
        window.miniSPA.loadAndMountApp(app);
      }
    });
  } else {
    console.log('🔵 Mini Single-SPA not ready, initializing...');
    initSingleSPA();
  }
});