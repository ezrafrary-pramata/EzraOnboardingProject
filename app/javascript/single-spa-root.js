// app/javascript/single-spa-root.js
console.log('=== SINGLE-SPA ROOT LOADING ===');

import { registerApplication, start } from 'single-spa';

console.log('Single-SPA imported successfully:', { registerApplication, start });

// Register the task microfrontend
registerApplication({
  name: 'task-mfe',
  app: () => import('microfrontends/task-mfe'),
  activeWhen: ['/tasks', '/'],
  customProps: {
    domElement: 'task-mfe-container'
  }
});

// Start Single-SPA
start({
  urlRerouteOnly: true,
});

console.log('Single-SPA Started Successfully!');