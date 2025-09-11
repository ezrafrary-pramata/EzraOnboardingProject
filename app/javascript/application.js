// Configure your import map in config/importmap.rb. Read more: https://github.com/rails/importmap-rails
import "@hotwired/turbo-rails"
import "controllers"

console.log('🟢 Application.js loaded');

// Custom MFE Management with enhanced Turbo support
class MiniSingleSPA {
  constructor() {
    this.apps = [];
    this.started = false;
    this.currentPath = '';
    this.isNavigating = false; // Track navigation state
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
      mountedAt: null,
      lastContainer: null // Track last known container
    });

    if (this.started && !this.isNavigating) {
      this.evaluateApps();
    }
  }

  // FIXED: Always get fresh DOM element reference
  getDOMElement(elementSelector) {
    if (!elementSelector) {
      console.error('🔴 No element selector provided');
      return null;
    }

    // NEVER use cached elements - always query fresh from DOM
    let element = null;

    if (typeof elementSelector === 'string') {
      const selector = elementSelector.startsWith('#') ? elementSelector : `#${elementSelector}`;
      element = document.querySelector(selector);
      
      if (!element) {
        console.warn(`🔴 Element not found with selector: ${selector}`);
        return null;
      }
    } else if (elementSelector instanceof HTMLElement) {
      // Even if it's an HTMLElement, verify it's still in the DOM
      if (document.contains(elementSelector)) {
        element = elementSelector;
      } else {
        console.warn('🔴 Provided HTMLElement is no longer in DOM, searching fresh...');
        // Try to find it again
        const id = elementSelector.id;
        if (id) {
          element = document.getElementById(id);
        }
      }
    }

    if (!element) {
      console.error('🔴 Invalid element selector type or element not found:', typeof elementSelector);
      return null;
    }

    console.log('🔵 Fresh DOM element found:', element);
    return element;
  }

  async evaluateApps() {
    if (this.isNavigating) {
      console.log('🔵 Navigation in progress, skipping evaluation');
      return;
    }

    const currentPath = window.location.pathname;
    console.log('🔵 [DEBUG] Evaluating apps for path:', currentPath);
    
    this.currentPath = currentPath;
    
    for (const app of this.apps) {
      const shouldBeActive = this.shouldAppBeActive(app);
      
      // ALWAYS get fresh container reference
      const container = this.getDOMElement(app.customProps.domElement);
      
      console.log(`🔵 [DEBUG] App ${app.name}: shouldBeActive=${shouldBeActive}, hasContainer=${!!container}, status=${app.status}`);
      
      if (!container) {
        console.warn(`⚠️ Container element not found for ${app.name}: ${app.customProps.domElement}`);
        // If app was mounted but container is gone, mark as unmounted
        if (app.status === 'MOUNTED') {
          app.status = 'NOT_MOUNTED';
          app.lastContainer = null;
        }
        continue;
      }

      // Check if container changed (Turbo navigation)
      if (app.lastContainer && app.lastContainer !== container) {
        console.log(`🔄 Container changed for ${app.name}, unmounting first`);
        if (app.status === 'MOUNTED') {
          await this.unmountApp(app);
        }
      }

      app.lastContainer = container;
      
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
      
      // ALWAYS get fresh container
      const container = this.getDOMElement(app.customProps.domElement);
      if (!container) {
        console.warn(`⚠️ Container element not found for ${app.name}, skipping`);
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

      // CRITICAL: Create props with fresh DOM element and getter
      const mfeProps = {
        name: app.name,
        appName: app.name,
        // Pass the actual HTMLElement
        domElement: container,
        // FIXED: domElementGetter that ALWAYS returns fresh element
        domElementGetter: () => {
          const freshContainer = this.getDOMElement(app.customProps.domElement);
          console.log('🔵 [DEBUG] domElementGetter called, returning fresh container:', freshContainer);
          return freshContainer;
        },
        ...app.customProps
      };

      console.log('🔵 [DEBUG] MFE props:', {
        name: mfeProps.name,
        domElement: mfeProps.domElement,
        domElementType: typeof mfeProps.domElement,
        isHTMLElement: mfeProps.domElement instanceof HTMLElement,
        elementId: mfeProps.domElement?.id
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
        app.lastContainer = container;
        console.log('✅ [DEBUG] App mounted successfully:', app.name);
      }
      
    } catch (error) {
      console.error('❌ [DEBUG] Error loading/mounting app:', app.name, error);
      app.status = 'LOAD_ERROR';
      
      // Show error in UI
      const container = this.getDOMElement(app.customProps.domElement);
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
        // Get the container that was used for mounting
        const container = app.lastContainer || this.getDOMElement(app.customProps.domElement);
        
        if (container) {
          const mfeProps = {
            name: app.name,
            appName: app.name,
            domElement: container,
            domElementGetter: () => container,
            ...app.customProps
          };
          await app.appInstance.unmount(mfeProps);
        }
      }
      
      app.status = 'LOADED';
      app.mountedAt = null;
      app.lastContainer = null;
      
      // Clear container if it still exists
      const container = this.getDOMElement(app.customProps.domElement);
      if (container) {
        container.innerHTML = '<div style="text-align: center; color: #666; padding: 10px;">Microfrontend Unloaded</div>';
      }
      
      console.log('✅ [DEBUG] App unmounted successfully:', app.name);
    } catch (error) {
      console.error('❌ [DEBUG] Error unmounting app:', app.name, error);
      // Reset state anyway
      app.status = 'LOADED';
      app.mountedAt = null;
      app.lastContainer = null;
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
    // Use setTimeout to ensure DOM is ready
    setTimeout(() => {
      this.evaluateApps();
    }, 100);
    console.log('✅ [DEBUG] Mini Single-SPA started successfully!');
  }

  // FIXED: Method to handle navigation start
  handleNavigationStart() {
    console.log('🔄 Navigation starting, setting navigation flag');
    this.isNavigating = true;
  }

  // FIXED: Method to handle navigation complete  
  async handleNavigationComplete() {
    console.log('🔄 Navigation complete, clearing flag and re-evaluating');
    this.isNavigating = false;
    
    // Wait a bit for DOM to be fully ready
    setTimeout(() => {
      this.evaluateApps();
    }, 150);
  }

  getAppNames() {
    return this.apps.map(app => app.name);
  }
}

// Create global instance
const miniSPA = new MiniSingleSPA();

// Initialize Single-SPA with the same MFE registration but enhanced error handling
function initSingleSPA() {
  console.log('🔵 [DEBUG] Initializing Single-SPA system...');

  // Register the Header MFE (always active)
  miniSPA.registerApplication({
    name: 'header-mfe',
    loadApp: async () => {
      console.log('🔵 [DEBUG] Starting Header MFE load process...');
      
      try {
        // Wait for container to be available with longer timeout
        const containerSelector = 'header-mfe-container';
        let container = null;
        let attempts = 0;
        const maxAttempts = 100; // 10 seconds total
        
        while (!container && attempts < maxAttempts) {
          container = document.getElementById(containerSelector);
          if (!container) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
          }
        }
        
        if (!container) {
          throw new Error(`Container #${containerSelector} not found after ${maxAttempts * 100}ms`);
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
        
        // Remove any existing script to force reload
        const scriptId = 'header-mfe-script';
        const existingScript = document.getElementById(scriptId);
        if (existingScript) {
          existingScript.remove();
        }
        
        // Load fresh script with timestamp
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.id = scriptId;
          script.src = testUrl + '?t=' + Date.now();
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
        
        // Wait for global to be available
        let globalAttempts = 0;
        while (!window.headerMfe && globalAttempts < 20) {
          await new Promise(resolve => setTimeout(resolve, 100));
          globalAttempts++;
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

  // Register TaskList MFE with same enhancements
  miniSPA.registerApplication({
    name: 'tasklist-mfe',
    loadApp: async () => {
      console.log('🔵 [DEBUG] Starting TaskList MFE load process...');
      
      try {
        const containerSelector = 'tasklist-mfe-container';
        let container = null;
        let attempts = 0;
        
        while (!container && attempts < 100) {
          container = document.getElementById(containerSelector);
          if (!container) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
          }
        }
        
        if (!container) {
          throw new Error(`Container #${containerSelector} not found`);
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
        
        let attempts2 = 0;
        while (!window.tasklistMfe && attempts2 < 20) {
          await new Promise(resolve => setTimeout(resolve, 100));
          attempts2++;
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

  // Register Login MFE with same enhancements
  miniSPA.registerApplication({
    name: 'login-mfe',
    loadApp: async () => {
      console.log('🔵 [DEBUG] Starting Login MFE load process...');
      
      try {
        const containerSelector = 'login-mfe-container';
        let container = null;
        let attempts = 0;
        
        while (!container && attempts < 100) {
          container = document.getElementById(containerSelector);
          if (!container) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
          }
        }
        
        if (!container) {
          throw new Error(`Container #${containerSelector} not found`);
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
        
        let attempts2 = 0;
        while (!window.loginMfe && attempts2 < 20) {
          await new Promise(resolve => setTimeout(resolve, 100));
          attempts2++;
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

// FIXED: Enhanced Turbo navigation handling
function handleTurboNavigation() {
  console.log('🟡 [DEBUG] Turbo navigation detected');
  console.log('🟡 [DEBUG] Current path:', window.location.pathname);
  
  // Re-evaluate apps for new route
  if (window.miniSPA && window.miniSPA.started) {
    console.log('🔵 [DEBUG] Re-evaluating apps for route:', window.location.pathname);
    
    // Mark navigation as complete and re-evaluate
    window.miniSPA.handleNavigationComplete();
  } else {
    console.log('🔵 [DEBUG] Mini Single-SPA not ready, initializing...');
    setTimeout(() => {
      initSingleSPA();
    }, 200);
  }
}

// FIXED: Handle Turbo navigation start
document.addEventListener('turbo:before-cache', function() {
  console.log('🔄 [DEBUG] Turbo before cache - page about to change');
  if (window.miniSPA) {
    window.miniSPA.handleNavigationStart();
  }
});

// FIXED: Handle Turbo form submissions (logout, etc.)
document.addEventListener('turbo:before-visit', function(event) {
  console.log('🔄 [DEBUG] Turbo before visit:', event.detail.url);
  if (window.miniSPA) {
    window.miniSPA.handleNavigationStart();
  }
});

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', function() {
  console.log('🟢 [DEBUG] DOM loaded, initializing Single-SPA...');
  setTimeout(() => {
    initSingleSPA();
  }, 100);
});

// Handle Turbo navigation properly
document.addEventListener('turbo:load', handleTurboNavigation);

// Handle browser back/forward buttons
window.addEventListener('popstate', function() {
  console.log('🔵 [DEBUG] Popstate detected, re-evaluating apps');
  if (window.miniSPA && window.miniSPA.started) {
    setTimeout(() => {
      window.miniSPA.evaluateApps();
    }, 100);
  }
});
