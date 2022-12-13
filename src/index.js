const form = document.querySelector(".form");
const submitBtn = document.querySelector("#submit");
let allTodos = [];

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const inputHidden = document.getElementById("id");
  const data = {
    task: document.getElementById("task").value,
    description: document.getElementById("description").value,
    status: document.getElementById("status").value,
    createdAt: document.getElementById("createdat").value,
    updatedAt: document.getElementById("updatedat").value,
    completedAt: document.getElementById("completedat").value,
  };
  if (inputHidden.value === "") {
    createNewTask(data);
  } else {
    data.id = inputHidden.value;
    editNewTask(inputHidden.value, data);
  }
  form.reset();
});

// Nombre de la funcion horrible
const getTodos = async () => {
  const res = await fetch("http://localhost:3000/todos");
  const data = await res.json();
  return data;
};

getTodos().then((data) => setTodos(data));

const addTask = (task) => {
  allTodos.push(task);
  setTodosHTML(allTodos);
};

const removeTask = (id) => {
  const newTasks = allTodos.filter((value) => {
    const trueorfalse = value.id !== id;
    return trueorfalse;
  });
  setTodos(newTasks);
};

const updateTask = (id, task) => {
  const taskIndex = allTodos.findIndex((todo) => {
    const trueorfalse = todo.id === parseInt(id);
    return trueorfalse;
  });

  if (taskIndex === -1) {
    return;
  }

  allTodos.splice(taskIndex, 1, task);
  setTodos(allTodos);
};

const setTodos = (todos) => {
  allTodos = todos;
  setTodosHTML(allTodos);
};

const setTodosHTML = (todos) => {
  const subContainer = document.getElementById("sub-container");
  subContainer.innerHTML = "";
  todos.forEach((data) => {
    subContainer.innerHTML += showTodosOnHtml(data);
  });
};

const showTodosOnHtml = (task) => {
  return `<ul class="tasks">
    <li class="id">${task.id}</li>
    <li class="task">${task.task}</li>
    <li class="description">${task.description}</li>
    <li class="status">${task.status}</li>
    <li class="createdat">${task.createdAt}</li>
    <li class="completedat">${task.completedAt}</li>
    <li class="updatedat">${task.updatedAt}</li>
    <button class="edit" onclick='setEdit(${task.id})' >edit</button>
    <button class="delete" onclick ='deleteNewTask(${task.id})'>delete</button>
</ul>`;
};

const setEdit = (id) => {
  const task = allTodos.find((value) => {
    const truthorfalse = value.id === id;
    return truthorfalse;
  });
  setInputValue("id", task.id);
  setInputValue("task", task.task);
  setInputValue("description", task.description);
};

const setInputValue = (inputid, value) => {
  const input = document.getElementById(inputid);
  input.value = value;
};

const createNewTask = async (task) => {

  const res = await fetch("http://localhost:3000/todos", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(task),
  });

  const todo = await res.json();
  addTask(todo);
};

const deleteNewTask = async (id) => {
   await fetch(`http://localhost:3000/todos/${id}`, {
    method: "DELETE",
  });
  removeTask(id);
};

const editNewTask = async (id, task) => {

  await fetch(`http://localhost:3000/todos/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(task),
  });

  updateTask(id, task);
};
