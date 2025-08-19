import React from "react"

class NewTask extends React.Component {
  render() {
    return React.createElement('a', {
      href: '/tasks/new',
      style: {
        display: 'inline-block',
        backgroundColor: '#007bff',
        color: 'white',
        textDecoration: 'none',
        padding: '10px 16px',
        borderRadius: '6px',
        fontSize: '14px',
        fontWeight: '500',
        margin: '10px 0',
        transition: 'background-color 0.2s ease'
      },
      onMouseEnter: (e) => {
        e.target.style.backgroundColor = '#0056b3'
      },
      onMouseLeave: (e) => {
        e.target.style.backgroundColor = '#007bff'
      }
    }, 'New Task')
  }
}

export default NewTask