import React from "react"

class TaskList extends React.Component {
  constructor(props) {
    super(props)
    this.state = { 
      tasks: this.props.tasks || [],
      users: this.props.users || [],
      searchTerm: '',
      createdByFilter: '',
      assignedToFilter: '',
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
    this.setState({
      searchTerm: e.target.value
    }, () => {
      this.applyFilters()
    })
  }
  
  handleCreatedByFilterChange = (e) => {
    this.setState({
      createdByFilter: e.target.value
    }, () => {
      this.applyFilters()
    })
  }
  
  handleAssignedToFilterChange = (e) => {
    this.setState({
      assignedToFilter: e.target.value
    }, () => {
      this.applyFilters()
    })
  }
  
  applyFilters = () => {
    const { tasks } = this.state
    const { searchTerm, createdByFilter, assignedToFilter } = this.state
    
    let filteredTasks = tasks.filter(task => {
      // Text search filter
      const nameMatch = searchTerm === '' || task.name.toLowerCase().includes(searchTerm.toLowerCase())
      const descriptionMatch = searchTerm === '' || (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()))
      const textMatch = nameMatch || descriptionMatch
      
      // Created by filter
      const createdByMatch = createdByFilter === '' || task.user_id.toString() === createdByFilter
      
      // Assigned to filter
      const assignedToMatch = assignedToFilter === '' || 
        (assignedToFilter === 'unassigned' && !task.assigned_to) ||
        (task.assigned_to && task.assigned_to.toString() === assignedToFilter)
      
      return textMatch && createdByMatch && assignedToMatch
    })
    
    this.setState({
      filteredTasks: filteredTasks
    })
  }
  
  clearAllFilters = () => {
    this.setState({
      searchTerm: '',
      createdByFilter: '',
      assignedToFilter: '',
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
    const hasActiveFilters = this.state.searchTerm || this.state.createdByFilter || this.state.assignedToFilter
    
    return React.createElement('div', { 
      className: 'task-list-container',
      style: {
        maxWidth: '700px',
        margin: '20px auto',
        fontFamily: 'Arial, sans-serif'
      }
    }, [
      // Filters Section
      React.createElement('div', {
        key: 'filters-section',
        style: {
          backgroundColor: '#f8f9fa',
          border: '1px solid #e9ecef',
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '20px'
        }
      }, [
        React.createElement('h3', {
          key: 'filters-title',
          style: {
            margin: '0 0 16px 0',
            fontSize: '16px',
            fontWeight: '600',
            color: '#495057'
          }
        }, 'Search & Filter Tasks'),
        
        // Search Bar
        React.createElement('div', {
          key: 'search-container',
          style: {
            marginBottom: '16px',
            position: 'relative'
          }
        }, [
          React.createElement('input', {
            key: 'search-input',
            type: 'text',
            value: this.state.searchTerm,
            onChange: this.handleSearchChange,
            placeholder: 'Search by task name or description...',
            style: {
              width: '100%',
              padding: '10px 40px 10px 12px',
              border: '1px solid #ced4da',
              borderRadius: '6px',
              fontSize: '14px',
              outline: 'none',
              transition: 'border-color 0.2s ease',
              boxSizing: 'border-box'
            },
            onFocus: (e) => {
              e.target.style.borderColor = '#007bff'
            },
            onBlur: (e) => {
              e.target.style.borderColor = '#ced4da'
            }
          }),
          
          // Clear search button
          this.state.searchTerm ? React.createElement('button', {
            key: 'clear-search-button',
            onClick: () => this.setState({ searchTerm: '' }, () => this.applyFilters()),
            style: {
              position: 'absolute',
              right: '8px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              fontSize: '16px',
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
        
        // Filter dropdowns row
        React.createElement('div', {
          key: 'filters-row',
          style: {
            display: 'flex',
            gap: '12px',
            marginBottom: '12px',
            flexWrap: 'wrap'
          }
        }, [
          // Created by filter
          React.createElement('div', {
            key: 'created-by-filter',
            style: { flex: '1', minWidth: '200px' }
          }, [
            React.createElement('label', {
              key: 'created-by-label',
              style: {
                display: 'block',
                fontSize: '12px',
                fontWeight: '500',
                color: '#6c757d',
                marginBottom: '4px'
              }
            }, 'Created by:'),
            React.createElement('select', {
              key: 'created-by-select',
              value: this.state.createdByFilter,
              onChange: this.handleCreatedByFilterChange,
              style: {
                width: '100%',
                padding: '8px',
                border: '1px solid #ced4da',
                borderRadius: '4px',
                fontSize: '14px',
                backgroundColor: 'white',
                cursor: 'pointer'
              }
            }, [
              React.createElement('option', { key: 'created-by-all', value: '' }, 'All users'),
              ...this.state.users.map(user => 
                React.createElement('option', {
                  key: `created-by-${user.id}`,
                  value: user.id
                }, user.email_address)
              )
            ])
          ]),
          
          // Assigned to filter
          React.createElement('div', {
            key: 'assigned-to-filter',
            style: { flex: '1', minWidth: '200px' }
          }, [
            React.createElement('label', {
              key: 'assigned-to-label',
              style: {
                display: 'block',
                fontSize: '12px',
                fontWeight: '500',
                color: '#6c757d',
                marginBottom: '4px'
              }
            }, 'Assigned to:'),
            React.createElement('select', {
              key: 'assigned-to-select',
              value: this.state.assignedToFilter,
              onChange: this.handleAssignedToFilterChange,
              style: {
                width: '100%',
                padding: '8px',
                border: '1px solid #ced4da',
                borderRadius: '4px',
                fontSize: '14px',
                backgroundColor: 'white',
                cursor: 'pointer'
              }
            }, [
              React.createElement('option', { key: 'assigned-to-all', value: '' }, 'All assignments'),
              React.createElement('option', { key: 'assigned-to-unassigned', value: 'unassigned' }, 'Unassigned'),
              ...this.state.users.map(user => 
                React.createElement('option', {
                  key: `assigned-to-${user.id}`,
                  value: user.id
                }, user.email_address)
              )
            ])
          ])
        ]),
        
        // Clear all filters button
        hasActiveFilters ? React.createElement('button', {
          key: 'clear-all-button',
          onClick: this.clearAllFilters,
          style: {
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            padding: '6px 12px',
            borderRadius: '4px',
            fontSize: '12px',
            cursor: 'pointer',
            transition: 'background-color 0.2s ease'
          },
          onMouseEnter: (e) => {
            e.target.style.backgroundColor = '#5a6268'
          },
          onMouseLeave: (e) => {
            e.target.style.backgroundColor = '#6c757d'
          }
        }, 'Clear all filters') : null
      ]),
      
      // Results count
      React.createElement('div', {
        key: 'results-info',
        style: {
          marginBottom: '15px',
          color: '#6c757d',
          fontSize: '14px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }
      }, [
        React.createElement('span', {
          key: 'results-count'
        }, hasActiveFilters ? 
          `Showing ${this.state.filteredTasks.length} of ${this.state.tasks.length} tasks` :
          `${this.state.tasks.length} tasks`
        ),
        
        hasActiveFilters ? React.createElement('span', {
          key: 'active-filters-indicator',
          style: {
            fontSize: '12px',
            color: '#007bff',
            fontWeight: '500'
          }
        }, 'Filters active') : null
      ]),
      
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
                  
                  // User info (created by and assigned to)
                  React.createElement('div', {
                    key: 'user-info',
                    style: {
                      color: '#6c757d',
                      fontSize: '14px',
                      marginTop: '4px'
                    }
                  }, [
                    React.createElement('div', {
                      key: 'created-by',
                      style: { marginBottom: '2px' }
                    }, `Created by: ${this.getUserEmail(task.user_id)}`),
                    
                    task.assigned_to ? React.createElement('div', {
                      key: 'assigned-to',
                      style: { 
                        color: '#28a745',
                        fontWeight: '500'
                      }
                    }, `📋 Assigned to: ${this.getUserEmail(task.assigned_to)}`) : React.createElement('div', {
                      key: 'unassigned',
                      style: { 
                        color: '#6c757d',
                        fontStyle: 'italic'
                      }
                    }, '👤 Unassigned')
                  ])
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
          }, hasActiveFilters ? 
            'No tasks found matching the current filters' :
            'No tasks available'
          )
      )
    ])
  }
}

export default TaskList