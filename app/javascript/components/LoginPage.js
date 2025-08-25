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