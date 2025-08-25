import React, { useState } from 'react';

const TaskForm = ({ 
  taskId = null,
  taskName = '',
  taskDescription = '',
  taskDueDate = '',
  errors = [],
  formAction = '/tasks',
  formMethod = 'POST',
  isEdit = false
}) => {
  const [name, setName] = useState(taskName);
  const [description, setDescription] = useState(taskDescription);
  const [dueDate, setDueDate] = useState(taskDueDate);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Get the hidden Rails form and populate it
    const railsForm = document.getElementById('rails-task-form');
    const nameInput = document.getElementById('rails-name');
    const descriptionInput = document.getElementById('rails-description');
    const dueDateInput = document.getElementById('rails-due-date');
    const submitBtn = document.getElementById('rails-submit');
    
    if (railsForm && nameInput && descriptionInput && dueDateInput && submitBtn) {
      nameInput.value = name;
      descriptionInput.value = description;
      dueDateInput.value = dueDate;
      submitBtn.click();
    }
  };

  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
      padding: '2rem 1rem',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    },
    card: {
      maxWidth: '600px',
      margin: '0 auto',
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
      backgroundColor: '#0ea5e9',
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
    errorContainer: {
      padding: '1.5rem',
      borderRadius: '12px',
      backgroundColor: '#fef2f2',
      border: '1px solid #fecaca',
      marginBottom: '2rem'
    },
    errorTitle: {
      fontSize: '1.125rem',
      fontWeight: '600',
      color: '#dc2626',
      margin: '0 0 1rem 0',
      display: 'flex',
      alignItems: 'center'
    },
    errorIcon: {
      marginRight: '0.5rem',
      color: '#dc2626'
    },
    errorList: {
      margin: '0',
      paddingLeft: '1.5rem',
      color: '#991b1b'
    },
    errorItem: {
      marginBottom: '0.5rem',
      fontSize: '0.875rem'
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
    input: {
      width: '100%',
      padding: '12px 16px',
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      fontSize: '1rem',
      color: '#111827',
      backgroundColor: 'white',
      transition: 'all 0.2s',
      outline: 'none',
      boxSizing: 'border-box'
    },
    textarea: {
      width: '100%',
      padding: '12px 16px',
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      fontSize: '1rem',
      color: '#111827',
      backgroundColor: 'white',
      transition: 'all 0.2s',
      outline: 'none',
      boxSizing: 'border-box',
      resize: 'vertical',
      minHeight: '100px'
    },
    submitButton: {
      width: '100%',
      padding: '12px 16px',
      backgroundColor: '#0ea5e9',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      fontSize: '1rem',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.2s',
      marginTop: '1rem'
    },
    buttonContainer: {
      textAlign: 'center'
    }
  };

  // Format due date for display (convert from Rails format if needed)
  const formatDateForInput = (dateStr) => {
    if (!dateStr) return '';
    // If it's already in the correct format, return as is
    if (dateStr.includes('T')) return dateStr.slice(0, 16);
    // Convert from other formats if needed
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '';
    return date.toISOString().slice(0, 16);
  };

  const formattedDueDate = formatDateForInput(dueDate);

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
              d: isEdit ? "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" : "M12 4v16m8-8H4"
            })
          )
        ),
        React.createElement('h2', {
          style: styles.title
        }, isEdit ? 'Edit Task' : 'Create New Task'),
        React.createElement('p', {
          style: styles.subtitle
        }, isEdit ? 'Update your task details' : 'Fill in the details for your new task')
      ),

      // Error Messages
      errors.length > 0 && React.createElement('div', {
        style: styles.errorContainer
      },
        React.createElement('h3', {
          style: styles.errorTitle
        },
          React.createElement('svg', {
            width: "20",
            height: "20",
            fill: "none",
            stroke: "currentColor",
            viewBox: "0 0 24 24",
            style: styles.errorIcon
          },
            React.createElement('path', {
              strokeLinecap: "round",
              strokeLinejoin: "round",
              strokeWidth: "2",
              d: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
            })
          ),
          `${errors.length} error${errors.length > 1 ? 's' : ''} prohibited this task from being saved:`
        ),
        React.createElement('ul', {
          style: styles.errorList
        },
          errors.map((error, index) => 
            React.createElement('li', {
              key: index,
              style: styles.errorItem
            }, error)
          )
        )
      ),

      // Form
      React.createElement('div', null,
        // Name Field
        React.createElement('div', {
          style: styles.formGroup
        },
          React.createElement('label', {
            htmlFor: "task_name",
            style: styles.label
          }, "Name"),
          React.createElement('input', {
            id: "task_name",
            name: "task[name]",
            type: "text",
            required: true,
            value: name,
            onChange: (e) => setName(e.target.value),
            style: styles.input,
            onFocus: (e) => e.target.style.borderColor = '#0ea5e9',
            onBlur: (e) => e.target.style.borderColor = '#d1d5db',
            placeholder: "Enter task name"
          })
        ),

        // Description Field
        React.createElement('div', {
          style: styles.formGroup
        },
          React.createElement('label', {
            htmlFor: "task_description",
            style: styles.label
          }, "Description"),
          React.createElement('textarea', {
            id: "task_description",
            name: "task[description]",
            value: description,
            onChange: (e) => setDescription(e.target.value),
            style: styles.textarea,
            onFocus: (e) => e.target.style.borderColor = '#0ea5e9',
            onBlur: (e) => e.target.style.borderColor = '#d1d5db',
            placeholder: "Enter task description",
            rows: 4
          })
        ),

        // Due Date Field
        React.createElement('div', {
          style: styles.formGroup
        },
          React.createElement('label', {
            htmlFor: "task_due_date",
            style: styles.label
          }, "Due Date & Time (optional)"),
          React.createElement('input', {
            id: "task_due_date",
            name: "task[due_date]",
            type: "datetime-local",
            value: formattedDueDate,
            onChange: (e) => setDueDate(e.target.value),
            style: styles.input,
            onFocus: (e) => e.target.style.borderColor = '#0ea5e9',
            onBlur: (e) => e.target.style.borderColor = '#d1d5db'
          })
        ),

        // Submit Button
        React.createElement('div', {
          style: styles.buttonContainer
        },
          React.createElement('button', {
            type: "submit",
            onClick: handleSubmit,
            style: styles.submitButton,
            onMouseEnter: (e) => e.target.style.backgroundColor = '#0284c7',
            onMouseLeave: (e) => e.target.style.backgroundColor = '#0ea5e9'
          }, isEdit ? 'Update Task' : 'Create Task')
        )
      )
    )
  );
};

export default TaskForm;