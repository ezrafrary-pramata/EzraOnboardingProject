// Configure your import map in config/importmap.rb. Read more: https://github.com/rails/importmap-rails
import "@hotwired/turbo-rails"
import "controllers"

console.log('🟢 Application.js loaded');

// Self-contained Single-SPA implementation (no external dependencies)
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
      console.log('🔵 [DEBUG] Loading app:', app.name);
      console.log('🔵 [DEBUG] Current path:', window.location.pathname);
      console.log('🔵 [DEBUG] Should be active:', this.shouldAppBeActive(app));
      
      // Check if container exists before proceeding
      const container = document.getElementById(app.customProps.domElement);
      if (!container) {
        console.warn(`⚠️ Container #${app.customProps.domElement} not found for ${app.name}, skipping`);
        return;
      }
      
      app.status = 'LOADING';

      // Only load the module if we haven't loaded it yet
      if (!app.appInstance) {
        console.log('🔵 [DEBUG] Calling loadApp function for:', app.name);
        const appModule = await app.loadApp();
        console.log('🔵 [DEBUG] App module loaded:', app.name, appModule);
        app.appInstance = appModule;
      }
      
      app.status = 'LOADED';

      if (this.shouldAppBeActive(app)) {
        console.log('🔵 [DEBUG] Mounting app:', app.name);
        app.status = 'MOUNTING';

        if (app.appInstance.bootstrap) {
          console.log('🔵 [DEBUG] Bootstrapping app:', app.name);
          await app.appInstance.bootstrap(app.customProps);
        }

        if (app.appInstance.mount) {
          console.log('🔵 [DEBUG] Mounting app:', app.name);
          await app.appInstance.mount(app.customProps);
        }

        app.status = 'MOUNTED';
        console.log('✅ [DEBUG] App mounted successfully:', app.name);
      } else {
        console.log('🟡 [DEBUG] App should not be active:', app.name);
      }
    } catch (error) {
      console.error('❌ [DEBUG] Error loading/mounting app:', app.name, error);
      console.error('❌ [DEBUG] Error stack:', error.stack);
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
    console.log('🔵 [DEBUG] Checking if app should be active:', {
      app: app.name,
      currentPath,
      activeWhen: app.activeWhen
    });

    if (Array.isArray(app.activeWhen)) {
      const result = app.activeWhen.some(path => {
        const matches = currentPath.startsWith(path) || currentPath === path;
        console.log('🔵 [DEBUG] Path check:', { path, currentPath, matches });
        return matches;
      });
      console.log('🔵 [DEBUG] Array result:', result);
      return result;
    }

    if (typeof app.activeWhen === 'string') {
      const result = currentPath.startsWith(app.activeWhen) || currentPath === app.activeWhen;
      console.log('🔵 [DEBUG] String result:', result);
      return result;
    }

    if (typeof app.activeWhen === 'function') {
      const result = app.activeWhen(window.location);
      console.log('🔵 [DEBUG] Function result:', result);
      return result;
    }

    console.log('🔵 [DEBUG] Default result: false');
    return false;
  }

  start() {
    console.log('🔵 [DEBUG] Starting Mini Single-SPA');
    console.log('🔵 [DEBUG] Registered apps:', this.apps.map(app => ({ name: app.name, status: app.status })));
    this.started = true;

    this.apps.forEach(app => {
      console.log('🔵 [DEBUG] Processing app:', app.name, 'Status:', app.status);
      if (app.status === 'NOT_LOADED') {
        this.loadAndMountApp(app);
      }
    });

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
      console.log('🔵 [DEBUG] Current window globals:', {
        React: typeof window.React,
        ReactDOM: typeof window.ReactDOM,
        location: window.location.href
      });
      
      try {
        // Step 1: Check container exists
        const container = document.getElementById('header-mfe-container');
        console.log('🔵 [DEBUG] Container check:', {
          exists: !!container,
          id: container?.id,
          innerHTML: container?.innerHTML?.substring(0, 100)
        });
        
        if (!container) {
          throw new Error('header-mfe-container not found in DOM');
        }
        
        // Step 2: Load React dependencies
        console.log('🔵 [DEBUG] Checking React dependencies...');
        
        if (typeof window.React === 'undefined') {
          console.log('🔵 [DEBUG] Loading React...');
          await new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://unpkg.com/react@18/umd/react.development.js';
            script.onload = () => {
              console.log('🔵 [DEBUG] React loaded, type:', typeof window.React);
              resolve();
            };
            script.onerror = (error) => {
              console.error('❌ [DEBUG] React load failed:', error);
              reject(error);
            };
            document.head.appendChild(script);
          });
        }
        
        if (typeof window.ReactDOM === 'undefined') {
          console.log('🔵 [DEBUG] Loading ReactDOM...');
          await new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://unpkg.com/react-dom@18/umd/react-dom.development.js';
            script.onload = () => {
              console.log('🔵 [DEBUG] ReactDOM loaded, type:', typeof window.ReactDOM);
              resolve();
            };
            script.onerror = (error) => {
              console.error('❌ [DEBUG] ReactDOM load failed:', error);
              reject(error);
            };
            document.head.appendChild(script);
          });
        }
        
        console.log('🔵 [DEBUG] React dependencies ready:', {
          React: typeof window.React,
          ReactDOM: typeof window.ReactDOM
        });
        
        // Step 3: Test MFE URL accessibility
        console.log('🔵 [DEBUG] Testing Header MFE URL accessibility...');
        const testUrl = 'http://localhost:8082/header-mfe.js';
        
        try {
          const testResponse = await fetch(testUrl, { method: 'HEAD' });
          console.log('🔵 [DEBUG] Header MFE URL test:', {
            url: testUrl,
            status: testResponse.status,
            ok: testResponse.ok
          });
        } catch (fetchError) {
          console.error('❌ [DEBUG] Header MFE URL not accessible:', {
            url: testUrl,
            error: fetchError.message
          });
          throw new Error(`Header MFE server not running or not accessible: ${fetchError.message}`);
        }
        
        // Step 4: Load the MFE script
        console.log('🔵 [DEBUG] Loading Header MFE script...');
        const scriptId = 'header-mfe-script';
        
        // Remove existing script
        const existingScript = document.getElementById(scriptId);
        if (existingScript) {
          console.log('🔵 [DEBUG] Removing existing Header MFE script');
          existingScript.remove();
        }
        
        // Load new script
        const loadResult = await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.id = scriptId;
          script.src = testUrl;
          
          script.onload = () => {
            console.log('🔵 [DEBUG] Header MFE script loaded successfully');
            console.log('🔵 [DEBUG] Post-load window check:', {
              headerMfe: typeof window.headerMfe,
              headerMfeKeys: window.headerMfe ? Object.keys(window.headerMfe) : 'N/A'
            });
            
            // Wait for global to be available
            let attempts = 0;
            const maxAttempts = 10;
            
            const checkGlobal = () => {
              attempts++;
              console.log(`🔵 [DEBUG] Global check attempt ${attempts}/${maxAttempts}`);
              
              if (window.headerMfe && 
                  typeof window.headerMfe.bootstrap === 'function' &&
                  typeof window.headerMfe.mount === 'function' &&
                  typeof window.headerMfe.unmount === 'function') {
                
                console.log('✅ [DEBUG] Header MFE global found with all required methods:', {
                  bootstrap: typeof window.headerMfe.bootstrap,
                  mount: typeof window.headerMfe.mount,
                  unmount: typeof window.headerMfe.unmount
                });
                
                resolve({
                  bootstrap: window.headerMfe.bootstrap,
                  mount: window.headerMfe.mount,
                  unmount: window.headerMfe.unmount
                });
              } else if (attempts >= maxAttempts) {
                console.error('❌ [DEBUG] Header MFE global not found after max attempts:', {
                  attempts: maxAttempts,
                  windowHeaderMfe: window.headerMfe,
                  type: typeof window.headerMfe
                });
                reject(new Error('Header MFE global not found after multiple attempts'));
              } else {
                setTimeout(checkGlobal, 100);
              }
            };
            
            checkGlobal();
          };
          
          script.onerror = (error) => {
            console.error('❌ [DEBUG] Header MFE script load failed:', {
              error: error,
              src: script.src
            });
            reject(new Error('Failed to load Header MFE script'));
          };
          
          console.log('🔵 [DEBUG] Appending Header MFE script to head');
          document.head.appendChild(script);
        });
        
        console.log('✅ [DEBUG] Header MFE load process completed successfully');
        return loadResult;
        
      } catch (error) {
        console.error('❌ [DEBUG] Header MFE load process failed:', {
          error: error.message,
          stack: error.stack
        });
        throw error;
      }
    },
    activeWhen: () => true, // Header is always active
    customProps: {
      domElement: 'header-mfe-container'
    }
  });

  // Register the TaskList MFE (only active on /tasks)
  miniSPA.registerApplication({
    name: 'tasklist-mfe',
    loadApp: async () => {
      console.log('🔵 [DEBUG] Starting TaskList MFE load process...');
      console.log('🔵 [DEBUG] Current window globals:', {
        React: typeof window.React,
        ReactDOM: typeof window.ReactDOM,
        location: window.location.href
      });
      
      try {
        // Step 1: Check container exists
        const container = document.getElementById('tasklist-mfe-container');
        console.log('🔵 [DEBUG] Container check:', {
          exists: !!container,
          id: container?.id,
          innerHTML: container?.innerHTML?.substring(0, 100)
        });
        
        if (!container) {
          throw new Error('tasklist-mfe-container not found in DOM');
        }
        
        // Step 2: Load React dependencies (reuse from header)
        console.log('🔵 [DEBUG] React dependencies already loaded:', {
          React: typeof window.React,
          ReactDOM: typeof window.ReactDOM
        });
        
        // Step 3: Test MFE URL accessibility
        console.log('🔵 [DEBUG] Testing TaskList MFE URL accessibility...');
        const testUrl = 'http://localhost:8081/tasklist-mfe.js';
        
        try {
          const testResponse = await fetch(testUrl, { method: 'HEAD' });
          console.log('🔵 [DEBUG] TaskList MFE URL test:', {
            url: testUrl,
            status: testResponse.status,
            ok: testResponse.ok
          });
        } catch (fetchError) {
          console.error('❌ [DEBUG] TaskList MFE URL not accessible:', {
            url: testUrl,
            error: fetchError.message
          });
          throw new Error(`TaskList MFE server not running or not accessible: ${fetchError.message}`);
        }
        
        // Step 4: Load the MFE script
        console.log('🔵 [DEBUG] Loading TaskList MFE script...');
        const scriptId = 'tasklist-mfe-script';
        
        // Remove existing script
        const existingScript = document.getElementById(scriptId);
        if (existingScript) {
          console.log('🔵 [DEBUG] Removing existing TaskList MFE script');
          existingScript.remove();
        }
        
        // Load new script
        const loadResult = await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.id = scriptId;
          script.src = testUrl;
          
          script.onload = () => {
            console.log('🔵 [DEBUG] TaskList MFE script loaded successfully');
            console.log('🔵 [DEBUG] Post-load window check:', {
              tasklistMfe: typeof window.tasklistMfe,
              tasklistMfeKeys: window.tasklistMfe ? Object.keys(window.tasklistMfe) : 'N/A'
            });
            
            // Wait for global to be available
            let attempts = 0;
            const maxAttempts = 10;
            
            const checkGlobal = () => {
              attempts++;
              console.log(`🔵 [DEBUG] Global check attempt ${attempts}/${maxAttempts}`);
              
              if (window.tasklistMfe && 
                  typeof window.tasklistMfe.bootstrap === 'function' &&
                  typeof window.tasklistMfe.mount === 'function' &&
                  typeof window.tasklistMfe.unmount === 'function') {
                
                console.log('✅ [DEBUG] TaskList MFE global found with all required methods:', {
                  bootstrap: typeof window.tasklistMfe.bootstrap,
                  mount: typeof window.tasklistMfe.mount,
                  unmount: typeof window.tasklistMfe.unmount
                });
                
                resolve({
                  bootstrap: window.tasklistMfe.bootstrap,
                  mount: window.tasklistMfe.mount,
                  unmount: window.tasklistMfe.unmount
                });
              } else if (attempts >= maxAttempts) {
                console.error('❌ [DEBUG] TaskList MFE global not found after max attempts:', {
                  attempts: maxAttempts,
                  windowTasklistMfe: window.tasklistMfe,
                  type: typeof window.tasklistMfe
                });
                reject(new Error('TaskList MFE global not found after multiple attempts'));
              } else {
                setTimeout(checkGlobal, 100);
              }
            };
            
            checkGlobal();
          };
          
          script.onerror = (error) => {
            console.error('❌ [DEBUG] TaskList MFE script load failed:', {
              error: error,
              src: script.src
            });
            reject(new Error('Failed to load TaskList MFE script'));
          };
          
          console.log('🔵 [DEBUG] Appending TaskList MFE script to head');
          document.head.appendChild(script);
        });
        
        console.log('✅ [DEBUG] TaskList MFE load process completed successfully');
        return loadResult;
        
      } catch (error) {
        console.error('❌ [DEBUG] TaskList MFE load process failed:', {
          error: error.message,
          stack: error.stack
        });
        throw error;
      }
    },
    activeWhen: ['/tasks'],
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

  console.log('✅ [DEBUG] Single-SPA system fully initialized!');
}

document.addEventListener('DOMContentLoaded', function() {
  console.log('🟢 [DEBUG] DOM loaded, initializing Single-SPA...');
  initSingleSPA();
});

// Handle Turbo navigation
document.addEventListener('turbo:load', function() {
  console.log('🟡 [DEBUG] Turbo navigation detected');
  console.log('🟡 [DEBUG] Current path:', window.location.pathname);
  
  // Re-evaluate apps for new route
  if (window.miniSPA && window.miniSPA.started) {
    console.log('🔵 [DEBUG] Re-evaluating apps for route:', window.location.pathname);
    
    // Process each app for the new route
    const processApps = async () => {
      for (const app of window.miniSPA.apps) {
        const shouldBeActive = window.miniSPA.shouldAppBeActive(app);
        console.log(`🔵 [DEBUG] App ${app.name}: shouldBeActive=${shouldBeActive}, currentStatus=${app.status}`);
        
        if (shouldBeActive && (app.status === 'LOADED' || app.status === 'NOT_LOADED')) {
          console.log(`🔵 [DEBUG] Loading/mounting ${app.name} because it should be active`);
          await window.miniSPA.loadAndMountApp(app);
        }
      }
    };
    
    processApps();
  } else {
    console.log('🔵 [DEBUG] Mini Single-SPA not ready, initializing...');
    initSingleSPA();
  }
});
