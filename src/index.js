class Todo {
  constructor(
    id,
    task,
    description,
    status = "pending",
    createdAt = new Date(),
    updatedAt,
    completedAt
  ) {
    this.id = Number(id);
    this.task = task;
    this.description = description;
    this.status = status;
    this.createdAt = createdAt.toISOString();
    if (updatedAt) {
      this.updatedAt = updatedAt.toISOString();
    }
    if (completedAt) {
      this.completedAt = completedAt.toISOString();
    }
  }

  editTask(task, description, updatedAt = new Date()) {
    if (task) this.task = task;
    if (description) this.description = description;

    this.updatedAt = updatedAt.toISOString();
  }

  complete(completedAt = new Date()) {
    this.status = 'completed'
    this.completedAt = completedAt.toISOString()
  }

  static load({
    id,
    task,
    description,
    status,
    createdAt,
    updatedAt,
    completedAt,
  }) {
    const todo = new Todo(id, task, description, status);
    todo.createdAt = createdAt;
    todo.updatedAt = updatedAt;
    todo.completedAt = completedAt;
    return todo;
  }

  static fromForm(form) {
    return new Todo(
      form.children.id.value,
      form.children.task.value,
      form.children.description.value
    );
  }
}

class TodoList {
  /**
   *
   * @param {Todo[]} todos
   */
  constructor(todos) {
    this.todos = todos;
  }

  add(todo) {
    this.todos.push(todo);
  }

  remove(id) {
    this.todos = this.todos.filter((value) => value.id !== id);
  }

  find(id) {
    return this.todos.find((todo) => todo.id === id);
  }

  update(id, task) {
    const taskIndex = this.todos.findIndex((todo) => todo.id === parseInt(id));
    if (taskIndex === -1) {
      return;
    }
    console.log({ taskIndex, task });
    //el metodo splice en este caso necesito apuntarlo
    this.todos.splice(taskIndex, 1, task);
  }

  completeTodo(id, completedAt = new Date()) {
    const todo = this.find(id);
    if (!todo) return;
    todo.complete(completedAt)
  }

  render() {
    let html = "";

    this.todos.forEach((task) => {
      html += `<ul class="tasks">
    <ul class='task-container'>
    <h2 class='task-title'>Id task</h2>
    <li class="id">${task.id}</li>
    </ul>
    <ul class='task-container'>
    <h2 class='task-title'>Name of the task</h2>
    <li class="task">${task.task}</li>
    </ul>

    <ul class='task-container'>
    <h2 class='task-title'>Description of the task</h2>
    <li class="description">${task.description}</li>
    </ul>

    <ul class='task-container'>
    <h2 class='task-title'> Status of the task</h2>
    <li class="status">${task.status}</li>
    </ul>

    <ul class='task-container'>
    <h2 class='task-title'>This task was created:</h2>
    <li class="createdat">${task.createdAt}</li>
    </ul>

    <ul class='task-container'>
    <h2 class='task-title'>This task was completed:</h2>
    <li class="completedat">${task.completedAt}</li>
    </ul>

    <ul class='task-container'>
    <h2 class='task-title'>This task was updated:</h2>
    <li class="updatedat">${task.updatedAt}</li>
    </ul>
    <div class='button-task-container'>
    <button class="edit" onclick='app.setEdit(${task.id})' >Edit</button>
    <button class="delete" onclick ='app.deleteTask(${task.id})'>Delete</button>
`;

      if (task.status !== "completed") {
        html += `<button class="complete" onclick = 'app.completeBtn(${task.id})'>Completed</button>`;
      }

      html += `</div></ul>`;
    });
    return html;
  }
}

class TodoService {
  constructor(apiUrl) {
    this.url = apiUrl;
  }

  async getTodos() {
    const res = await fetch(this.url);
    const data = await res.json();
    return data;
  }

  async createTodo(todo) {
    const res = await fetch(this.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(todo),
    });

    const newTodo = await res.json();
    return newTodo;
  }

  async editTask(id, task) {
    await fetch(`${this.url}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(task),
    });
  }

  async deleteTask(id) {
    await fetch(`${this.url}/${id}`, {
      method: "DELETE",
    });
  }

  async completeTodo(id, todo) {
    await fetch(`http://localhost:3000/todos/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(todo),
    });
  }
}

//escucha evento de losbotones

class TodoApp {
  /**
   * @param {TodoList} todoList
   * @param {TodoService} todoService
   */
  constructor(todoList, todoService) {
    this.todoList = todoList;
    this.todoService = todoService;
    this.subContainer = document.querySelector("#sub-container");
    this.form = document.querySelector(".form");
    this.cancelBtn = document.querySelector("#cancel-btn");
  }

  async init() {
    await this.initTodos();
    this.initForm();
    this.initCancelForm();
    this.render();
  }

  async initTodos() {
    const todos = await this.todoService.getTodos();
    todos.forEach((todo) => {
      this.todoList.add(Todo.load(todo));
    });
  }

  initForm() {
    this.form.addEventListener("submit", (e) => {
      e.preventDefault();
      const inputHidden = document.getElementById("id");
      const inputTask = document.getElementById("task");
      const inputDescription = document.getElementById("description");

      const errorMessage = document.querySelector("#error-message");
      errorMessage.innerText = "";

      const isInvalidForm =
        inputTask.value === "" || inputDescription.value === "";
      if (isInvalidForm) {
        errorMessage.innerText = "Please fill out the following information";
        return;
      }

      const hasId = inputHidden.value === "";
      if (hasId) return this.addTodo();

      this.editTodo();
    });
  }

  initCancelForm() {
    this.cancelBtn.addEventListener("click", () => {
      this.form.reset();
    });
  }

  render() {
    this.subContainer.innerHTML = this.todoList.render();
  }

  async addTodo() {
    const todo = Todo.fromForm(this.form);
    const newTodo = await this.todoService.createTodo(todo);
    this.todoList.add(newTodo);
    this.form.reset();
    this.render();
  }

  async editTodo() {
    const formTodo = Todo.fromForm(this.form);
    const task = this.todoList.find(formTodo.id);
    task.editTask(formTodo.task, formTodo.description, new Date());
    await this.todoService.editTask(task.id, task);
    this.todoList.update(task.id, task);
    this.form.reset();
    this.render();
  }

  async deleteTask(id) {
    await this.todoService.deleteTask(id);
    this.todoList.remove(id);
    this.render();
  }

  async completeBtn(id) {
    id = parseInt(id);
    const task = {
      id,
      status: "completed",
      completedAt: new Date().toISOString(),
    };
    await this.todoService.completeTodo(id, task);
    this.todoList.completeTodo(id, new Date());
    this.render();
  }

  setEdit(id) {
    const task = this.todoList.find(id);
    this.setInputValue("id", task.id);
    this.setInputValue("task", task.task);
    this.setInputValue("description", task.description);
  }

  setInputValue(inputid, value) {
    const input = document.getElementById(inputid);
    input.value = value;
  }
}

const todoList = new TodoList([]);
const todoService = new TodoService("http://localhost:3000/todos");
const app = new TodoApp(todoList, todoService);
app.init();
