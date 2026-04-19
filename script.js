import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCX5eXQ3Y6sr92XLrnWjOvdotfncXB_pcI",
  authDomain: "student-task-manager-89635.firebaseapp.com",
  projectId: "student-task-manager-89635",
  storageBucket: "student-task-manager-89635.firebasestorage.app",
  messagingSenderId: "1017924790163",
  appId: "1:1017924790163:web:2fd95b7a407e766402ea66"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// INIT
window.onload = ()=>{
loadTasks();
setInterval(updateCountdown,1000);
setInterval(checkReminder,60000);
};

// ADD TASK
async function addTask(){

let task = document.getElementById("taskInput").value;
let date = document.getElementById("deadline").value;
let time = document.getElementById("taskTime").value;
let priority = document.getElementById("priority").value;

if(task===""){
alert("Enter task");
return;
}

// Firebase save
await addDoc(collection(db,"tasks"),{
task,date,time,priority,status:"Pending"
});

// Local save
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
tasks.push({task,date,time,priority,status:"Pending",reminded:false});
localStorage.setItem("tasks", JSON.stringify(tasks));

loadTasks();
}

// LOAD TASKS
async function loadTasks(){

let table = document.getElementById("taskTable");
let count = document.getElementById("taskCount");

table.innerHTML="";

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

count.innerText="Total Tasks: "+tasks.length;

tasks.forEach((t,i)=>{

let row = table.insertRow();

row.innerHTML=`
<td>${i+1}</td>
<td class="${t.status==='Completed'?'completed':''}">${t.task}</td>
<td>${t.date} ${t.time}</td>
<td class="${t.priority.toLowerCase()}">${t.priority}</td>
<td id="timer-${i}">--</td>
<td>
<input type="checkbox" ${t.status==="Completed"?"checked":""} onchange="toggleStatus(${i})">
</td>
<td>
<button onclick="editTask(${i})">Edit</button>
<button onclick="deleteTask(${i})">Delete</button>
</td>
`;
});
}

// COUNTDOWN
function updateCountdown(){

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

tasks.forEach((t,i)=>{

let el = document.getElementById(`timer-${i}`);
if(!el) return;

let now = new Date();
let deadline = new Date(`${t.date}T${t.time}`);

let diff = deadline - now;

if(diff <= 0){
el.innerText="Expired";
return;
}

let h = Math.floor(diff/1000/60/60);
let m = Math.floor((diff/1000/60)%60);

el.innerText = `${h}h ${m}m left`;
});
}

// REMINDER
function checkReminder(){

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

tasks.forEach(t=>{

let now = new Date();
let deadline = new Date(`${t.date}T${t.time}`);

let diff = deadline - now;
let mins = diff/1000/60;

if(mins <= 120 && mins > 0 && !t.reminded){
alert(`🔔 Reminder: ${t.task} is due soon`);
t.reminded=true;
}
});

localStorage.setItem("tasks", JSON.stringify(tasks));
}

// DELETE
function deleteTask(i){

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
tasks.splice(i,1);
localStorage.setItem("tasks", JSON.stringify(tasks));

loadTasks();
}

// EDIT
function editTask(i){

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

let t = tasks[i];

let newTask = prompt("Edit Task:", t.task);
if(newTask===null) return;

let newDate = prompt("Edit Date:", t.date);
if(newDate===null) return;

let newTime = prompt("Edit Time:", t.time);
if(newTime===null) return;

let newPriority = prompt("Edit Priority:", t.priority);
if(newPriority===null) return;

tasks[i] = {...t,task:newTask,date:newDate,time:newTime,priority:newPriority};

localStorage.setItem("tasks", JSON.stringify(tasks));
loadTasks();
}

// STATUS
function toggleStatus(i){

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
tasks[i].status = tasks[i].status==="Pending"?"Completed":"Pending";
localStorage.setItem("tasks", JSON.stringify(tasks));

loadTasks();
}

// CLEAR
function clearAll(){
localStorage.removeItem("tasks");
loadTasks();
}