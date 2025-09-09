import React from 'react';

class TaskList extends React.Component {
  constructor(props) {
    super(props);
    
    // Check for Rails data first, then props, then defaults
    const railsData = window.tasklistMfeData;
    const tasksData = railsData?.tasks || props.tasks || [];
    const usersData = railsData?.users || props.users || [];
    
    this.state = { 
      tasks: tasksData,
      users: usersData,
      searchTerm: '',
      createdByFilter: '',
      assignedToFilter: '',
      filteredTasks: tasksData,
      isLoading: false,
      error: null,
      dataSource: railsData ? 'rails' : (props.tasks ? 'props' : 'none')
    };
    
    // Create user lookup map for quick access
    this.userLookup = {};
    usersData.forEach(user => {
      this.userLookup[user.id] = user;
    });
    
    console.log('🔵 TaskList MFE: Initialized with data source:', this.state.dataSource);
    console.log('🔵 TaskList MFE: Tasks:', tasksData.length, 'Users:', usersData.length);
  }
  
  componentDidMount() {
    // If no data available, try to fetch or use demo data
    if (this.state.dataSource === 'none') {
      this.fetchTasksOrUseDemoData();
    }
  }
  
  fetchTasksOrUseDemoData = async () => {
    this.setState({ isLoading: true, error: null });
    
    try {
      // Try to fetch from the Rails backend
      console.log('🔵 TaskList MFE: Attempting to fetch from Rails API...');
      const response = await fetch('/tasks.json', {
        credentials: 'include',
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('🔵 TaskList MFE: Successfully fetched from Rails API:', data);
        
        this.setState({
          tasks: data.tasks || [],
          users: data.users || [],
          filteredTasks: data.tasks || [],
          isLoading: false,
          dataSource: 'api'
        });
        
        // Update user lookup
        this.userLookup = {};
        (data.users || []).forEach(user => {
          this.userLookup[user.id] = user;
        });
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.warn('🔵 TaskList MFE: Could not fetch from Rails API:', error.message);
      console.log('🔵 TaskList MFE: Falling back to demo data...');
      
      const demoTasks = this.getDemoTasks();
      const demoUsers = this.getDemoUsers();
      
      this.setState({ 
        isLoading: false,
        error: 'Could not connect to Rails backend. Showing demo data.',
        tasks: demoTasks,
        users: demoUsers,
        filteredTasks: demoTasks,
        dataSource: 'demo'
      });
      
      // Update user lookup with demo data
      this.userLookup = {};
      demoUsers.forEach(user => {
        this.userLookup[user.id] = user;
      });
    }
  };
  
  getDemoTasks = () => [
    { 
      id: 1, 
      name: 'Setup TaskList MFE', 
      description: 'Create a standalone microfrontend for the task list component', 
      user_id: 1, 
      due_date: '2024-12-31T15:30',
      assigned_to: 2,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    { 
      id: 2, 
      name: 'Test MFE Integration', 
      description: 'Verify that the MFE loads correctly in both standalone and integrated modes', 
      user_id: 2, 
      due_date: null,
      assigned_to: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    { 
      id: 3, 
      name: 'Overdue Demo Task', 
      description: 'This task is intentionally overdue to demonstrate the overdue styling', 
      user_id: 1, 
      due_date: '2023-12-01T10:00',
      assigned_to: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    { 
      id: 4, 
      name: 'Document MFE Architecture', 
      description: 'Write documentation explaining how the microfrontend architecture works', 
      user_id: 2, 
      due_date: '2024-12-25T09:00',
      assigned_to: 2,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];
  
  getDemoUsers = () => [
    { id: 1, email_address: 'demo.developer@example.com' },
    { id: 2, email_address: 'demo.manager@example.com' }
  ];
  
  getUserEmail = (userId) => {
    const user = this.userLookup[userId];
    return user ? user.email_address : 'Unknown user';
  };
  
  handleSearchChange = (e) => {
    this.setState({
      searchTerm: e.target.value
    }, () => {
      this.applyFilters();
    });
  };
  
  handleCreatedByFilterChange = (e) => {
    this.setState({
      createdByFilter: e.target.value
    }, () => {
      this.applyFilters();
    });
  };
  
  handleAssignedToFilterChange = (e) => {
    this.setState({
      assignedToFilter: e.target.value
    }, () => {
      this.applyFilters();
    });
  };
  
  applyFilters = () => {
    const { tasks, searchTerm, createdByFilter, assignedToFilter } = this.state;
    
    let filteredTasks = tasks.filter(task => {
      // Text search filter
      const nameMatch = searchTerm === '' || task.name.toLowerCase().includes(searchTerm.toLowerCase());
      const descriptionMatch = searchTerm === '' || (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()));
      const textMatch = nameMatch || descriptionMatch;
      
      // Created by filter
      const createdByMatch = createdByFilter === '' || task.user_id.toString() === createdByFilter;
      
      // Assigned to filter
      const assignedToMatch = assignedToFilter === '' || 
        (assignedToFilter === 'unassigned' && !task.assigned_to) ||
        (task.assigned_to && task.assigned_to.toString() === assignedToFilter);
      
      return textMatch && createdByMatch && assignedToMatch;
    });
    
    this.setState({ filteredTasks });
  };
  
  clearAllFilters = () => {
    this.setState({
      searchTerm: '',
      createdByFilter: '',
      assignedToFilter: '',
      filteredTasks: this.state.tasks
    });
  };
  
  formatDueDate = (dueDateString) => {
    if (!dueDateString) return null;
    
    const dueDate = new Date(dueDateString);
    const now = new Date();
    const isOverdue = dueDate < now;
    
    const options = {
      month: 'short',
      day: 'numeric',
      year: dueDate.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
      hour: 'numeric',
      minute: '2-digit'
    };
    
    return {
      formatted: dueDate.toLocaleDateString('en-US', options),
      isOverdue: isOverdue
    };
  };
  
  getDataSourceBadge = () => {
    const { dataSource } = this.state;
    const badges = {
      rails: { text: 'Rails Data', color: '#28a745', icon: '🔗' },
      api: { text: 'API Data', color: '#17a2b8', icon: '🌐' },
      props: { text: 'Props Data', color: '#ffc107', icon: '⚡' },
      demo: { text: 'Demo Data', color: '#fd7e14', icon: '🎭' }
    };
    
    const badge = badges[dataSource] || badges.demo;
    
    return React.createElement('span', {
      style: {
        backgroundColor: badge.color,
        color: 'white',
        padding: '4px 8px',
        borderRadius: '12px',
        fontSize: '11px',
        fontWeight: '500',
        marginLeft: '10px'
      }
    }, `${badge.icon} ${badge.text}`);
  };
  
  render() {
    const { isLoading, error, filteredTasks, tasks, users } = this.state;
    const hasActiveFilters = this.state.searchTerm || this.state.createdByFilter || this.state.assignedToFilter;
    
    return React.createElement('div', { 
      className: 'task-list-container',
      style: {
        maxWidth: '800px',
        margin: '20px auto',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }
    }, [
      // MFE Header with data source indicator
      React.createElement('div', {
        key: 'mfe-header',
        style: {
          background: 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)',
          color: 'white',
          padding: '16px 20px',
          borderRadius: '12px',
          marginBottom: '20px',
          textAlign: 'center',
          fontWeight: '600',
          fontSize: '16px',
          boxShadow: '0 4px 12px rgba(33, 150, 243, 0.3)',
          border: '3px solid #1976d2'
        }
      }, [
        React.createElement('div', { key: 'title' }, '📋 TaskList Microfrontend (Port 8081)'),
        React.createElement('div', { 
          key: 'subtitle',
          style: { 
            fontSize: '12px', 
            opacity: 0.9, 
            marginTop: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }
        }, [
          'Independent MFE • React Component',
          this.getDataSourceBadge()
        ])
      ]),
      
      // Error/Loading states
      isLoading && React.createElement('div', {
        key: 'loading',
        style: {
          textAlign: 'center',
          padding: '40px 20px',
          color: '#666',
          fontSize: '16px',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          border: '1px solid #dee2e6'
        }
      }, '⏳ Loading tasks...'),
      
      error && React.createElement('div', {
        key: 'error',
        style: {
          backgroundColor: '#fff3cd',
          color: '#856404',
          padding: '12px 16px',
          borderRadius: '8px',
          marginBottom: '20px',
          border: '1px solid #ffeaa7',
          fontSize: '14px'
        }
      }, `⚠️ ${error}`),
      
      // Filters Section
      !isLoading && React.createElement('div', {
        key: 'filters-section',
        style: {
          backgroundColor: '#ffffff',
          border: '1px solid #e9ecef',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '20px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
        }
      }, [
        React.createElement('h3', {
          key: 'filters-title',
          style: {
            margin: '0 0 20px 0',
            fontSize: '18px',
            fontWeight: '600',
            color: '#495057',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }
        }, ['🔍 Search & Filter Tasks']),
        
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
            placeholder: 'Search by task name or description...',
            style: {
              width: '100%',
              padding: '12px 40px 12px 16px',
              border: '2px solid #e9ecef',
              borderRadius: '8px',
              fontSize: '14px',
              outline: 'none',
              transition: 'border-color 0.2s ease',
              boxSizing: 'border-box'
            },
            onFocus: (e) => e.target.style.borderColor = '#2196f3',
            onBlur: (e) => e.target.style.borderColor = '#e9ecef'
          }),
          
          this.state.searchTerm && React.createElement('button', {
            key: 'clear-search-button',
            onClick: () => this.setState({ searchTerm: '' }, () => this.applyFilters()),
            style: {
              position: 'absolute',
              right: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              fontSize: '18px',
              color: '#6c757d',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '4px',
              lineHeight: 1
            },
            onMouseEnter: (e) => {
              e.target.style.backgroundColor = '#f8f9fa';
              e.target.style.color = '#495057';
            },
            onMouseLeave: (e) => {
              e.target.style.backgroundColor = 'transparent';
              e.target.style.color = '#6c757d';
            }
          }, '×')
        ]),
        
        // Filter dropdowns
        React.createElement('div', {
          key: 'filters-row',
          style: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            marginBottom: '16px'
          }
        }, [
          // Created by filter
          React.createElement('div', {
            key: 'created-by-filter'
          }, [
            React.createElement('label', {
              key: 'created-by-label',
              style: {
                display: 'block',
                fontSize: '12px',
                fontWeight: '600',
                color: '#6c757d',
                marginBottom: '6px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }
            }, 'Created by'),
            React.createElement('select', {
              key: 'created-by-select',
              value: this.state.createdByFilter,
              onChange: this.handleCreatedByFilterChange,
              style: {
                width: '100%',
                padding: '10px 12px',
                border: '2px solid #e9ecef',
                borderRadius: '6px',
                fontSize: '14px',
                backgroundColor: 'white',
                cursor: 'pointer',
                outline: 'none',
                transition: 'border-color 0.2s ease'
              },
              onFocus: (e) => e.target.style.borderColor = '#2196f3',
              onBlur: (e) => e.target.style.borderColor = '#e9ecef'
            }, [
              React.createElement('option', { key: 'created-by-all', value: '' }, 'All users'),
              ...users.map(user => 
                React.createElement('option', {
                  key: `created-by-${user.id}`,
                  value: user.id
                }, user.email_address)
              )
            ])
          ]),
          
          // Assigned to filter
          React.createElement('div', {
            key: 'assigned-to-filter'
          }, [
            React.createElement('label', {
              key: 'assigned-to-label',
              style: {
                display: 'block',
                fontSize: '12px',
                fontWeight: '600',
                color: '#6c757d',
                marginBottom: '6px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }
            }, 'Assigned to'),
            React.createElement('select', {
              key: 'assigned-to-select',
              value: this.state.assignedToFilter,
              onChange: this.handleAssignedToFilterChange,
              style: {
                width: '100%',
                padding: '10px 12px',
                border: '2px solid #e9ecef',
                borderRadius: '6px',
                fontSize: '14px',
                backgroundColor: 'white',
                cursor: 'pointer',
                outline: 'none',
                transition: 'border-color 0.2s ease'
              },
              onFocus: (e) => e.target.style.borderColor = '#2196f3',
              onBlur: (e) => e.target.style.borderColor = '#e9ecef'
            }, [
              React.createElement('option', { key: 'assigned-to-all', value: '' }, 'All assignments'),
              React.createElement('option', { key: 'assigned-to-unassigned', value: 'unassigned' }, 'Unassigned'),
              ...users.map(user => 
                React.createElement('option', {
                  key: `assigned-to-${user.id}`,
                  value: user.id
                }, user.email_address)
              )
            ])
          ])
        ]),
        
        // Clear filters button
        hasActiveFilters && React.createElement('button', {
          key: 'clear-all-button',
          onClick: this.clearAllFilters,
          style: {
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'background-color 0.2s ease',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          },
          onMouseEnter: (e) => e.target.style.backgroundColor = '#5a6268',
          onMouseLeave: (e) => e.target.style.backgroundColor = '#6c757d'
        }, 'Clear all filters')
      ]),
      
      // Results summary
      !isLoading && React.createElement('div', {
        key: 'results-info',
        style: {
          marginBottom: '20px',
          padding: '12px 16px',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '14px',
          color: '#495057'
        }
      }, [
        React.createElement('span', {
          key: 'results-count',
          style: { fontWeight: '500' }
        }, hasActiveFilters ? 
          `Showing ${filteredTasks.length} of ${tasks.length} tasks` :
          `${tasks.length} tasks total`
        ),
        
        hasActiveFilters && React.createElement('span', {
          key: 'active-filters-indicator',
          style: {
            fontSize: '12px',
            color: '#2196f3',
            fontWeight: '600',
            backgroundColor: '#e3f2fd',
            padding: '4px 8px',
            borderRadius: '12px'
          }
        }, '🔍 Filtered')
      ]),
      
      // Task List
      !isLoading && React.createElement('div', {
        key: 'task-list',
        style: {
          display: 'grid',
          gap: '16px'
        }
      }, 
        filteredTasks.length > 0 ? 
          filteredTasks.map(task => {
            const dueDateInfo = this.formatDueDate(task.due_date);
            
            return React.createElement('div', { 
              key: task.id, 
              style: {
                backgroundColor: '#ffffff',
                border: '1px solid #e9ecef',
                borderRadius: '12px',
                padding: '24px',
                transition: 'all 0.3s ease',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                borderLeft: dueDateInfo && dueDateInfo.isOverdue ? '4px solid #dc3545' : '4px solid #28a745',
                cursor: 'pointer',
                position: 'relative'
              },
              onMouseEnter: (e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)';
                e.currentTarget.style.borderColor = '#2196f3';
              },
              onMouseLeave: (e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)';
                e.currentTarget.style.borderColor = '#e9ecef';
              }
            }, [
              // Task header
              React.createElement('div', {
                key: 'task-header',
                style: {
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '16px'
                }
              }, [
                React.createElement('div', {
                  key: 'task-info',
                  style: { flex: '1', marginRight: '16px' }
                }, [
                  React.createElement('h3', { 
                    key: 'task-name',
                    style: {
                      fontSize: '20px',
                      fontWeight: '600',
                      color: '#212529',
                      margin: '0 0 8px 0',
                      lineHeight: '1.3'
                    }
                  }, task.name),
                  
                  React.createElement('div', {
                    key: 'user-info',
                    style: {
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '12px',
                      fontSize: '13px'
                    }
                  }, [
                    React.createElement('span', {
                      key: 'created-by',
                      style: {
                        backgroundColor: '#e9ecef',
                        color: '#495057',
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontWeight: '500'
                      }
                    }, `👤 ${this.getUserEmail(task.user_id)}`),
                    
                    task.assigned_to ? React.createElement('span', {
                      key: 'assigned-to',
                      style: {
                        backgroundColor: '#d4edda',
                        color: '#155724',
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontWeight: '500'
                      }
                    }, `📋 ${this.getUserEmail(task.assigned_to)}`) : React.createElement('span', {
                      key: 'unassigned',
                      style: {
                        backgroundColor: '#f8d7da',
                        color: '#721c24',
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontWeight: '500'
                      }
                    }, '❌ Unassigned')
                  ])
                ]),
                
                dueDateInfo && React.createElement('div', {
                  key: 'due-date',
                  style: {
                    backgroundColor: dueDateInfo.isOverdue ? '#dc3545' : '#28a745',
                    color: 'white',
                    padding: '6px 12px',
                    borderRadius: '16px',
                    fontSize: '12px',
                    fontWeight: '600',
                    whiteSpace: 'nowrap',
                    textAlign: 'center'
                  }
                }, [
                  React.createElement('div', { key: 'status' }, dueDateInfo.isOverdue ? '⚠️ OVERDUE' : '📅 DUE'),
                  React.createElement('div', { key: 'date', style: { fontSize: '11px', opacity: 0.9 } }, dueDateInfo.formatted)
                ])
              ]),
              
              // Task description
              task.description && React.createElement('div', {
                key: 'task-description',
                style: {
                  color: '#6c757d',
                  fontSize: '14px',
                  lineHeight: '1.5',
                  backgroundColor: '#f8f9fa',
                  padding: '12px',
                  borderRadius: '8px',
                  fontStyle: 'italic'
                }
              }, `"${task.description}"`)
            ])
          }) :
          
          // No results message
          React.createElement('div', {
            key: 'no-results',
            style: {
              textAlign: 'center',
              padding: '60px 20px',
              color: '#6c757d',
              fontSize: '16px',
              backgroundColor: '#f8f9fa',
              borderRadius: '12px',
              border: '2px dashed #dee2e6'
            }
          }, [
            React.createElement('div', { 
              key: 'icon', 
              style: { fontSize: '48px', marginBottom: '16px' } 
            }, hasActiveFilters ? '🔍' : '📝'),
            React.createElement('div', { 
              key: 'message',
              style: { fontWeight: '500', marginBottom: '8px' }
            }, hasActiveFilters ? 'No tasks match your filters' : 'No tasks available'),
            React.createElement('div', { 
              key: 'submessage',
              style: { fontSize: '14px', opacity: 0.8 }
            }, hasActiveFilters ? 'Try adjusting your search criteria' : 'Tasks will appear here when created')
          ])
      )
    ]);
  }
}

export default TaskList;