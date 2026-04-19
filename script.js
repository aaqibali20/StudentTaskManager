//  Firebase Setup
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/12.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyA27U7UomdZCWF0T4e2gkkGc5mIq_EfJA4",
  authDomain: "student-task-manager-3841f.firebaseapp.com",
  projectId: "student-task-manager-3841f",
  storageBucket: "student-task-manager-3841f.firebasestorage.app",
  messagingSenderId: "871860364670",
  appId: "1:871860364670:web:d1ba0e3876949df9aa3f2f"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let tasks = [];

//  Page Load
window.onload = () => {
  loadTasks();
  setInterval(updateCountdown, 1000);
  setInterval(checkReminder, 60000);
};

//  ADD TASK
async function addTask() {
  let task = document.getElementById("taskInput").value;
  let date = document.getElementById("deadline").value;
  let time = document.getElementById("taskTime").value;
  let priority = document.getElementById("priority").value;

  if (task === "") {
    alert("Enter task");
    return;
  }

  if (!date || !time) {
    alert("Select date & time");
    return;
  }

  await addDoc(collection(db, "tasks"), {
    task,
    date,
    time,
    priority,
    status: "Pending",
    reminded: false
  });

  loadTasks();

  //  form auto clear
  document.getElementById("taskInput").value = "";
  document.getElementById("deadline").value = "";
  document.getElementById("taskTime").value = "";
  document.getElementById("priority").value = "Low";
}

//  LOAD TASKS
async function loadTasks() {
  const snapshot = await getDocs(collection(db, "tasks"));

  let table = document.getElementById("taskTable");
  let count = document.getElementById("taskCount");

  table.innerHTML = "";
  tasks = [];

  snapshot.forEach((docSnap) => {
    tasks.push({ id: docSnap.id, ...docSnap.data() });
  });

  count.innerText = "Total Tasks: " + tasks.length;

  tasks.forEach((t, i) => {
    let row = table.insertRow();

    row.innerHTML = `
<td>${i + 1}</td>
<td class="${t.status === 'Completed' ? 'completed' : ''}">${t.task}</td>
<td>${t.date} ${t.time}</td>
<td class="${t.priority.toLowerCase()}">${t.priority}</td>
<td id="timer-${i}">--</td>
<td>
<input type="checkbox" ${t.status === "Completed" ? "checked" : ""} onchange="toggleStatus('${t.id}')">
</td>
<td>
<button onclick="editTask('${t.id}')">Edit</button>
<button onclick="deleteTask('${t.id}')">Delete</button>
</td>
`;
  });
}

//  COUNTDOWN
function updateCountdown() {
  tasks.forEach((t, i) => {
    let el = document.getElementById(`timer-${i}`);
    if (!el) return;

    let now = new Date();
    let deadline = new Date(`${t.date}T${t.time}`);
    let diff = deadline - now;

    if (diff <= 0) {
      el.innerText = "Expired";
      return;
    }

    let h = Math.floor(diff / 1000 / 60 / 60);
    let m = Math.floor((diff / 1000 / 60) % 60);

    el.innerText = `${h}h ${m}m left`;
  });
}

//  REMINDER
async function checkReminder() {
  for (let t of tasks) {
    let now = new Date();
    let deadline = new Date(`${t.date}T${t.time}`);
    let diff = deadline - now;
    let mins = diff / 1000 / 60;

    if (mins <= 120 && mins > 0 && !t.reminded) {
      alert(`Reminder: ${t.task} is due soon`);

      await updateDoc(doc(db, "tasks", t.id), {
        reminded: true
      });
    }
  }
}

//  TOGGLE STATUS
async function toggleStatus(id) {
  let t = tasks.find(task => task.id === id);

  let newStatus = t.status === "Pending" ? "Completed" : "Pending";

  await updateDoc(doc(db, "tasks", id), {
    status: newStatus
  });

  loadTasks();
}

//  DELETE
async function deleteTask(id) {
  await deleteDoc(doc(db, "tasks", id));
  loadTasks();
}

//  EDIT
async function editTask(id) {
  let t = tasks.find(task => task.id === id);

  let newTask = prompt("Edit Task:", t.task);
  if (newTask === null) return;

  let newDate = prompt("Edit Date:", t.date);
  if (newDate === null) return;

  let newTime = prompt("Edit Time:", t.time);
  if (newTime === null) return;

  let newPriority = prompt("Edit Priority:", t.priority);
  if (newPriority === null) return;

  await updateDoc(doc(db, "tasks", id), {
    task: newTask,
    date: newDate,
    time: newTime,
    priority: newPriority
  });

  loadTasks();
}

//  CLEAR ALL
async function clearAll() {
  const snapshot = await getDocs(collection(db, "tasks"));

  for (let d of snapshot.docs) {
    await deleteDoc(doc(db, "tasks", d.id));
  }

  loadTasks();
}

//  IMPORTANT (buttons ke liye global)
window.addTask = addTask;
window.clearAll = clearAll;
window.deleteTask = deleteTask;
window.editTask = editTask;
window.toggleStatus = toggleStatus;