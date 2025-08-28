import React from 'react';

const Navigation = ({ 
  homeUrl = '/',
  logoutUrl = '/session',
  isAuthenticated = false,
  userEmail = '',
  organizationName = ''
}) => {
  const handleLogout = (e) => {
    e.preventDefault();
    
    // Create and submit a hidden form for logout
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = logoutUrl;
    form.style.display = 'none';
    
    // Add CSRF token
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
    if (csrfToken) {
      const csrfInput = document.createElement('input');
      csrfInput.type = 'hidden';
      csrfInput.name = 'authenticity_token';
      csrfInput.value = csrfToken;
      form.appendChild(csrfInput);
    }
    
    // Add method override for DELETE
    const methodInput = document.createElement('input');
    methodInput.type = 'hidden';
    methodInput.name = '_method';
    methodInput.value = 'DELETE';
    form.appendChild(methodInput);
    
    document.body.appendChild(form);
    form.submit();
  };

  const styles = {
    nav: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '1rem 2rem',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    leftSection: {
      display: 'flex',
      alignItems: 'center',
      gap: '2rem'
    },
    rightSection: {
      display: 'flex',
      alignItems: 'center',
      gap: '1.5rem'
    },
    homeLink: {
      color: 'white',
      textDecoration: 'none',
      fontSize: '18px',
      fontWeight: '600',
      padding: '8px 16px',
      borderRadius: '6px',
      transition: 'all 0.2s ease'
    },
    userInfo: {
      color: 'white',
      fontSize: '14px',
      textAlign: 'right'
    },
    userEmail: {
      fontWeight: '600',
      marginBottom: '2px'
    },
    organizationName: {
      opacity: 0.8,
      fontSize: '12px'
    },
    button: {
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      padding: '8px 16px',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer',
      textDecoration: 'none',
      transition: 'all 0.2s ease',
      backdropFilter: 'blur(10px)'
    }
  };

  return React.createElement('nav', {
    style: styles.nav
  },
    React.createElement('div', {
      style: styles.leftSection
    },
      React.createElement('a', {
        href: homeUrl,
        style: styles.homeLink,
        onMouseEnter: (e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)',
        onMouseLeave: (e) => e.target.style.backgroundColor = 'transparent'
      }, 'Home')
    ),
    
    React.createElement('div', {
      style: styles.rightSection
    },
      isAuthenticated ? [
        userEmail ? React.createElement('div', {
          key: 'user-info',
          style: styles.userInfo
        },
          React.createElement('div', {
            style: styles.userEmail
          }, `Welcome, ${userEmail}`),
          React.createElement('div', {
            style: styles.organizationName
          }, organizationName || 'No organization assigned')
        ) : null,
        React.createElement('button', {
          key: 'logout-btn',
          onClick: handleLogout,
          style: styles.button,
          onMouseEnter: (e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.3)',
          onMouseLeave: (e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'
        }, 'Log out')
      ] : React.createElement('a', {
        href: '/session/new',
        style: styles.button,
        onMouseEnter: (e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.3)',
        onMouseLeave: (e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'
      }, 'Log in')
    )
  );
};

export default Navigation;