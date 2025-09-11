// Configure your import map in config/importmap.rb. Read more: https://github.com/rails/importmap-rails
import "@hotwired/turbo-rails"
import "controllers"

console.log('🟢 Application.js loaded');

// Custom MFE Management with Turbo-safe approach
class MiniSingleSPA {
  constructor() {
    this.apps = [];
    this.started = false;
    this.currentPath = '';
    this.isNavigating = false;
    this.mountedApps = new Map();
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
      containerElement: null
    });

    if (this.started && !this.isNavigating) {
      this.evaluateApps();
    }
  }

  // Get or create DOM element - safer approach without permanent elements
  getDOMElement(elementSelector) {
    if (!elementSelector) {
      console.error('🔴 No element selector provided');
      return null;
    }

    let element = null;
    let selector = '';

    if (typeof elementSelector === 'string') {
      selector = elementSelector.startsWith('#') ? elementSelector : `#${elementSelector}`;
    } else if (elementSelector instanceof HTMLElement) {
      if (document.contains(elementSelector)) {
        return elementSelector;
      } else {
        selector = elementSelector.id ? `#${elementSelector.id}` : '#unknown-element';
      }
    }

    // Try to find existing element
    element = document.querySelector(selector);
    
    // If not found, create it (but don't make it permanent)
    if (!element) {
      const id = selector.replace('#', '');
      console.log(`🔵 Creating element: ${id}`);
      
      element = document.createElement('div');
      element.id = id;
      element.style.minHeight = '20px';
      
      // Insert in appropriate location
      if (id.includes('header')) {
        document.body.insertBefore(element, document.body.firstChild);
      } else {
        const main = document.querySelector('main') || document.body;
        main.appendChild(element);
      }
      
      console.log('🔵 Created element:', element);
    }

    return element;
  }

  async evaluateApps() {
    if (this.isNavigating) {
      console.log('🔵 Navigation in progress, skipping evaluation');
      return;
    }

    const currentPath = window.location.pathname;
    console.log('🔵 Evaluating apps for path:', currentPath);
    
    this.currentPath = currentPath;
    
    for (const app of this.apps) {
      const shouldBeActive = this.shouldAppBeActive(app);
      
      console.log(`🔵 App ${app.name}: shouldBeActive=${shouldBeActive}, status=${app.status}`);
      
      if (shouldBeActive && app.status !== 'MOUNTED') {
        await this.loadAndMountApp(app);
      } else if (!shouldBeActive && app.status === 'MOUNTED') {
        await this.unmountApp(app);
      }
    }
  }

  async loadAndMountApp(app) {
    try {
      console.log('🔵 Loading and mounting app:', app.name);
      
      // Always get fresh container
      const container = this.getDOMElement(app.customProps.domElement);
      if (!container) {
        console.warn(`⚠️ Could not create container for ${app.name}`);
        return;
      }
      
      // Store container reference
      app.containerElement = container;
      
      // Clear container
      container.innerHTML = '<div style="text-align: center; color: #666; padding: 20px;">Loading Microfrontend...</div>';
      
      app.status = 'LOADING';

      // Load the module if not already loaded
      if (!app.appInstance) {
        console.log('🔵 Loading app module for:', app.name);
        const appModule = await app.loadApp();
        console.log('🔵 App module loaded:', app.name);
        app.appInstance = appModule;
      }
      
      app.status = 'LOADED';

      // Create props with fresh container
      const mfeProps = {
        name: app.name,
        appName: app.name,
        domElement: container,
        domElementGetter: () => {
          // Always return the stored container or find fresh one
          if (app.containerElement && document.contains(app.containerElement)) {
            return app.containerElement;
          }
          const fresh = this.getDOMElement(app.customProps.domElement);
          app.containerElement = fresh;
          return fresh;
        },
        ...app.customProps
      };

      console.log('🔵 MFE props created for:', app.name);

      // Bootstrap if needed
      if (app.appInstance.bootstrap) {
        console.log('🔵 Bootstrapping app:', app.name);
        await app.appInstance.bootstrap(mfeProps);
      }

      // Mount the app
      if (app.appInstance.mount) {
        console.log('🔵 Mounting app:', app.name);
        await app.appInstance.mount(mfeProps);
        app.status = 'MOUNTED';
        app.mountedAt = this.currentPath;
        this.mountedApps.set(app.name, app);
        console.log('✅ App mounted successfully:', app.name);
      }
      
    } catch (error) {
      console.error('❌ Error loading/mounting app:', app.name, error);
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
      console.log('🔵 Unmounting app:', app.name);
      
      if (app.appInstance && app.appInstance.unmount && app.containerElement) {
        const mfeProps = {
          name: app.name,
          appName: app.name,
          domElement: app.containerElement,
          domElementGetter: () => app.containerElement,
          ...app.customProps
        };
        await app.appInstance.unmount(mfeProps);
      }
      
      app.status = 'LOADED';
      app.mountedAt = null;
      this.mountedApps.delete(app.name);
      
      // Clear container
      if (app.containerElement && document.contains(app.containerElement)) {
        app.containerElement.innerHTML = '<div style="text-align: center; color: #666; padding: 10px;">Microfrontend Unloaded</div>';
      }
      
      console.log('✅ App unmounted successfully:', app.name);
    } catch (error) {
      console.error('❌ Error unmounting app:', app.name, error);
      // Reset state anyway
      app.status = 'LOADED';
      app.mountedAt = null;
      this.mountedApps.delete(app.name);
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
    console.log('🔵 Starting Mini Single-SPA');
    this.started = true;
    setTimeout(() => {
      this.evaluateApps();
    }, 100);
    console.log('✅ Mini Single-SPA started successfully!');
  }

  // Handle navigation start - unmount all apps to prevent Turbo conflicts
  handleNavigationStart() {
    console.log('🔄 Navigation starting - unmounting all apps');
    this.isNavigating = true;
    
    // Unmount all mounted apps
    for (const app of this.mountedApps.values()) {
      this.unmountApp(app);
    }
  }

  // Handle navigation complete
  async handleNavigationComplete() {
    console.log('🔄 Navigation complete - re-evaluating apps');
    this.isNavigating = false;
    
    // Clear any stale container references
    for (const app of this.apps) {
      app.containerElement = null;
    }
    
    // Wait for DOM to be ready and re-evaluate
    setTimeout(() => {
      this.evaluateApps();
    }, 250);
  }

  getAppNames() {
    return this.apps.map(app => app.name);
  }
}

// Create global instance
const miniSPA = new MiniSingleSPA();

// Initialize Single-SPA system
function initSingleSPA() {
  console.log('🔵 Initializing Single-SPA system...');

  // Register the Header MFE (always active)
  miniSPA.registerApplication({
    name: 'header-mfe',
    loadApp: async () => {
      console.log('🔵 Loading Header MFE...');
      
      try {
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
        
        // Load MFE script
        const testUrl = 'http://localhost:8082/header-mfe.js';
        const testResponse = await fetch(testUrl, { method: 'HEAD' });
        if (!testResponse.ok) {
          throw new Error(`Header MFE server not accessible: ${testResponse.status}`);
        }
        
        // Remove existing script
        const existingScript = document.getElementById('header-mfe-script');
        if (existingScript) {
          existingScript.remove();
        }
        
        // Load fresh script
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.id = 'header-mfe-script';
          script.src = testUrl + '?t=' + Date.now();
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
        
        // Wait for global
        let attempts = 0;
        while (!window.headerMfe && attempts < 20) {
          await new Promise(resolve => setTimeout(resolve, 100));
          attempts++;
        }
        
        if (!window.headerMfe) {
          throw new Error('Header MFE global not found');
        }
        
        console.log('✅ Header MFE loaded successfully');
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
      try {
        const testUrl = 'http://localhost:8081/tasklist-mfe.js';
        const testResponse = await fetch(testUrl, { method: 'HEAD' });
        if (!testResponse.ok) {
          throw new Error(`TaskList MFE server not accessible: ${testResponse.status}`);
        }
        
        const existingScript = document.getElementById('tasklist-mfe-script');
        if (existingScript) {
          existingScript.remove();
        }
        
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.id = 'tasklist-mfe-script';
          script.src = testUrl + '?t=' + Date.now();
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
        
        let attempts = 0;
        while (!window.tasklistMfe && attempts < 20) {
          await new Promise(resolve => setTimeout(resolve, 100));
          attempts++;
        }
        
        if (!window.tasklistMfe) {
          throw new Error('TaskList MFE global not found');
        }
        
        console.log('✅ TaskList MFE loaded successfully');
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
      try {
        const testUrl = 'http://localhost:8083/login-mfe.js';
        const testResponse = await fetch(testUrl, { method: 'HEAD' });
        if (!testResponse.ok) {
          throw new Error(`Login MFE server not accessible: ${testResponse.status}`);
        }
        
        const existingScript = document.getElementById('login-mfe-script');
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
        while (!window.loginMfe && attempts < 20) {
          await new Promise(resolve => setTimeout(resolve, 100));
          attempts++;
        }
        
        if (!window.loginMfe) {
          throw new Error('Login MFE global not found');
        }
        
        console.log('✅ Login MFE loaded successfully');
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
  window.miniSPA = miniSPA;
  console.log('✅ Single-SPA system fully initialized!');
}

// Turbo navigation handling - CRITICAL FIX
function handleTurboNavigation() {
  console.log('🟡 Turbo navigation detected');
  
  if (window.miniSPA && window.miniSPA.started) {
    console.log('🔵 Re-evaluating apps for route:', window.location.pathname);
    window.miniSPA.handleNavigationComplete();
  } else {
    console.log('🔵 Mini Single-SPA not ready, initializing...');
    setTimeout(() => {
      initSingleSPA();
    }, 200);
  }
}

// CRITICAL: Handle Turbo navigation events properly
document.addEventListener('turbo:before-cache', function(event) {
  console.log('🔄 Turbo before cache - unmounting apps to prevent conflicts');
  if (window.miniSPA) {
    window.miniSPA.handleNavigationStart();
  }
});

document.addEventListener('turbo:before-visit', function(event) {
  console.log('🔄 Turbo before visit:', event.detail?.url);
  if (window.miniSPA) {
    window.miniSPA.handleNavigationStart();
  }
});

// Handle successful navigation
document.addEventListener('turbo:load', handleTurboNavigation);

// Handle navigation errors
document.addEventListener('turbo:visit', function(event) {
  console.log('🔄 Turbo visit event');
});

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', function() {
  console.log('🟢 DOM loaded, initializing Single-SPA...');
  setTimeout(() => {
    initSingleSPA();
  }, 100);
});

// Handle browser back/forward
window.addEventListener('popstate', function() {
  console.log('🔵 Popstate detected');
  if (window.miniSPA && window.miniSPA.started) {
    setTimeout(() => {
      window.miniSPA.evaluateApps();
    }, 100);
  }
});

// Global error handler for debugging
window.addEventListener('error', function(event) {
  if (event.message && event.message.includes('replaceWith')) {
    console.error('🔴 Turbo replaceWith error detected:', event);
    // Force a page reload as fallback
    setTimeout(() => {
      console.log('🔄 Reloading page due to Turbo error...');
      window.location.reload();
    }, 10);
  }
});
