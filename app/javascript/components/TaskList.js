import React from "react"

class TaskList extends React.Component {
  constructor(props) {
    super(props)
    this.state = { 
      tasks: this.props.tasks || [],
      users: this.props.users || [],
      searchTerm: '',
      filteredTasks: this.props.tasks || []
    }
    
    // Debug: Log what we're receiving
    console.log('TaskList props:', this.props)
    console.log('Tasks:', this.props.tasks)
    console.log('Users:', this.props.users)
    
    // Create user lookup map for quick access
    this.userLookup = {}
    if (this.props.users) {
      this.props.users.forEach(user => {
        this.userLookup[user.id] = user
      })
    }
    
    console.log('User lookup map:', this.userLookup)
  }
  
  getUserEmail = (userId) => {
    const user = this.userLookup[userId]
    return user ? user.email_address : 'Unknown user'
  }
  
  handleSearchChange = (e) => {
    const searchTerm = e.target.value.toLowerCase()
    const filteredTasks = this.state.tasks.filter(task => {
      const nameMatch = task.name.toLowerCase().includes(searchTerm)
      const descriptionMatch = task.description && task.description.toLowerCase().includes(searchTerm)
      return nameMatch || descriptionMatch
    })
    
    this.setState({
      searchTerm: e.target.value,
      filteredTasks: filteredTasks
    })
  }
  
  clearSearch = () => {
    this.setState({
      searchTerm: '',
      filteredTasks: this.state.tasks
    })
  }
  
  formatDueDate = (dueDateString) => {
    if (!dueDateString) return null
    
    const dueDate = new Date(dueDateString)
    const now = new Date()
    const isOverdue = dueDate < now
    
    const options = {
      month: 'short',
      day: 'numeric',
      year: dueDate.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
      hour: 'numeric',
      minute: '2-digit'
    }
    
    return {
      formatted: dueDate.toLocaleDateString('en-US', options),
      isOverdue: isOverdue
    }
  }
  
  render() {
    return React.createElement('div', { 
      className: 'task-list-container',
      style: {
        maxWidth: '700px',
        margin: '20px auto',
        fontFamily: 'Arial, sans-serif'
      }
    }, [
      // Search Bar
      React.createElement('div', {
        key: 'search-container',
        style: {
          marginBottom: '20px',
          position: 'relative'
        }
      }, [
        React.createElement('input', {
          key: 'search-input',
          type: 'text',
          value: this.state.searchTerm,
          onChange: this.handleSearchChange,
          placeholder: 'Search tasks and descriptions...',
          style: {
            width: '100%',
            padding: '12px 40px 12px 16px',
            border: '2px solid #e9ecef',
            borderRadius: '8px',
            fontSize: '16px',
            outline: 'none',
            transition: 'border-color 0.2s ease',
            boxSizing: 'border-box'
          },
          onFocus: (e) => {
            e.target.style.borderColor = '#007bff'
          },
          onBlur: (e) => {
            e.target.style.borderColor = '#e9ecef'
          }
        }),
        
        // Clear button
        this.state.searchTerm ? React.createElement('button', {
          key: 'clear-button',
          onClick: this.clearSearch,
          style: {
            position: 'absolute',
            right: '8px',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'none',
            border: 'none',
            fontSize: '18px',
            color: '#6c757d',
            cursor: 'pointer',
            padding: '4px',
            borderRadius: '4px'
          },
          onMouseEnter: (e) => {
            e.target.style.backgroundColor = '#f8f9fa'
            e.target.style.color = '#495057'
          },
          onMouseLeave: (e) => {
            e.target.style.backgroundColor = 'transparent'
            e.target.style.color = '#6c757d'
          }
        }, '×') : null
      ]),
      
      // Results count
      React.createElement('div', {
        key: 'results-info',
        style: {
          marginBottom: '15px',
          color: '#6c757d',
          fontSize: '14px'
        }
      }, this.state.searchTerm ? 
        `Showing ${this.state.filteredTasks.length} of ${this.state.tasks.length} tasks` :
        `${this.state.tasks.length} tasks`
      ),
      
      // Task List
      React.createElement('div', {
        key: 'task-list',
        className: 'task-list'
      }, 
        this.state.filteredTasks.length > 0 ? 
          this.state.filteredTasks.map(task => {
            const dueDateInfo = this.formatDueDate(task.due_date)
            
            return React.createElement('div', { 
              key: task.id, 
              className: 'task-item',
              style: {
                backgroundColor: '#f8f9fa',
                border: '1px solid #e9ecef',
                borderRadius: '8px',
                padding: '20px',
                marginBottom: '16px',
                transition: 'all 0.2s ease',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                borderLeft: dueDateInfo && dueDateInfo.isOverdue ? '4px solid #dc3545' : '4px solid transparent'
              },
              onMouseEnter: (e) => {
                e.target.style.backgroundColor = '#e9ecef'
                e.target.style.transform = 'translateY(-2px)'
                e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)'
              },
              onMouseLeave: (e) => {
                e.target.style.backgroundColor = '#f8f9fa'
                e.target.style.transform = 'translateY(0)'
                e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)'
              }
            }, [
              // Task header (name and due date)
              React.createElement('div', {
                key: 'task-header',
                style: {
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: task.description ? '12px' : '0'
                }
              }, [
                // Task info container
                React.createElement('div', {
                  key: 'task-info',
                  style: { flex: '1', marginRight: '15px' }
                }, [
                  // Task name (clickable)
                  React.createElement('a', { 
                    key: 'task-name',
                    href: `/tasks/${task.id}`,
                    style: {
                      textDecoration: 'none',
                      color: '#495057',
                      fontSize: '18px',
                      fontWeight: '600',
                      display: 'block'
                    },
                    onMouseEnter: (e) => {
                      e.target.style.color = '#007bff'
                    },
                    onMouseLeave: (e) => {
                      e.target.style.color = '#495057'
                    }
                  }, task.name),
                  
                  // User email (shown below task name)
                  React.createElement('div', {
                    key: 'user-email',
                    style: {
                      color: '#6c757d',
                      fontSize: '14px',
                      marginTop: '4px'
                    }
                  }, `Assigned by: ${this.getUserEmail(task.user_id)}`)
                ]),
                
                // Due date badge
                dueDateInfo ? React.createElement('span', {
                  key: 'due-date',
                  style: {
                    backgroundColor: dueDateInfo.isOverdue ? '#dc3545' : '#17a2b8',
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '500',
                    whiteSpace: 'nowrap'
                  }
                }, dueDateInfo.isOverdue ? `Overdue: ${dueDateInfo.formatted}` : `Due: ${dueDateInfo.formatted}`) : null
              ]),
              
              // Task description
              task.description ? React.createElement('div', {
                key: 'task-description',
                style: {
                  color: '#6c757d',
                  fontSize: '14px',
                  lineHeight: '1.4',
                  marginTop: '8px',
                  paddingLeft: '0'
                }
              }, task.description) : null
            ])
          }) :
          // No results message
          React.createElement('div', {
            style: {
              textAlign: 'center',
              padding: '40px 20px',
              color: '#6c757d',
              fontSize: '16px',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px',
              border: '1px solid #e9ecef'
            }
          }, this.state.searchTerm ? 
            `No tasks found matching "${this.state.searchTerm}"` :
            'No tasks available'
          )
      )
    ])
  }
}

export default TaskList