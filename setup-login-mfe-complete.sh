#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
MFE_NAME="login-mfe"
MFE_PORT="8083"
MFE_DISPLAY_NAME="Login"

echo -e "${BLUE}🚀 Setting up ${MFE_DISPLAY_NAME} Microfrontend with Full Rails Integration...${NC}"
echo -e "${YELLOW}📂 MFE Directory: ${MFE_NAME}${NC}"
echo -e "${YELLOW}🌐 MFE Port: ${MFE_PORT}${NC}"
echo -e "${YELLOW}🔧 Auto-integrating with Rails app${NC}"
echo ""

# Function to backup files
backup_file() {
    local file=$1
    if [ -f "$file" ]; then
        cp "$file" "$file.backup.$(date +%Y%m%d_%H%M%S)"
        echo -e "${CYAN}💾 Backed up $file${NC}"
    fi
}

# Function to check if we're in a Rails app directory
check_rails_app() {
    if [ ! -f "Gemfile" ] || [ ! -f "config/application.rb" ]; then
        echo -e "${RED}❌ This doesn't appear to be a Rails application directory${NC}"
        echo -e "${YELLOW}Please run this script from your Rails app root directory${NC}"
        exit 1
    fi
    echo -e "${GREEN}✅ Rails application detected${NC}"
}

# Check if we're in the right directory
check_rails_app

# Check if directory already exists
if [ -d "$MFE_NAME" ]; then
    echo -e "${RED}❌ Directory ${MFE_NAME} already exists!${NC}"
    read -p "Do you want to remove it and start fresh? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        rm -rf "$MFE_NAME"
        echo -e "${GREEN}✅ Removed existing directory${NC}"
    else
        echo -e "${YELLOW}⚠️  Aborted${NC}"
        exit 1
    fi
fi

# ============================================================================
# PART 1: CREATE THE LOGIN MFE
# ============================================================================

echo -e "${PURPLE}📦 PART 1: Creating Login MFE...${NC}"

# Create directory structure
echo -e "${BLUE}📁 Creating directory structure...${NC}"
mkdir -p "$MFE_NAME"/{src,public}

# Create package.json
echo -e "${BLUE}📦 Creating package.json...${NC}"
cat > "$MFE_NAME/package.json" << EOF
{
  "name": "${MFE_NAME}",
  "version": "1.0.0",
  "description": "${MFE_DISPLAY_NAME} Microfrontend",
  "main": "src/index.js",
  "scripts": {
    "start": "webpack serve --config webpack.config.js",
    "build": "webpack --config webpack.config.js --mode production",
    "dev": "webpack serve --config webpack.config.js --mode development"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "single-spa-react": "^6.0.0"
  },
  "devDependencies": {
    "@babel/core": "^7.23.0",
    "@babel/preset-env": "^7.23.0",
    "@babel/preset-react": "^7.22.0",
    "babel-loader": "^9.1.0",
    "css-loader": "^6.8.0",
    "html-webpack-plugin": "^5.5.0",
    "style-loader": "^3.3.0",
    "webpack": "^5.89.0",
    "webpack-cli": "^5.1.0",
    "webpack-dev-server": "^4.15.0"
  }
}
EOF

# Create .babelrc
echo -e "${BLUE}⚙️  Creating .babelrc...${NC}"
cat > "$MFE_NAME/.babelrc" << EOF
{
  "presets": ["@babel/preset-env", "@babel/preset-react"]
}
EOF

# Create webpack.config.js
echo -e "${BLUE}⚙️  Creating webpack.config.js...${NC}"
cat > "$MFE_NAME/webpack.config.js" << 'EOF'
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';
  
  return {
    entry: './src/index.js',
    mode: argv.mode || 'development',
    devtool: 'source-map',
    devServer: {
      port: 8083,
      hot: true,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
        'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization'
      },
      static: {
        directory: path.join(__dirname, 'public'),
      }
    },
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'login-mfe.js',
      library: {
        name: 'loginMfe',
        type: 'umd',
        export: 'default'
      },
      globalObject: 'this',
      publicPath: isProduction ? '/login-mfe/' : 'http://localhost:8083/'
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env', '@babel/preset-react']
            }
          }
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader']
        }
      ]
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: './public/index.html',
        inject: false
      })
    ],
    externals: {
      'react': {
        commonjs: 'react',
        commonjs2: 'react',
        amd: 'react',
        root: 'React'
      },
      'react-dom': {
        commonjs: 'react-dom',
        commonjs2: 'react-dom',
        amd: 'react-dom',
        root: 'ReactDOM'
      }
    }
  };
};
EOF

# Create public/index.html
echo -e "${BLUE}🌐 Creating public/index.html...${NC}"
cat > "$MFE_NAME/public/index.html" << EOF
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${MFE_DISPLAY_NAME} MFE - Standalone</title>
    <style>
        body {
            margin: 0;
            padding: 20px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
            background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
            min-height: 100vh;
        }
        h1 {
            text-align: center;
            color: white;
            margin-bottom: 30px;
        }
        .banner {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            color: white;
            padding: 15px;
            border-radius: 10px;
            margin-bottom: 20px;
            text-align: center;
        }
        .debug {
            background: rgba(0, 0, 0, 0.1);
            color: white;
            padding: 10px;
            border-radius: 5px;
            font-family: monospace;
            font-size: 12px;
            margin-top: 10px;
        }
    </style>
</head>
<body>
    <h1>${MFE_DISPLAY_NAME} Microfrontend - Standalone Mode</h1>
    <div class="banner">
        <strong>🚀 MFE Status:</strong> Running independently on port ${MFE_PORT}<br>
        <small>This MFE can be integrated into the main Rails app or run standalone for development</small>
        
        <div class="debug">
            <div>Global Check:</div>
            <div id="debug-info">Loading...</div>
        </div>
    </div>
    
    <!-- React and ReactDOM from CDN -->
    <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
    <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
    
    <!-- The webpack dev server will inject the bundle here -->
    <script src="/login-mfe.js"></script>
    
    <script>
        // Debug info
        function updateDebugInfo() {
            const debugEl = document.getElementById('debug-info');
            if (debugEl) {
                debugEl.innerHTML = \`
                    React: \${typeof React}<br>
                    ReactDOM: \${typeof ReactDOM}<br>
                    loginMfe: \${typeof loginMfe}<br>
                    Exported: \${typeof window.loginMfe}<br>
                    Bootstrap: \${typeof window.loginMfe?.bootstrap}
                \`;
            }
        }
        
        // Check periodically
        setInterval(updateDebugInfo, 1000);
        updateDebugInfo();
        
        console.log('🔵 Standalone Mode Globals:', {
            React: typeof React,
            ReactDOM: typeof ReactDOM,
            loginMfe: typeof loginMfe,
            windowLoginMfe: typeof window.loginMfe
        });
    </script>
</body>
</html>
EOF

# Create the Login Form component (copying from your existing component)
echo -e "${BLUE}⚛️  Creating src/LoginForm.js...${NC}"
cat > "$MFE_NAME/src/LoginForm.js" << 'EOF'
import React, { useState } from 'react';

const LoginForm = ({ 
  sessionPath = '/session',
  newPasswordPath = '/password/new', 
  newUserPath = '/users/new',
  flashAlert = null,
  flashNotice = null,
  emailValue = ''
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState(emailValue);
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Get the hidden Rails form and populate it
    const railsForm = document.getElementById('rails-login-form');
    const emailInput = document.getElementById('rails-email');
    const passwordInput = document.getElementById('rails-password');
    const submitBtn = document.getElementById('rails-submit');
    
    if (railsForm && emailInput && passwordInput && submitBtn) {
      emailInput.value = email;
      passwordInput.value = password;
      submitBtn.click();
    }
  };

  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #eff6ff 0%, #e0e7ff 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    },
    card: {
      maxWidth: '400px',
      width: '100%',
      backgroundColor: 'white',
      borderRadius: '16px',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      padding: '2rem'
    },
    header: {
      textAlign: 'center',
      marginBottom: '2rem'
    },
    iconContainer: {
      width: '48px',
      height: '48px',
      backgroundColor: '#4f46e5',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0 auto 1rem',
      color: 'white'
    },
    title: {
      fontSize: '1.875rem',
      fontWeight: 'bold',
      color: '#111827',
      margin: '0 0 0.5rem 0'
    },
    subtitle: {
      color: '#6b7280',
      fontSize: '1rem',
      margin: '0'
    },
    alert: {
      padding: '1rem',
      borderRadius: '8px',
      backgroundColor: '#fef2f2',
      border: '1px solid #fecaca',
      marginBottom: '1.5rem',
      display: 'flex',
      alignItems: 'flex-start'
    },
    alertIcon: {
      marginRight: '0.75rem',
      marginTop: '0.125rem',
      color: '#ef4444',
      flexShrink: 0
    },
    alertText: {
      color: '#991b1b',
      fontSize: '0.875rem',
      margin: '0'
    },
    notice: {
      padding: '1rem',
      borderRadius: '8px',
      backgroundColor: '#f0fdf4',
      border: '1px solid #bbf7d0',
      marginBottom: '1.5rem'
    },
    noticeText: {
      color: '#166534',
      fontSize: '0.875rem',
      margin: '0'
    },
    formGroup: {
      marginBottom: '1.5rem'
    },
    label: {
      display: 'block',
      fontSize: '0.875rem',
      fontWeight: '500',
      color: '#374151',
      marginBottom: '0.5rem'
    },
    inputContainer: {
      position: 'relative'
    },
    inputIcon: {
      position: 'absolute',
      left: '12px',
      top: '50%',
      transform: 'translateY(-50%)',
      color: '#9ca3af',
      pointerEvents: 'none'
    },
    input: {
      width: '100%',
      paddingLeft: '40px',
      paddingRight: '12px',
      paddingTop: '12px',
      paddingBottom: '12px',
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      fontSize: '1rem',
      color: '#111827',
      backgroundColor: 'white',
      transition: 'all 0.2s',
      outline: 'none',
      boxSizing: 'border-box'
    },
    passwordInput: {
      width: '100%',
      paddingLeft: '40px',
      paddingRight: '48px',
      paddingTop: '12px',
      paddingBottom: '12px',
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      fontSize: '1rem',
      color: '#111827',
      backgroundColor: 'white',
      transition: 'all 0.2s',
      outline: 'none',
      boxSizing: 'border-box'
    },
    toggleButton: {
      position: 'absolute',
      right: '12px',
      top: '50%',
      transform: 'translateY(-50%)',
      background: 'none',
      border: 'none',
      color: '#9ca3af',
      cursor: 'pointer',
      padding: '4px',
      borderRadius: '4px',
      transition: 'color 0.2s'
    },
    submitButton: {
      width: '100%',
      padding: '12px 16px',
      backgroundColor: '#4f46e5',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      fontSize: '0.875rem',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.2s',
      marginTop: '0.5rem'
    },
    linksContainer: {
      marginTop: '2rem',
      textAlign: 'center'
    },
    linkGroup: {
      marginBottom: '1rem'
    },
    link: {
      color: '#4f46e5',
      textDecoration: 'none',
      fontSize: '0.875rem',
      fontWeight: '500',
      transition: 'color 0.2s'
    },
    text: {
      color: '#6b7280',
      fontSize: '0.875rem'
    }
  };

  return React.createElement('div', {
    style: styles.container
  }, 
    React.createElement('div', {
      style: styles.card
    },
      // Header
      React.createElement('div', {
        style: styles.header
      },
        React.createElement('div', {
          style: styles.iconContainer
        },
          React.createElement('svg', {
            width: "24",
            height: "24",
            fill: "none",
            stroke: "currentColor",
            viewBox: "0 0 24 24"
          },
            React.createElement('path', {
              strokeLinecap: "round",
              strokeLinejoin: "round",
              strokeWidth: "2",
              d: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            })
          )
        ),
        React.createElement('h2', {
          style: styles.title
        }, "Welcome back"),
        React.createElement('p', {
          style: styles.subtitle
        }, "Please sign in to your account")
      ),

      // Flash Messages
      flashAlert && React.createElement('div', {
        style: styles.alert
      },
        React.createElement('svg', {
          width: "20",
          height: "20",
          fill: "none",
          stroke: "currentColor",
          viewBox: "0 0 24 24",
          style: styles.alertIcon
        },
          React.createElement('path', {
            strokeLinecap: "round",
            strokeLinejoin: "round",
            strokeWidth: "2",
            d: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
          })
        ),
        React.createElement('p', {
          style: styles.alertText
        }, flashAlert)
      ),
      
      flashNotice && React.createElement('div', {
        style: styles.notice
      },
        React.createElement('p', {
          style: styles.noticeText
        }, flashNotice)
      ),

      // Form
      React.createElement('div', null,
        // Email Field
        React.createElement('div', {
          style: styles.formGroup
        },
          React.createElement('label', {
            htmlFor: "email_address",
            style: styles.label
          }, "Email address"),
          React.createElement('div', {
            style: styles.inputContainer
          },
            React.createElement('svg', {
              width: "20",
              height: "20",
              fill: "none",
              stroke: "currentColor",
              viewBox: "0 0 24 24",
              style: styles.inputIcon
            },
              React.createElement('path', {
                strokeLinecap: "round",
                strokeLinejoin: "round",
                strokeWidth: "2",
                d: "M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
              })
            ),
            React.createElement('input', {
              id: "email_address",
              name: "email_address",
              type: "email",
              required: true,
              autoFocus: true,
              autoComplete: "username",
              placeholder: "Enter your email address",
              value: email,
              onChange: (e) => setEmail(e.target.value),
              style: styles.input,
              onFocus: (e) => e.target.style.borderColor = '#4f46e5',
              onBlur: (e) => e.target.style.borderColor = '#d1d5db'
            })
          )
        ),

        // Password Field
        React.createElement('div', {
          style: styles.formGroup
        },
          React.createElement('label', {
            htmlFor: "password",
            style: styles.label
          }, "Password"),
          React.createElement('div', {
            style: styles.inputContainer
          },
            React.createElement('svg', {
              width: "20",
              height: "20",
              fill: "none",
              stroke: "currentColor",
              viewBox: "0 0 24 24",
              style: styles.inputIcon
            },
              React.createElement('path', {
                strokeLinecap: "round",
                strokeLinejoin: "round",
                strokeWidth: "2",
                d: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              })
            ),
            React.createElement('input', {
              id: "password",
              name: "password",
              type: showPassword ? 'text' : 'password',
              required: true,
              autoComplete: "current-password",
              placeholder: "Enter your password",
              maxLength: "72",
              value: password,
              onChange: (e) => setPassword(e.target.value),
              style: styles.passwordInput,
              onFocus: (e) => e.target.style.borderColor = '#4f46e5',
              onBlur: (e) => e.target.style.borderColor = '#d1d5db'
            }),
            React.createElement('button', {
              type: "button",
              onClick: () => setShowPassword(!showPassword),
              style: styles.toggleButton,
              onMouseEnter: (e) => e.target.style.color = '#4f46e5',
              onMouseLeave: (e) => e.target.style.color = '#9ca3af'
            },
              React.createElement('svg', {
                width: "20",
                height: "20",
                fill: "none",
                stroke: "currentColor",
                viewBox: "0 0 24 24"
              },
                showPassword ? 
                  React.createElement('path', {
                    strokeLinecap: "round",
                    strokeLinejoin: "round",
                    strokeWidth: "2",
                    d: "M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                  }) :
                  [
                    React.createElement('path', {
                      key: "eye1",
                      strokeLinecap: "round",
                      strokeLinejoin: "round",
                      strokeWidth: "2",
                      d: "M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    }),
                    React.createElement('path', {
                      key: "eye2",
                      strokeLinecap: "round",
                      strokeLinejoin: "round",
                      strokeWidth: "2",
                      d: "M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    })
                  ]
              )
            )
          )
        ),

        // Submit Button
        React.createElement('button', {
          type: "submit",
          onClick: handleSubmit,
          style: styles.submitButton,
          onMouseEnter: (e) => e.target.style.backgroundColor = '#4338ca',
          onMouseLeave: (e) => e.target.style.backgroundColor = '#4f46e5'
        }, "Sign in")
      ),

      // Links
      React.createElement('div', {
        style: styles.linksContainer
      },
        React.createElement('div', {
          style: styles.linkGroup
        },
          React.createElement('a', {
            href: newPasswordPath,
            style: styles.link,
            onMouseEnter: (e) => e.target.style.color = '#4338ca',
            onMouseLeave: (e) => e.target.style.color = '#4f46e5'
          }, "Forgot password?")
        ),
        React.createElement('div', null,
          React.createElement('span', {
            style: styles.text
          }, "Don't have an account? "),
          React.createElement('a', {
            href: newUserPath,
            style: styles.link,
            onMouseEnter: (e) => e.target.style.color = '#4338ca',
            onMouseLeave: (e) => e.target.style.color = '#4f46e5'
          }, "Create new user")
        )
      )
    )
  );
};

export default LoginForm;
EOF

# Create src/index.js (the main entry point with single-spa integration)
echo -e "${BLUE}⚛️  Creating src/index.js...${NC}"
cat > "$MFE_NAME/src/index.js" << 'EOF'
import React from 'react';
import ReactDOM from 'react-dom';
import { createRoot } from 'react-dom/client';
import singleSpaReact from 'single-spa-react';
import LoginForm from './LoginForm';

console.log('🔵 [MFE-DEBUG] Login MFE Loading...');

// Use global React if available, fallback to imports
const ReactToUse = window.React || React;
const ReactDOMToUse = window.ReactDOM || ReactDOM;

const lifecycles = singleSpaReact({
  React: ReactToUse,
  ReactDOM: ReactDOMToUse,
  createRoot,
  rootComponent: LoginForm,
  errorBoundary: (err, info, props) => {
    console.error('🔴 [MFE-DEBUG] Login MFE Error Boundary:', err);
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
      React.createElement('h3', { key: 'title' }, '❌ Login MFE Error'),
      React.createElement('p', { key: 'message' }, err.message)
    ]);
  }
});

// Standalone mode
if (!window.singleSpaNavigate) {
  console.log('🔵 [MFE-DEBUG] Running in standalone mode');
  
  let container = document.getElementById('login-mfe-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'login-mfe-container';
    document.body.appendChild(container);
  }
  
  const root = createRoot(container);
  root.render(React.createElement(LoginForm, {
    sessionPath: '/session',
    newPasswordPath: '/password/new',
    newUserPath: '/users/new',
    flashAlert: null,
    flashNotice: 'Demo mode - form submission disabled',
    emailValue: 'demo@example.com'
  }));
  
  console.log('🔵 [MFE-DEBUG] Standalone mode mounted successfully');
}

// Export for single-spa
export const { bootstrap, mount, unmount } = lifecycles;

// CRITICAL: Expose globally
const globalExport = {
  bootstrap: lifecycles.bootstrap,
  mount: lifecycles.mount,
  unmount: lifecycles.unmount
};

window.loginMfe = globalExport;

console.log('✅ [MFE-DEBUG] Login MFE initialization complete');

// Also export as default
export default globalExport;
EOF

# Create start.sh script
echo -e "${BLUE}📜 Creating start.sh script...${NC}"
cat > "$MFE_NAME/start.sh" << EOF
#!/bin/bash
echo "🚀 Starting ${MFE_DISPLAY_NAME} MFE on port ${MFE_PORT}..."
echo "📍 Standalone mode: http://localhost:${MFE_PORT}"
echo "📍 MFE bundle: http://localhost:${MFE_PORT}/${MFE_NAME}.js"
echo ""
echo "Press Ctrl+C to stop"
npm start
EOF

chmod +x "$MFE_NAME/start.sh"

# Create .gitignore
echo -e "${BLUE}📝 Creating .gitignore...${NC}"
cat > "$MFE_NAME/.gitignore" << EOF
node_modules/
dist/
build/
.env*
.DS_Store
*.log
EOF

echo -e "${GREEN}✅ Login MFE created successfully!${NC}"

# ============================================================================
# PART 2: INTEGRATE WITH RAILS APP
# ============================================================================

echo ""
echo -e "${PURPLE}🔧 PART 2: Integrating with Rails application...${NC}"

# Backup important files before modifying
echo -e "${BLUE}💾 Creating backups...${NC}"
backup_file "app/javascript/application.js"
backup_file "app/views/sessions/new.html.erb"

# ============================================================================
# Update application.js to register the Login MFE
# ============================================================================

echo -e "${BLUE}📝 Updating app/javascript/application.js...${NC}"

# Check if application.js exists and has the miniSPA setup
if [ ! -f "app/javascript/application.js" ]; then
    echo -e "${RED}❌ app/javascript/application.js not found${NC}"
    exit 1
fi

# Check if the file already has miniSPA setup
if ! grep -q "miniSPA.registerApplication" app/javascript/application.js; then
    echo -e "${RED}❌ miniSPA setup not found in application.js${NC}"
    echo -e "${YELLOW}This script requires the existing single-spa setup to be in place${NC}"
    exit 1
fi

# Add the Login MFE registration to application.js
# We'll add it before the miniSPA.start() call

# Create a temporary file with the new Login MFE registration
cat > /tmp/login_mfe_registration.js << 'REGISTRATION_EOF'

  // Register the Login MFE (only active on /session/new)
  miniSPA.registerApplication({
    name: 'login-mfe',
    loadApp: async () => {
      console.log('🔵 [DEBUG] Starting Login MFE load process...');
      console.log('🔵 [DEBUG] Current window globals:', {
        React: typeof window.React,
        ReactDOM: typeof window.ReactDOM,
        location: window.location.href
      });
      
      try {
        // Step 1: Check container exists
        const container = document.getElementById('login-mfe-container');
        console.log('🔵 [DEBUG] Container check:', {
          exists: !!container,
          id: container?.id,
          innerHTML: container?.innerHTML?.substring(0, 100)
        });
        
        if (!container) {
          throw new Error('login-mfe-container not found in DOM');
        }
        
        // Step 2: Load React dependencies (reuse from other MFEs)
        console.log('🔵 [DEBUG] React dependencies already loaded:', {
          React: typeof window.React,
          ReactDOM: typeof window.ReactDOM
        });
        
        // Step 3: Test MFE URL accessibility
        console.log('🔵 [DEBUG] Testing Login MFE URL accessibility...');
        const testUrl = 'http://localhost:8083/login-mfe.js';
        
        try {
          const testResponse = await fetch(testUrl, { method: 'HEAD' });
          console.log('🔵 [DEBUG] Login MFE URL test:', {
            url: testUrl,
            status: testResponse.status,
            ok: testResponse.ok
          });
        } catch (fetchError) {
          console.error('❌ [DEBUG] Login MFE URL not accessible:', {
            url: testUrl,
            error: fetchError.message
          });
          throw new Error(`Login MFE server not running or not accessible: ${fetchError.message}`);
        }
        
        // Step 4: Load the MFE script
        console.log('🔵 [DEBUG] Loading Login MFE script...');
        const scriptId = 'login-mfe-script';
        
        // Remove existing script
        const existingScript = document.getElementById(scriptId);
        if (existingScript) {
          console.log('🔵 [DEBUG] Removing existing Login MFE script');
          existingScript.remove();
        }
        
        // Load new script
        const loadResult = await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.id = scriptId;
          script.src = testUrl;
          
          script.onload = () => {
            console.log('🔵 [DEBUG] Login MFE script loaded successfully');
            console.log('🔵 [DEBUG] Post-load window check:', {
              loginMfe: typeof window.loginMfe,
              loginMfeKeys: window.loginMfe ? Object.keys(window.loginMfe) : 'N/A'
            });
            
            // Wait for global to be available
            let attempts = 0;
            const maxAttempts = 10;
            
            const checkGlobal = () => {
              attempts++;
              console.log(`🔵 [DEBUG] Global check attempt ${attempts}/${maxAttempts}`);
              
              if (window.loginMfe && 
                  typeof window.loginMfe.bootstrap === 'function' &&
                  typeof window.loginMfe.mount === 'function' &&
                  typeof window.loginMfe.unmount === 'function') {
                
                console.log('✅ [DEBUG] Login MFE global found with all required methods:', {
                  bootstrap: typeof window.loginMfe.bootstrap,
                  mount: typeof window.loginMfe.mount,
                  unmount: typeof window.loginMfe.unmount
                });
                
                resolve({
                  bootstrap: window.loginMfe.bootstrap,
                  mount: window.loginMfe.mount,
                  unmount: window.loginMfe.unmount
                });
              } else if (attempts >= maxAttempts) {
                console.error('❌ [DEBUG] Login MFE global not found after max attempts:', {
                  attempts: maxAttempts,
                  windowLoginMfe: window.loginMfe,
                  type: typeof window.loginMfe
                });
                reject(new Error('Login MFE global not found after multiple attempts'));
              } else {
                setTimeout(checkGlobal, 100);
              }
            };
            
            checkGlobal();
          };
          
          script.onerror = (error) => {
            console.error('❌ [DEBUG] Login MFE script load failed:', {
              error: error,
              src: script.src
            });
            reject(new Error('Failed to load Login MFE script'));
          };
          
          console.log('🔵 [DEBUG] Appending Login MFE script to head');
          document.head.appendChild(script);
        });
        
        console.log('✅ [DEBUG] Login MFE load process completed successfully');
        return loadResult;
        
      } catch (error) {
        console.error('❌ [DEBUG] Login MFE load process failed:', {
          error: error.message,
          stack: error.stack
        });
        throw error;
      }
    },
    activeWhen: ['/session/new'], // Only active on login page
    customProps: {
      domElement: 'login-mfe-container'
    }
  });
REGISTRATION_EOF

# Find the line with miniSPA.start() and insert the registration before it
if grep -q "miniSPA.start()" app/javascript/application.js; then
    # Create a new version of application.js with the Login MFE registration
    awk '
    /miniSPA\.start\(\)/ {
        while ((getline line < "/tmp/login_mfe_registration.js") > 0) {
            print line
        }
        close("/tmp/login_mfe_registration.js")
        print ""
    }
    { print }
    ' app/javascript/application.js > app/javascript/application.js.tmp
    
    mv app/javascript/application.js.tmp app/javascript/application.js
    echo -e "${GREEN}✅ Updated application.js with Login MFE registration${NC}"
else
    echo -e "${RED}❌ Could not find miniSPA.start() in application.js${NC}"
    exit 1
fi

# Clean up temp file
rm -f /tmp/login_mfe_registration.js

# ============================================================================
# Create/Update the sessions/new.html.erb view
# ============================================================================

echo -e "${BLUE}📝 Creating/updating app/views/sessions/new.html.erb...${NC}"

# Create the sessions directory if it doesn't exist
mkdir -p app/views/sessions

# Create the new sessions/new.html.erb file
cat > app/views/sessions/new.html.erb << 'ERB_EOF'
<!-- Login Microfrontend Container -->
<div id="login-mfe-container">
  <div style="text-align: center; color: #666; padding: 40px;">
    Loading Login Microfrontend...
  </div>
</div>

<!-- Hidden Rails form for the microfrontend to submit -->
<%= form_with url: session_path, local: true, html: { id: 'rails-login-form', style: 'display: none;' } do |form| %>
  <%= form.email_field :email_address, id: 'rails-email', required: true, autocomplete: "username" %>
  <%= form.password_field :password, id: 'rails-password', required: true, autocomplete: "current-password", maxlength: 72 %>
  <%= form.submit "Sign in", id: 'rails-submit' %>
<% end %>

<!-- Make login data available globally for the microfrontend -->
<script>
  window.loginData = {
    sessionPath: '<%= session_path %>',
    newPasswordPath: '<%= new_password_path %>',
    newUserPath: '<%= new_user_path %>',
    flashAlert: <%= flash[:alert].to_json %>,
    flashNotice: <%= flash[:notice].to_json %>,
    emailValue: '<%= params[:email_address] %>'
  };
  console.log('🔵 Login data loaded for microfrontend:', window.loginData);
</script>
ERB_EOF

echo -e "${GREEN}✅ Created/updated sessions/new.html.erb${NC}"

# ============================================================================
# Install MFE dependencies
# ============================================================================

echo ""
echo -e "${PURPLE}📦 PART 3: Installing Login MFE dependencies...${NC}"

cd "$MFE_NAME"

echo -e "${BLUE}📦 Running npm install...${NC}"
if npm install; then
    echo -e "${GREEN}✅ Dependencies installed successfully${NC}"
else
    echo -e "${RED}❌ Failed to install dependencies${NC}"
    cd ..
    exit 1
fi

cd ..

# ============================================================================
# Create startup scripts for convenience
# ============================================================================

echo ""
echo -e "${PURPLE}🚀 PART 4: Creating convenience scripts...${NC}"

# Create a script to start all MFEs
echo -e "${BLUE}📜 Creating start-all-mfes.sh script...${NC}"
cat > start-all-mfes.sh << 'STARTUP_EOF'
#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}🚀 Starting all Microfrontends...${NC}"
echo ""

# Function to start an MFE in the background
start_mfe() {
    local mfe_name=$1
    local port=$2
    
    if [ -d "$mfe_name" ]; then
        echo -e "${YELLOW}Starting ${mfe_name} on port ${port}...${NC}"
        cd "$mfe_name"
        npm start &
        local pid=$!
        echo "$pid" > "../${mfe_name}.pid"
        cd ..
        echo -e "${GREEN}✅ ${mfe_name} started (PID: $pid)${NC}"
    else
        echo -e "${YELLOW}⚠️  ${mfe_name} directory not found, skipping...${NC}"
    fi
}

# Start all MFEs
start_mfe "header-mfe" "8082"
start_mfe "tasklist-mfe" "8081"
start_mfe "login-mfe" "8083"

echo ""
echo -e "${BLUE}🌐 Access URLs:${NC}"
echo -e "${YELLOW}  • Header MFE: http://localhost:8082${NC}"
echo -e "${YELLOW}  • TaskList MFE: http://localhost:8081${NC}"
echo -e "${YELLOW}  • Login MFE: http://localhost:8083${NC}"
echo ""
echo -e "${BLUE}📝 To stop all MFEs, run: ./stop-all-mfes.sh${NC}"
echo -e "${BLUE}💡 Start your Rails server with: bin/rails server${NC}"
echo ""
echo -e "${GREEN}🎉 All MFEs started successfully!${NC}"

# Wait for user to press Ctrl+C
echo "Press Ctrl+C to stop all MFEs..."
wait
STARTUP_EOF

chmod +x start-all-mfes.sh

# Create a script to stop all MFEs
echo -e "${BLUE}📜 Creating stop-all-mfes.sh script...${NC}"
cat > stop-all-mfes.sh << 'STOP_EOF'
#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}🛑 Stopping all Microfrontends...${NC}"
echo ""

# Function to stop an MFE
stop_mfe() {
    local mfe_name=$1
    local pid_file="${mfe_name}.pid"
    
    if [ -f "$pid_file" ]; then
        local pid=$(cat "$pid_file")
        if kill -0 "$pid" 2>/dev/null; then
            echo -e "${YELLOW}Stopping ${mfe_name} (PID: $pid)...${NC}"
            kill "$pid"
            rm "$pid_file"
            echo -e "${GREEN}✅ ${mfe_name} stopped${NC}"
        else
            echo -e "${YELLOW}⚠️  ${mfe_name} process not running${NC}"
            rm "$pid_file"
        fi
    else
        echo -e "${YELLOW}⚠️  No PID file found for ${mfe_name}${NC}"
    fi
}

# Stop all MFEs
stop_mfe "header-mfe"
stop_mfe "tasklist-mfe"
stop_mfe "login-mfe"

# Also try to kill any remaining webpack dev servers
echo -e "${BLUE}🧹 Cleaning up any remaining webpack processes...${NC}"
pkill -f "webpack.*serve" 2>/dev/null || true

echo ""
echo -e "${GREEN}✅ All MFEs stopped successfully!${NC}"
STOP_EOF

chmod +x stop-all-mfes.sh

# ============================================================================
# Final summary and instructions
# ============================================================================

echo ""
echo -e "${GREEN}🎉 LOGIN MFE SETUP COMPLETE! 🎉${NC}"
echo ""
echo -e "${BLUE}📋 What was created/modified:${NC}"
echo -e "${YELLOW}  ✅ Created ${MFE_NAME}/ directory with full MFE setup${NC}"
echo -e "${YELLOW}  ✅ Updated app/javascript/application.js with Login MFE registration${NC}"
echo -e "${YELLOW}  ✅ Created/updated app/views/sessions/new.html.erb${NC}"
echo -e "${YELLOW}  ✅ Installed all MFE dependencies${NC}"
echo -e "${YELLOW}  ✅ Created convenience scripts for starting/stopping MFEs${NC}"
echo ""
echo -e "${BLUE}🚀 Quick Start Commands:${NC}"
echo -e "${YELLOW}  1. Start all MFEs: ./start-all-mfes.sh${NC}"
echo -e "${YELLOW}  2. Start Rails server: bin/rails server${NC}"
echo -e "${YELLOW}  3. Visit: http://localhost:3000/session/new${NC}"
echo ""
echo -e "${BLUE}🔧 Individual MFE commands:${NC}"
echo -e "${YELLOW}  • Login MFE: cd ${MFE_NAME} && npm start${NC}"
echo -e "${YELLOW}  • Header MFE: cd header-mfe && npm start${NC}"
echo -e "${YELLOW}  • TaskList MFE: cd tasklist-mfe && npm start${NC}"
echo ""
echo -e "${BLUE}🌐 MFE URLs:${NC}"
echo -e "${YELLOW}  • Login MFE: http://localhost:8083${NC}"
echo -e "${YELLOW}  • Header MFE: http://localhost:8082${NC}"
echo -e "${YELLOW}  • TaskList MFE: http://localhost:8081${NC}"
echo ""
echo -e "${BLUE}💾 Backup files created:${NC}"
echo -e "${YELLOW}  • app/javascript/application.js.backup.*${NC}"
echo -e "${YELLOW}  • app/views/sessions/new.html.erb.backup.* (if existed)${NC}"
echo ""
echo -e "${GREEN}🎯 The Login MFE is now fully integrated and ready to use!${NC}"
echo -e "${CYAN}Just run the start commands above and visit your login page! 🚀${NC}"