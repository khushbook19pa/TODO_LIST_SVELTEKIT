<script>
  // Import CSS file
  import '../styles/todo.css';
  import { onMount } from 'svelte';
  
  // Simple variables for UI state
  let todos = [];
  let newTodoText = '';  let editingId = null;  
  let editText = '';
  
  // Toast variables
  let showToast = false;
  let toastMessage = '';
  let toastType = 'error'; // 'success', 'error', 'warning', 'info'
  
  // Toast function
  function showToastMessage(message, type = 'error') {
    toastMessage = message;
    toastType = type;
    showToast = true;
    
    // Auto hide after 3 seconds
    setTimeout(() => {
      showToast = false;
    }, 3000);
  }
  
  // Fetch todos from API
  async function fetchTodos() {
    try {
      const response = await fetch('/api/todos');
      const data = await response.json();
      if (data.success) {
        todos = data.todos;
      }
    } catch (error) {
      console.error('Error fetching todos:', error);
      showToastMessage('Failed to load todos', 'error');
    }
  }
  
  // Function to add new todo via API
  async function addTodo() {
    if (!newTodoText.trim()) {
      showToastMessage('Please enter a todo text', 'error');
      return;
    }
    
    try {
      const response = await fetch('/api/todos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: newTodoText.trim()
        })
      });
      
      const data = await response.json();
      if (data.success) {
        // Add new todo to beginning of array
        todos = [data.todo, ...todos];
        newTodoText = '';
        showToastMessage('Todo added successfully!', 'success');
      } else {
        showToastMessage('Failed to add todo', 'error');
      }
    } catch (error) {
      console.error('Error adding todo:', error);
      showToastMessage('Network error occurred', 'error');
    }
  }
  
  // Function to start editing
  function startEdit(todoId, currentText) {
    editingId = todoId;
    editText = currentText;
  }
  
  // Function to cancel editing
  function cancelEdit() {
    editingId = null;
    editText = '';
  }
  
  // Function to save edited todo
  async function saveEdit(todoId) {
    if (!editText.trim()) {
      showToastMessage('Please enter todo text', 'error');
      return;
    }
    
    try {
      const response = await fetch('/api/todos', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: todoId,
          text: editText.trim()
        })
      });
      
      const data = await response.json();
      if (data.success) {
        todos = todos.map(todo => 
          todo._id === todoId 
            ? { ...todo, text: editText.trim() }
            : todo
        );
        editingId = null;
        editText = '';
        showToastMessage('Todo updated successfully!', 'success');
      } else {
        showToastMessage('Failed to update todo', 'error');
      }
    } catch (error) {
      console.error('Error updating todo:', error);
      showToastMessage('Failed to update todo', 'error');
    }
  }
  
  // Function to delete todo
  async function deleteTodo(todoId) {
    if (confirm('Are you sure you want to delete this todo?')) {
      try {
        const response = await fetch('/api/todos', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            id: todoId
          })
        });
        
        const data = await response.json();
        if (data.success) {
          todos = todos.filter(todo => todo._id !== todoId);
          showToastMessage('Todo deleted successfully!', 'success');
        } else {
          showToastMessage('Failed to delete todo', 'error');
        }
      } catch (error) {
        console.error('Error deleting todo:', error);
        showToastMessage('Failed to delete todo', 'error');
      }
    }
  }
  

  
  // Handle Enter key press for edit todo
  function handleEditKeyPress(event, todoId) {
    if (event.key === 'Enter') {
      saveEdit(todoId);
    } else if (event.key === 'Escape') {
      cancelEdit();
    }
  }
  
  // Load todos when component mounts
  onMount(() => {
    fetchTodos();
  });
</script>

<!-- Page title -->
<svelte:head>
  <title>Simple Todo App</title>
</svelte:head>

<!-- Toast Component -->
{#if showToast}
  <div class="toast-container" class:show={showToast}>
    <div class="toast {toastType}">
      <span>{toastMessage}</span>
      <button class="toast-close" on:click={() => showToast = false}>×</button>
    </div>
  </div>
{/if}

<!-- Main container -->
<div class="container">
  
  <!-- Add new todo section -->
  <section class="add-section">
    <h2>Add New Todo</h2>
    <div class="input-group">
      <input
        type="text"
        bind:value={newTodoText}
        placeholder="Add Todo Data"
        class="todo-input"
      />
      <button on:click={addTodo} class="add-btn">Add Todo</button>
    </div>
  </section>
  
  <!-- Todos list section -->
  <section class="todos-section">
    <h2>Your Todos ({todos.length})</h2>
    
    <!-- Check if we have todos -->
    {#if todos.length === 0}
      <div class="empty-message">
        <p>No todos yet! Add one above.</p>
      </div>
    {:else}
      <!-- Todo list -->
      <ul class="todos-list">
        {#each todos as todo (todo._id)}
          <li class="todo-item" class:completed={todo.completed}>

            
            <!-- Todo content (text or edit input) -->
            <div class="todo-content">
              {#if editingId === todo._id}
                <!-- Edit mode -->
                <input
                  type="text"
                  bind:value={editText}
                  on:keypress={(e) => handleEditKeyPress(e, todo._id)}
                  class="edit-input"
                />
              {:else}
                <!-- Display mode -->
                <span class="todo-text" class:completed={todo.completed}>
                  {todo.text}
                </span>
              {/if}
            </div>
            
            <!-- Action buttons -->
            <div class="todo-actions">
              {#if editingId === todo._id}
                <!-- Edit mode buttons -->
                <button on:click={() => saveEdit(todo._id)} class="save-btn">
                  Save
                </button>
                <button on:click={cancelEdit} class="cancel-btn">
                  Cancel
                </button>
              {:else}
                <!-- Normal mode buttons -->
                <button 
                  on:click={() => startEdit(todo._id, todo.text)} 
                  class="edit-btn"
                  disabled={todo.completed}
                >
                  Edit
                </button>
                <button 
                  on:click={() => deleteTodo(todo._id)}
                  class="delete-btn"
                >
                  Delete
                </button>
              {/if}
            </div>
          </li>
        {/each}
      </ul>
    {/if}
  </section>
  
</div>