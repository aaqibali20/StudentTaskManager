window.onload = ()=>{
loadTasks();
requestPermission();
setInterval(updateCountdown,1000);
setInterval(checkReminder,60000);
};

function requestPermission(){
if(Notification.permission !== "granted"){
Notification.requestPermission();
}
}

function addTask(){

let task = document.getElementById("taskInput").value;
let date = document.getElementById("deadline").value;
let time = document.getElementById("taskTime").value;
let priority = document.getElementById("priority").value;

if(task===""){
alert("Enter task");
return;
}

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

tasks.push({
task,
date,
time,
priority,
status:"Pending",
reminded:false
});

localStorage.setItem("tasks", JSON.stringify(tasks));

loadTasks();
}

function loadTasks(){

let table = document.getElementById("taskTable");
let count = document.getElementById("taskCount");

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

table.innerHTML="";
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

function checkReminder(){

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

tasks.forEach(t=>{

let now = new Date();
let deadline = new Date(`${t.date}T${t.time}`);

let diff = deadline - now;
let mins = diff/1000/60;

if(mins <= 120 && mins > 0 && !t.reminded){

if(Notification.permission === "granted"){
new Notification("🔔 Reminder",{
body:`${t.task} is due soon`
});
}

alert(`🔔 Reminder: ${t.task} is due soon`);

t.reminded=true;
}

});

localStorage.setItem("tasks", JSON.stringify(tasks));
}

function toggleStatus(i){

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

tasks[i].status = tasks[i].status==="Pending"?"Completed":"Pending";

localStorage.setItem("tasks", JSON.stringify(tasks));

loadTasks();
}

function deleteTask(i){

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

tasks.splice(i,1);

localStorage.setItem("tasks", JSON.stringify(tasks));

loadTasks();
}

function editTask(i){

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

let t = tasks[i];

let newTask = prompt("Edit Task:", t.task);
if(newTask === null) return;

let newDate = prompt("Edit Date:", t.date);
if(newDate === null) return;

let newTime = prompt("Edit Time:", t.time);
if(newTime === null) return;

let newPriority = prompt("Edit Priority (Low/Medium/High):", t.priority);
if(newPriority === null) return;

tasks[i] = {
...t,
task:newTask,
date:newDate,
time:newTime,
priority:newPriority
};

localStorage.setItem("tasks", JSON.stringify(tasks));

loadTasks();
}

function clearAll(){
localStorage.removeItem("tasks");
loadTasks();
}