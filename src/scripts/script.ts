document.addEventListener('DOMContentLoaded', () => {
  const todoInput = document.getElementById('todo-input') as HTMLInputElement;
  const addButton = document.getElementById('add-button') as HTMLButtonElement;
  const todoList = document.getElementById('todo-list') as HTMLUListElement;

  addButton.addEventListener('click', () => {
    const todoText = todoInput.value.trim();
    if (todoText) {
      addTodoItem(todoText);
      todoInput.value = '';
    }
  });

  function addTodoItem(text: string): void {
    const li = document.createElement('li');
    li.innerHTML = `
      <span class="todo-item">${text}</span>
      <button class="delete-button">削除</button>
    `;
    todoList.appendChild(li);

    const deleteButton = li.querySelector('.delete-button') as HTMLButtonElement;
    deleteButton.addEventListener('click', () => {
      li.remove();
    });
  }
});