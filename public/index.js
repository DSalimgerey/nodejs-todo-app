document.addEventListener('DOMContentLoaded', () => {
  fetch('http://localhost:3000/api/v0/todos')
    .then((res) => {
      if (res.ok) {
        return res.json()
      }
      throw new Error('err')
    })
    .then((res) => {
      const list = document.querySelector('.list')
      if (res.todos.length > 0) {
        for (let i = 0; i < res.todos.length; i++) {
          const item = document.createElement('li')
          list.textContent = res.todos[i].title
          list.insertAdjacentElement('beforeend', item)
        }
      } else {
        list.insertAdjacentHTML('beforeend', `<li class="emty-list-msg">todos empty</li>`)
      }
    })
    .catch((err) => {
      console.error(err)
    })

  document.querySelector('form').addEventListener('submit', (e) => {
    e.preventDefault()
    const input = document.getElementById('todo-title')
    fetch('http://localhost:3000/api/v0/todos', {
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
        list.insertAdjacentHTML('beforeend', `<li>${res.todo.title}</li>`)
        input.value = ''
        if (document.querySelector('.emty-list-msg')) {
          document.querySelector('.emty-list-msg').remove()
        }
      })
      .catch((err) => console.error(err))
  })
})
