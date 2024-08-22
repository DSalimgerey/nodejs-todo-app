document.addEventListener('DOMContentLoaded', () => {
  const baseUrl = 'http://localhost:3000/api/v0/'
  // fetch todos 
  fetch(new URL(`todos`, baseUrl))
    .then((res) => {
      if (res.ok) {
        return res.json()
      }
      throw new Error('err')
    })
    .then((res) => {
      const todos = res.todos
      const list = document.querySelector('.list')
      if (todos.length > 0) {
        for (let i = 0; i < todos.length; i++) {
          const todo = todos[i]
          list.insertAdjacentHTML(
            'beforeend',
            `<li data-id="${todo.id}" id="todo-item" style="margin: 4px 0;">
              <div>
                <span>${todo.title}</span>
                <button data-delete-btn data-todo-id="${todo.id}">delete</button>
              </div>
              <div>
                <button>activities</button>
              </div>
            </li>`
          )
        }
      } else {
        list.insertAdjacentHTML('beforeend', `<li class="emty-list-msg">todos empty</li>`)
      }
    })
    .catch((err) => {
      console.error(err)
    })
  
  // event handlers
  document.addEventListener('click', (e) => {
    let deletedTodo
    if (e.target.hasAttribute('data-delete-btn')) {
      const id = e.target.getAttribute('data-todo-id')
      deletedTodo = id
      fetch(new URL(`todos/${id}`, baseUrl), {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then(() => {
          document.querySelector(`li[data-id="${deletedTodo}"]`).remove()
          if (Array.from(document.querySelectorAll('#todo-item')).length <= 0) {
            document.querySelector('.list')
              .insertAdjacentHTML('beforeend', `<li class="emty-list-msg">todos empty</li>`)
          }
        })
        .catch((err) => console.error(err))
    }
    
    let loading = false
    let isOpen = false
    if (e.target.hasAttribute('data-activities')) {
      const todoItemEl = e.target.closest('li#todo-item')
      const todoId = todoItemEl.getAttribute('data-id')
      loading = true
      fetch(new URL(`todos/${todoId}/actions`, baseUrl))
        .then((res) => res.json())
        .then((res) => {
          const actionList = todoItemEl.querySelector('#action-list')
          for (let i = 0; i < res.actions.length; i++) {
            actionList.insertAdjacentHTML('beforeend',
              `<li style="max-width: 400px;">
                <span>${res.actions[i]}</span> 
              </li>`)
          }
        })
        .catch((err) => {
          console.error(err)
        })
        .finally(() => {
          loading = false
        })
    }
  })
  // create new todo
  document.querySelector('form').addEventListener('submit', (e) => {
    e.preventDefault()
    const input = document.getElementById('todo-title')
    fetch(new URL('todos', baseUrl), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: input.value,
        user_id: 1,
      }),
    })
      .then((res) => res.json())
      .then((res) => {
        const list = document.querySelector('.list')
        list.insertAdjacentHTML(
          'beforeend', 
          `<li data-id="${res.todo.id}" id="todo-item" style="margin: 4px 0;">
            <div>
              <span>${res.todo.title}</span>
              <button data-delete-btn data-todo-id="${res.todo.id}">delete</button>
            </div>
            <div id="action-wrapper">
              <button data-activities>activities</button>
              <ul id="action-list"></ul>
            </div>
          </li>`)
        input.value = ''
        if (document.querySelector('.emty-list-msg')) {
          document.querySelector('.emty-list-msg').remove()
        }
      })
      .catch((err) => console.error(err))
  })
})
