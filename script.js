function formatTimeAMPM(time){

if(!time) return "";

let [hour, minute] = time.split(":");
hour = parseInt(hour);

let period = hour >= 12 ? "PM" : "AM";

if(hour > 12) hour -= 12;
if(hour === 0) hour = 12;

return `${hour}:${minute} ${period}`;
}

window.onload = loadTasks;

function addTask(){

let task = document.getElementById("taskInput").value;
let deadline = document.getElementById("deadline").value;
let time = document.getElementById("taskTime").value;

if(task===""){
alert("Enter task");
return;
}

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

tasks.push({
task,
deadline,
time
});

localStorage.setItem("tasks", JSON.stringify(tasks));

loadTasks();

document.getElementById("taskInput").value="";
document.getElementById("deadline").value="";
document.getElementById("taskTime").value="";
}

function loadTasks(){

let table = document.getElementById("taskTable");
table.innerHTML="";

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

tasks.forEach((t,index)=>{

let formattedTime = formatTimeAMPM(t.time);

let row = table.insertRow();

row.innerHTML = `
<td>${t.task}</td>
<td>${t.deadline} ${formattedTime}</td>
<td>
<button onclick="deleteTask(${index})">Delete</button>
</td>
`;

});
}

function deleteTask(index){

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

tasks.splice(index,1);

localStorage.setItem("tasks", JSON.stringify(tasks));

loadTasks();
}