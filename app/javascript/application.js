// Configure your import map in config/importmap.rb. Read more: https://github.com/rails/importmap-rails
import "@hotwired/turbo-rails"
import "controllers"

console.log('🟢 Application.js loaded');

// Custom MFE Management without Single-SPA React dependency conflicts
class MiniSingleSPA {
  constructor() {
    this.apps = [];
    this.started = false;
    this.currentPath = '';
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
      appInstance: null,
      mountedAt: null
    });

    if (this.started) {
      this.evaluateApps();
    }
  }

  async evaluateApps() {
    const currentPath = window.location.pathname;
    console.log('🔵 [DEBUG] Evaluating apps for path:', currentPath);
    
    this.currentPath = currentPath;
    
    for (const app of this.apps) {
      const shouldBeActive = this.shouldAppBeActive(app);
      const container = document.getElementById(app.customProps.domElement);
      
      console.log(`🔵 [DEBUG] App ${app.name}: shouldBeActive=${shouldBeActive}, hasContainer=${!!container}, status=${app.status}`);
      
      if (!container) {
        console.warn(`⚠️ Container #${app.customProps.domElement} not found for ${app.name}`);
        continue;
      }
      
      if (shouldBeActive && app.status !== 'MOUNTED') {
        await this.loadAndMountApp(app);
      } else if (!shouldBeActive && app.status === 'MOUNTED') {
        await this.unmountApp(app);
      }
    }
  }

  async loadAndMountApp(app) {
    try {
      console.log('🔵 [DEBUG] Loading and mounting app:', app.name);
      
      const container = document.getElementById(app.customProps.domElement);
      if (!container) {
        console.warn(`⚠️ Container #${app.customProps.domElement} not found for ${app.name}, skipping`);
        return;
      }
      
      // Clear any existing content
      container.innerHTML = '<div style="text-align: center; color: #666; padding: 20px;">Loading Microfrontend...</div>';
      
      app.status = 'LOADING';

      // Load the module if we haven't loaded it yet
      if (!app.appInstance) {
        console.log('🔵 [DEBUG] Calling loadApp function for:', app.name);
        const appModule = await app.loadApp();
        console.log('🔵 [DEBUG] App module loaded:', app.name, appModule);
        app.appInstance = appModule;
      }
      
      app.status = 'LOADED';

      // Create proper props for the MFE - this is the key fix!
      const mfeProps = {
        name: app.name,
        appName: app.name,
        // This ensures Single-SPA React gets the actual DOM element, not a string
        domElement: container,
        // Also provide the traditional domElementGetter that returns the element
        domElementGetter: () => container,
        ...app.customProps
      };

      console.log('🔵 [DEBUG] MFE props:', {
        name: mfeProps.name,
        domElement: mfeProps.domElement,
        domElementType: typeof mfeProps.domElement,
        isHTMLElement: mfeProps.domElement instanceof HTMLElement
      });

      // Bootstrap if needed
      if (app.appInstance.bootstrap) {
        console.log('🔵 [DEBUG] Bootstrapping app:', app.name);
        await app.appInstance.bootstrap(mfeProps);
      }

      // Mount the app
      if (app.appInstance.mount) {
        console.log('🔵 [DEBUG] Mounting app:', app.name);
        await app.appInstance.mount(mfeProps);
        app.status = 'MOUNTED';
        app.mountedAt = this.currentPath;
        console.log('✅ [DEBUG] App mounted successfully:', app.name);
      }
      
    } catch (error) {
      console.error('❌ [DEBUG] Error loading/mounting app:', app.name, error);
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
            <button onclick="window.location.reload()" style="margin-top: 10px; padding: 5px 10px; background: #d32f2f; color: white; border: none; border-radius: 4px; cursor: pointer;">
              Refresh Page
            </button>
          </div>
        `;
      }
    }
  }

  async unmountApp(app) {
    try {
      console.log('🔵 [DEBUG] Unmounting app:', app.name);
      
      if (app.appInstance && app.appInstance.unmount) {
        const container = document.getElementById(app.customProps.domElement);
        const mfeProps = {
          name: app.name,
          appName: app.name,
          domElement: container,
          domElementGetter: () => container,
          ...app.customProps
        };
        await app.appInstance.unmount(mfeProps);
      }
      
      app.status = 'LOADED';
      app.mountedAt = null;
      
      // Clear container
      const container = document.getElementById(app.customProps.domElement);
      if (container) {
        container.innerHTML = '<div style="text-align: center; color: #666; padding: 10px;">Microfrontend Unloaded</div>';
      }
      
      console.log('✅ [DEBUG] App unmounted successfully:', app.name);
    } catch (error) {
      console.error('❌ [DEBUG] Error unmounting app:', app.name, error);
    }
  }

  shouldAppBeActive(app) {
    const currentPath = window.location.pathname;
    
    if (Array.isArray(app.activeWhen)) {
      return app.activeWhen.some(path => {
        return currentPath.startsWith(path) || currentPath === path;
      });
    }

    if (typeof app.activeWhen === 'string') {
      return currentPath.startsWith(app.activeWhen) || currentPath === app.activeWhen;
    }

    if (typeof app.activeWhen === 'function') {
      return app.activeWhen(window.location);
    }

    return false;
  }

  start() {
    console.log('🔵 [DEBUG] Starting Mini Single-SPA');
    this.started = true;
    this.evaluateApps();
    console.log('✅ [DEBUG] Mini Single-SPA started successfully!');
  }

  getAppNames() {
    return this.apps.map(app => app.name);
  }
}

// Create global instance
const miniSPA = new MiniSingleSPA();

// Initialize Single-SPA
function initSingleSPA() {
  console.log('🔵 [DEBUG] Initializing Single-SPA system...');

  // Register the Header MFE (always active)
  miniSPA.registerApplication({
    name: 'header-mfe',
    loadApp: async () => {
      console.log('🔵 [DEBUG] Starting Header MFE load process...');
      
      try {
        // Check container exists
        const container = document.getElementById('header-mfe-container');
        if (!container) {
          throw new Error('header-mfe-container not found in DOM');
        }
        
        // Load React dependencies
        if (typeof window.React === 'undefined') {
          await new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://unpkg.com/react@18/umd/react.development.js';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
          });
        }
        
        if (typeof window.ReactDOM === 'undefined') {
          await new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://unpkg.com/react-dom@18/umd/react-dom.development.js';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
          });
        }
        
        // Test MFE URL accessibility
        const testUrl = 'http://localhost:8082/header-mfe.js';
        const testResponse = await fetch(testUrl, { method: 'HEAD' });
        if (!testResponse.ok) {
          throw new Error(`Header MFE server not accessible: ${testResponse.status}`);
        }
        
        // Load the MFE script
        const scriptId = 'header-mfe-script';
        const existingScript = document.getElementById(scriptId);
        if (existingScript) {
          existingScript.remove();
        }
        
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.id = scriptId;
          script.src = testUrl + '?t=' + Date.now();
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
        
        // Wait for global to be available
        let attempts = 0;
        while (!window.headerMfe && attempts < 10) {
          await new Promise(resolve => setTimeout(resolve, 100));
          attempts++;
        }
        
        if (!window.headerMfe) {
          throw new Error('Header MFE global not found');
        }
        
        console.log('✅ [DEBUG] Header MFE loaded successfully');
        return window.headerMfe;
        
      } catch (error) {
        console.error('❌ Header MFE load failed:', error);
        throw error;
      }
    },
    activeWhen: () => true,
    customProps: {
      domElement: 'header-mfe-container'
    }
  });

  // Register TaskList MFE
  miniSPA.registerApplication({
    name: 'tasklist-mfe',
    loadApp: async () => {
      console.log('🔵 [DEBUG] Starting TaskList MFE load process...');
      
      try {
        const container = document.getElementById('tasklist-mfe-container');
        if (!container) {
          throw new Error('tasklist-mfe-container not found in DOM');
        }
        
        const testUrl = 'http://localhost:8081/tasklist-mfe.js';
        const testResponse = await fetch(testUrl, { method: 'HEAD' });
        if (!testResponse.ok) {
          throw new Error(`TaskList MFE server not accessible: ${testResponse.status}`);
        }
        
        const scriptId = 'tasklist-mfe-script';
        const existingScript = document.getElementById(scriptId);
        if (existingScript) {
          existingScript.remove();
        }
        
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.id = scriptId;
          script.src = testUrl + '?t=' + Date.now();
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
        
        let attempts = 0;
        while (!window.tasklistMfe && attempts < 10) {
          await new Promise(resolve => setTimeout(resolve, 100));
          attempts++;
        }
        
        if (!window.tasklistMfe) {
          throw new Error('TaskList MFE global not found');
        }
        
        console.log('✅ [DEBUG] TaskList MFE loaded successfully');
        return window.tasklistMfe;
        
      } catch (error) {
        console.error('❌ TaskList MFE load failed:', error);
        throw error;
      }
    },
    activeWhen: ['/tasks'],
    customProps: {
      domElement: 'tasklist-mfe-container'
    }
  });

  // Register Login MFE
  miniSPA.registerApplication({
    name: 'login-mfe',
    loadApp: async () => {
      console.log('🔵 [DEBUG] Starting Login MFE load process...');
      
      try {
        const container = document.getElementById('login-mfe-container');
        if (!container) {
          throw new Error('login-mfe-container not found in DOM');
        }
        
        const testUrl = 'http://localhost:8083/login-mfe.js';
        const testResponse = await fetch(testUrl, { method: 'HEAD' });
        if (!testResponse.ok) {
          throw new Error(`Login MFE server not accessible: ${testResponse.status}`);
        }
        
        const scriptId = 'login-mfe-script';
        const existingScript = document.getElementById(scriptId);
        if (existingScript) {
          existingScript.remove();
        }
        
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = testUrl + '?t=' + Date.now();
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
        
        let attempts = 0;
        while (!window.loginMfe && attempts < 10) {
          await new Promise(resolve => setTimeout(resolve, 100));
          attempts++;
        }
        
        if (!window.loginMfe) {
          throw new Error('Login MFE global not found');
        }
        
        console.log('✅ [DEBUG] Login MFE loaded successfully');
        return window.loginMfe;
        
      } catch (error) {
        console.error('❌ Login MFE load failed:', error);
        throw error;
      }
    },
    activeWhen: ['/session/new'],
    customProps: {
      domElement: 'login-mfe-container'
    }
  });

  miniSPA.start();

  // Make available globally for debugging
  window.miniSPA = miniSPA;
  window.singleSpa = {
    getAppNames: () => miniSPA.getAppNames(),
    apps: miniSPA.apps
  };

  console.log('✅ [DEBUG] Single-SPA system fully initialized!');
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', function() {
  console.log('🟢 [DEBUG] DOM loaded, initializing Single-SPA...');
  initSingleSPA();
});

// Handle Turbo navigation properly
document.addEventListener('turbo:load', function() {
  console.log('🟡 [DEBUG] Turbo navigation detected');
  console.log('🟡 [DEBUG] Current path:', window.location.pathname);
  
  // Re-evaluate apps for new route
  if (window.miniSPA && window.miniSPA.started) {
    console.log('🔵 [DEBUG] Re-evaluating apps for route:', window.location.pathname);
    
    // Use setTimeout to ensure DOM is fully ready
    setTimeout(() => {
      window.miniSPA.evaluateApps();
    }, 50);
  } else {
    console.log('🔵 [DEBUG] Mini Single-SPA not ready, initializing...');
    initSingleSPA();
  }
});

// Handle browser back/forward buttons
window.addEventListener('popstate', function() {
  console.log('🔵 [DEBUG] Popstate detected, re-evaluating apps');
  if (window.miniSPA && window.miniSPA.started) {
    setTimeout(() => {
      window.miniSPA.evaluateApps();
    }, 50);
  }
});
