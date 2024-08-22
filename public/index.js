document.addEventListener('DOMContentLoaded', () => {
  const baseUrl = 'http://localhost:3000/api/v0/'
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
            `<li data-id="${todo.id}" class="item">
              <span>${todo.title}</span>
              <button data-delete-btn data-todo-id="${todo.id}">delete</button>
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
          if (Array.from(document.querySelectorAll('.item')).length <= 0) {
            document.querySelector('.list')
              .insertAdjacentHTML('beforeend', `<li class="emty-list-msg">todos empty</li>`)
          }
        })
        .catch((err) => console.error(err))
    }
  })
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
          `<li data-id="${res.todo.id}" class="item">
            <span>${res.todo.title}</span>
            <button data-delete-btn data-todo-id="${res.todo.id}">delete</button>
          </li>`)
        input.value = ''
        if (document.querySelector('.emty-list-msg')) {
          document.querySelector('.emty-list-msg').remove()
        }
      })
      .catch((err) => console.error(err))
  })
})
