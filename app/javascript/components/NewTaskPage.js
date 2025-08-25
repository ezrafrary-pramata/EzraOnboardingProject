import React, { useState } from 'react';

const NewTaskPage = ({ taskErrors = [] }) => {
  const [taskName, setTaskName] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    const formData = new FormData();
    formData.append('task[name]', taskName);
    formData.append('task[description]', description);
    formData.append('task[due_date]', dueDate);
    formData.append('authenticity_token', document.querySelector('meta[name="csrf-token"]')?.content || '');
    
    fetch('/tasks', {
      method: 'POST',
      body: formData,
      credentials: 'same-origin',
      headers: {
        'Accept': 'application/json'
      }
    }).then(async response => {
      if (response.ok) {
        const data = await response.json();
        window.location.href = `/tasks/${data.id || ''}`;
      } else {
        window.location.reload();
      }
    }).catch(error => {
      console.error('Task creation error:', error);
      setIsLoading(false);
    });
  };

  return React.createElement('div', { 
    style: { 
      minHeight: '100vh', 
      backgroundColor: '#f8fafc', 
      padding: '20px'
    }
  }, 
    React.createElement('div', { 
      style: { 
        maxWidth: '600px', 
        margin: '0 auto' 
      }
    }, [
      React.createElement('h1', {
        key: 'title',
        style: { 
          fontSize: '32px', 
          fontWeight: '600', 
          textAlign: 'center', 
          marginBottom: '30px',
          color: '#1f2937'
        }
      }, 'New Task'),

      React.createElement('div', {
        key: 'form-container',
        style: {
          backgroundColor: 'white',
          padding: '40px',
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }
      }, [
        // Error Messages
        taskErrors.length > 0 && React.createElement('div', {
          key: 'errors',
          style: {
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#991b1b',
            padding: '16px',
            borderRadius: '8px',
            marginBottom: '20px'
          }
        }, [
          React.createElement('div', {
            key: 'error-title',
            style: { fontWeight: '600', marginBottom: '8px' }
          }, 'Please fix the following errors:'),
          React.createElement('ul', {
            key: 'error-list',
            style: { margin: 0, paddingLeft: '20px' }
          }, taskErrors.map((error, index) => 
            React.createElement('li', {
              key: index,
              style: { marginBottom: '4px' }
            }, error)
          ))
        ]),

        // Form
        React.createElement('form', {
          key: 'form',
          onSubmit: handleSubmit
        }, [
          // Task Name
          React.createElement('div', {
            key: 'name-field',
            style: { marginBottom: '20px' }
          }, [
            React.createElement('label', {
              key: 'name-label',
              style: { 
                display: 'block', 
                fontSize: '14px', 
                fontWeight: '500', 
                marginBottom: '6px',
                color: '#374151'
              }
            }, 'Task Name *'),
            React.createElement('input', {
              key: 'name-input',
              type: 'text',
              value: taskName,
              onChange: (e) => setTaskName(e.target.value),
              required: true,
              autoFocus: true,
              placeholder: 'Enter task name',
              style: {
                width: '100%',
                padding: '12px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '16px',
                outline: 'none',
                transition: 'border-color 0.15s ease-in-out',
              },
              onFocus: (e) => e.target.style.borderColor = '#10b981',
              onBlur: (e) => e.target.style.borderColor = '#d1d5db'
            })
          ]),

          // Description
          React.createElement('div', {
            key: 'desc-field',
            style: { marginBottom: '20px' }
          }, [
            React.createElement('label', {
              key: 'desc-label',
              style: { 
                display: 'block', 
                fontSize: '14px', 
                fontWeight: '500', 
                marginBottom: '6px',
                color: '#374151'
              }
            }, 'Description'),
            React.createElement('textarea', {
              key: 'desc-input',
              value: description,
              onChange: (e) => setDescription(e.target.value),
              rows: 4,
              placeholder: 'Add task description (optional)',
              style: {
                width: '100%',
                padding: '12px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '16px',
                outline: 'none',
                resize: 'vertical',
                transition: 'border-color 0.15s ease-in-out',
              },
              onFocus: (e) => e.target.style.borderColor = '#10b981',
              onBlur: (e) => e.target.style.borderColor = '#d1d5db'
            })
          ]),

          // Due Date
          React.createElement('div', {
            key: 'date-field',
            style: { marginBottom: '30px' }
          }, [
            React.createElement('label', {
              key: 'date-label',
              style: { 
                display: 'block', 
                fontSize: '14px', 
                fontWeight: '500', 
                marginBottom: '6px',
                color: '#374151'
              }
            }, 'Due Date & Time (optional)'),
            React.createElement('input', {
              key: 'date-input',
              type: 'datetime-local',
              value: dueDate,
              onChange: (e) => setDueDate(e.target.value),
              style: {
                width: '100%',
                padding: '12px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '16px',
                outline: 'none',
                transition: 'border-color 0.15s ease-in-out',
              },
              onFocus: (e) => e.target.style.borderColor = '#10b981',
              onBlur: (e) => e.target.style.borderColor = '#d1d5db'
            })
          ]),

          // Buttons
          React.createElement('div', {
            key: 'buttons',
            style: { 
              display: 'flex', 
              gap: '12px', 
              flexWrap: 'wrap' 
            }
          }, [
            React.createElement('button', {
              key: 'submit-btn',
              type: 'submit',
              disabled: isLoading || !taskName.trim(),
              style: {
                flex: 1,
                minWidth: '120px',
                backgroundColor: isLoading || !taskName.trim() ? '#9ca3af' : '#10b981',
                color: 'white',
                padding: '14px 20px',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '500',
                cursor: isLoading || !taskName.trim() ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.15s ease-in-out',
              },
              onMouseOver: (e) => {
                if (!isLoading && taskName.trim()) {
                  e.target.style.backgroundColor = '#059669';
                }
              },
              onMouseOut: (e) => {
                if (!isLoading && taskName.trim()) {
                  e.target.style.backgroundColor = '#10b981';
                }
              }
            }, isLoading ? 'Creating...' : 'Create Task'),

            React.createElement('a', {
              key: 'cancel-btn',
              href: '/tasks',
              style: {
                display: 'inline-block',
                padding: '14px 20px',
                backgroundColor: '#6b7280',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '500',
                textAlign: 'center',
                transition: 'background-color 0.15s ease-in-out',
              },
              onMouseOver: (e) => e.target.style.backgroundColor = '#4b5563',
              onMouseOut: (e) => e.target.style.backgroundColor = '#6b7280'
            }, 'Cancel')
          ])
        ])
      ])
    ])
  );
};

export default NewTaskPage;