const form = document.querySelector(".form");
const submitBtn = document.querySelector("#submit");
let allTodos = [];
// Refactor del diablo

const getFormData = (form) => {
  const data = {
    id: form.children.id.value,
    task: form.children.task.value,
    description: form.children.description.value,
    status: undefined,
    createdAt: undefined,
    updatedAt: undefined,
    completedAt: undefined,
  };
  return data;
};

form.addEventListener("submit", (e) => {
    e.preventDefault();
    //necesito apuntar sobre el inputhidden
    const inputHidden = document.getElementById("id");
    const inputTask = document.getElementById('task');
    const inputDescription = document.getElementById('description');
    
    if(inputTask.value === '' || inputDescription.value === ''){
        const messageContainer = document.getElementById('sub-container')
        const errorMessage = document.createElement('h1');
        messageContainer.before(errorMessage);
        errorMessage.innerText = "Please fill out the following information";
        errorMessage.innerText.remove;
        return
    } 
  if (inputHidden.value === "") {
    const data = getFormData(e.target);
    data.status = "pending";
    data.createdAt = new Date().toISOString();
    createNewTask(data);
} else {
    // antes de editar buscar el todo anterior y copiar todos los valores en data
    // e.target seria el elemento al que se le pone el evento
    // e.currentTarget este seria el elemento al que se le hizo el evento
    // console.log(e.currentTarget);
    const data = getFormData(e.target);
    const oldTask = allTodos.find((task) => task.id === parseInt(data.id));
    data.createdAt = oldTask.createdAt;
    data.status = oldTask.status;
    data.updatedAt = new Date().toISOString();
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
  //el metodo splice en este caso necesito apuntarlo
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
    console.log(data.status)
   /*  if (data.status !== 'completed'){
        const getbtn = document.querySelector('.complete')
        console.log(getbtn)
        getbtn.style.color = 'green'
        
      } */
  });
};

const showTodosOnHtml = (task) => {
  return `<ul class="tasks">
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
    <button class="edit" onclick='setEdit(${task.id})' >Edit</button>
    <button class="delete" onclick ='deleteNewTask(${task.id})'>Delete</button>
    <button class="complete" onclick = 'completeBtn(${task.id})'>Completed</button>
    </div>

    
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

const completeBtn = async (id) => {
  const task = allTodos.find((task) => {
    const trueorfalse = task.id === parseInt(id)
    return trueorfalse
  });
  task.status = "completed";
  task.completedAt = new Date().toISOString();
  await completeTodo(task, id)
  
};

const completeTodo = async (todo, id) => {
  await fetch(`http://localhost:3000/todos/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(todo),
  });
  updateTask(id, todo)
};
const cancelButton = () => {
  const cancelBtn = document.getElementById("cancelBtn");
  form.reset();
  return cancelBtn;
};

// Subir el codigo a Github
// Tarea para arreglar, eliminar campos innecesarios
// Agregar un boton para cancelar, ese boton tiene que reset el form
// Los campos que borraste tienes que generarlo con sentido
// Y agregar un boton que diga completar a cada tarea, ese boton le va a cambiar el status a la tarea (PATCH)

// Tarea
// Subir a github
// Elimnar el boton completed cuando la tarea esta completada
// Hacer que el boton reset funcione
// Eliminar la tabla
// Ponerle el nombre de los campos al lado a cada valor
// Hacer un poco de css esa pagina ta asarosa
// Subir a github
// Validar que todos los campos del formulario esten llenos antes de crear o actualizar
// Subir a github