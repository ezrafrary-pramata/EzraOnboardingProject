import React from 'react';

const Header = ({ 
  userEmail = '',
  organizationName = 'No organization assigned'
}) => {
  const styles = {
    header: {
      backgroundColor: '#f8fafc',
      borderBottom: '1px solid #e5e7eb',
      marginBottom: '2rem'
    },
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '1rem 1.5rem',
      display: 'flex',
      justifyContent: 'flex-end',
      alignItems: 'center'
    },
    userInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem'
    },
    userDetails: {
      textAlign: 'right'
    },
    userEmail: {
      fontSize: '0.875rem',
      fontWeight: '500',
      color: '#374151',
      margin: '0 0 0.25rem 0'
    },
    organizationName: {
      fontSize: '0.75rem',
      color: '#6b7280',
      margin: '0'
    },
    avatar: {
      width: '36px',
      height: '36px',
      borderRadius: '50%',
      backgroundColor: '#f3f4f6',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '0.875rem',
      fontWeight: '600',
      color: '#6b7280',
      border: '2px solid #e5e7eb'
    }
  };

  // Get user initials for avatar
  const getUserInitials = (email) => {
    if (!email) return '?';
    const name = email.split('@')[0];
    return name.substring(0, 2).toUpperCase();
  };

  return React.createElement('header', {
    style: styles.header
  },
    React.createElement('div', {
      style: styles.container
    },
      // User info section (now the only content)
      React.createElement('div', {
        style: styles.userInfo
      },
        React.createElement('div', {
          style: styles.userDetails
        },
          React.createElement('p', {
            style: styles.userEmail
          }, userEmail),
          React.createElement('p', {
            style: styles.organizationName
          }, organizationName)
        ),
        React.createElement('div', {
          style: styles.avatar
        }, getUserInitials(userEmail))
      )
    )
  );
};

export default Header;