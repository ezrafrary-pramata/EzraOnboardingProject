import React from "react"

class TaskShow extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      task: this.props.task || {},
      assignedUser: this.props.assignedUser || null,
      createdByUser: this.props.createdByUser || null
    }
  }
  
  formatDueDate = (dueDateString) => {
    if (!dueDateString) return null
    
    const dueDate = new Date(dueDateString)
    const now = new Date()
    const isOverdue = dueDate < now
    
    const dateOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }
    
    const timeOptions = {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }
    
    return {
      date: dueDate.toLocaleDateString('en-US', dateOptions),
      time: dueDate.toLocaleDateString('en-US', timeOptions),
      isOverdue: isOverdue,
      raw: dueDate
    }
  }
  
  formatDescription = (description) => {
    if (!description) return null
    
    // Convert line breaks to <br> tags (similar to Rails simple_format)
    return description.split('\n').map((line, index, array) => [
      line,
      index < array.length - 1 ? React.createElement('br', { key: `br-${index}` }) : null
    ]).flat()
  }
  
  render() {
    const { task, assignedUser, createdByUser } = this.state
    const dueDateInfo = this.formatDueDate(task.due_date)
    
    return React.createElement('div', {
      style: {
        maxWidth: '800px',
        margin: '0 auto',
        padding: '20px',
        fontFamily: 'Arial, sans-serif'
      }
    }, [
      // Header section
      React.createElement('div', {
        key: 'header',
        style: {
          backgroundColor: '#f8f9fa',
          borderRadius: '12px',
          padding: '30px',
          marginBottom: '30px',
          border: '1px solid #e9ecef',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }
      }, [
        // Task name
        React.createElement('h1', {
          key: 'task-name',
          style: {
            color: '#2c3e50',
            fontSize: '32px',
            fontWeight: '700',
            margin: '0 0 20px 0',
            lineHeight: '1.2'
          }
        }, task.name),
        
        // Assignment info
        React.createElement('div', {
          key: 'assignment-info',
          style: {
            display: 'flex',
            flexWrap: 'wrap',
            gap: '15px',
            marginBottom: '15px'
          }
        }, [
          // Created by badge
          createdByUser && React.createElement('div', {
            key: 'created-by',
            style: {
              display: 'inline-block',
              backgroundColor: '#6c757d',
              color: 'white',
              padding: '6px 12px',
              borderRadius: '16px',
              fontSize: '13px',
              fontWeight: '500'
            }
          }, `👤 Created by: ${createdByUser.email_address}`),
          
          // Assigned to badge
          assignedUser ? React.createElement('div', {
            key: 'assigned-to',
            style: {
              display: 'inline-block',
              backgroundColor: '#28a745',
              color: 'white',
              padding: '6px 12px',
              borderRadius: '16px',
              fontSize: '13px',
              fontWeight: '500'
            }
          }, `📋 Assigned to: ${assignedUser.email_address}`) : React.createElement('div', {
            key: 'unassigned',
            style: {
              display: 'inline-block',
              backgroundColor: '#dc3545',
              color: 'white',
              padding: '6px 12px',
              borderRadius: '16px',
              fontSize: '13px',
              fontWeight: '500'
            }
          }, '❌ Unassigned')
        ]),
        
        // Due date badge (if present)
        dueDateInfo ? React.createElement('div', {
          key: 'due-date-badge',
          style: {
            display: 'inline-block',
            backgroundColor: dueDateInfo.isOverdue ? '#dc3545' : '#28a745',
            color: 'white',
            padding: '8px 16px',
            borderRadius: '20px',
            fontSize: '14px',
            fontWeight: '600'
          }
        }, dueDateInfo.isOverdue ? '⚠️ Overdue' : '📅 Due Soon') : null
      ]),
      
      // Content section
      React.createElement('div', {
        key: 'content',
        style: {
          display: 'grid',
          gap: '24px',
          marginBottom: '40px'
        }
      }, [
        // Description section (if present)
        task.description ? React.createElement('div', {
          key: 'description-section',
          style: {
            backgroundColor: 'white',
            border: '1px solid #e9ecef',
            borderRadius: '8px',
            padding: '24px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
          }
        }, [
          React.createElement('h3', {
            key: 'description-title',
            style: {
              color: '#495057',
              fontSize: '18px',
              fontWeight: '600',
              margin: '0 0 16px 0',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }
          }, ['📝 Description']),
          
          React.createElement('div', {
            key: 'description-content',
            style: {
              color: '#6c757d',
              fontSize: '16px',
              lineHeight: '1.6',
              whiteSpace: 'pre-wrap'
            }
          }, this.formatDescription(task.description))
        ]) : null,
        
        // Due date section (if present)
        dueDateInfo ? React.createElement('div', {
          key: 'due-date-section',
          style: {
            backgroundColor: 'white',
            border: '1px solid #e9ecef',
            borderRadius: '8px',
            padding: '24px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
          }
        }, [
          React.createElement('h3', {
            key: 'due-date-title',
            style: {
              color: '#495057',
              fontSize: '18px',
              fontWeight: '600',
              margin: '0 0 16px 0',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }
          }, ['🗓️ Due Date']),
          
          React.createElement('div', {
            key: 'due-date-content',
            style: {
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }
          }, [
            React.createElement('div', {
              key: 'date-display',
              style: {
                fontSize: '18px',
                fontWeight: '600',
                color: dueDateInfo.isOverdue ? '#dc3545' : '#28a745'
              }
            }, dueDateInfo.date),
            
            React.createElement('div', {
              key: 'time-display',
              style: {
                fontSize: '16px',
                color: '#6c757d'
              }
            }, `at ${dueDateInfo.time}`)
          ])
        ]) : null
      ]),
      
      // Action buttons
      React.createElement('div', {
        key: 'actions',
        style: {
          display: 'flex',
          gap: '12px',
          paddingTop: '20px',
          borderTop: '1px solid #e9ecef'
        }
      }, [
        // Edit button
        React.createElement('a', {
          key: 'edit-link',
          href: `/tasks/${task.id}/edit`,
          style: {
            backgroundColor: '#007bff',
            color: 'white',
            textDecoration: 'none',
            padding: '12px 24px',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '500',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'background-color 0.2s ease'
          },
          onMouseEnter: (e) => {
            e.target.style.backgroundColor = '#0056b3'
          },
          onMouseLeave: (e) => {
            e.target.style.backgroundColor = '#007bff'
          }
        }, ['✏️ Edit Task']),
        
        // Back button
        React.createElement('a', {
          key: 'back-link',
          href: '/tasks',
          style: {
            backgroundColor: '#6c757d',
            color: 'white',
            textDecoration: 'none',
            padding: '12px 24px',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '500',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'background-color 0.2s ease'
          },
          onMouseEnter: (e) => {
            e.target.style.backgroundColor = '#545b62'
          },
          onMouseLeave: (e) => {
            e.target.style.backgroundColor = '#6c757d'
          }
        }, ['← Back to Tasks'])
      ])
    ])
  }
}

export default TaskShow