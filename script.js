// 🔥 TOAST
function showToast(msg, type="success"){
  let box = document.getElementById("toastContainer");

  let div = document.createElement("div");
  div.className = `toast ${type}`;
  div.innerText = msg;

  box.appendChild(div);

  setTimeout(()=>div.remove(),10000);
}

// 🌙 DARK MODE
function toggleDarkMode(){
  document.body.classList.toggle("dark");
}
window.toggleDarkMode = toggleDarkMode;

// 🕒 TIME FORMAT (AM/PM)
function formatTime(time){
  let [hour, minute] = time.split(":");
  hour = parseInt(hour);

  let ampm = hour >= 12 ? "PM" : "AM";
  hour = hour % 12 || 12;

  return `${hour}:${minute} ${ampm}`;
}


// 🔥 FIREBASE (⚠️ SAME OLD CONFIG USE KARNA)
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  onSnapshot,
  getDocs
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

// 🚀 LOAD
window.onload = () => {
  loadTasks();
  setInterval(updateCountdown,1000);
  setInterval(checkReminder,60000);
};

// ➕ ADD TASK
async function addTask(){
  let task = document.getElementById("taskInput").value;
  let date = document.getElementById("deadline").value;
  let time = document.getElementById("taskTime").value;
  let priority = document.getElementById("priority").value;

  if(!task){
    showToast("Enter task","error");
    return;
  }

  if(!date || !time){
    showToast("Select date & time","error");
    return;
  }

  await addDoc(collection(db,"tasks"),{
    task,date,time,priority,
    status:"Pending",
    reminded:false
  });

  showToast("Task Added ✅","success");

  document.getElementById("taskInput").value="";
  document.getElementById("deadline").value="";
  document.getElementById("taskTime").value="";
}

// 📥 REALTIME LOAD
function loadTasks(){

  let table = document.getElementById("taskTable");
  let count = document.getElementById("taskCount");

  onSnapshot(collection(db,"tasks"),(snapshot)=>{

    table.innerHTML="";
    tasks=[];

    snapshot.forEach(docSnap=>{
      tasks.push({id:docSnap.id,...docSnap.data()});
    });

    count.innerText="Total Tasks: "+tasks.length;

    tasks.forEach((t,i)=>{
      let row = table.insertRow();

      row.innerHTML=`
<td>${i+1}</td>
<td class="${t.status==='Completed'?'completed':''}">${t.task}</td>
<td>${t.date} ${formatTime(t.time)}</td>

<td>
<span class="priority-badge priority-${t.priority.toLowerCase()}">
${t.priority}
</span>
</td>

<td id="timer-${i}">--</td>

<td>
<input type="checkbox" ${t.status==="Completed"?"checked":""}
onchange="toggleStatus('${t.id}')">
</td>

<td>
<button onclick="editTask('${t.id}')">Edit</button>
<button onclick="deleteTask('${t.id}')">Delete</button>
</td>
`;
    });

  });
}

// ⏳ TIMER
function updateCountdown(){
  tasks.forEach((t,i)=>{
    let el=document.getElementById(`timer-${i}`);
    if(!el) return;

    let diff=new Date(`${t.date}T${t.time}`)-new Date();

    if(diff<=0){
      el.innerText="Expired";
      return;
    }

    let h=Math.floor(diff/1000/60/60);
    let m=Math.floor((diff/1000/60)%60);

    el.innerText=`${h}h ${m}m left`;
  });
}

// ⏰ REMINDER
async function checkReminder(){
  for(let t of tasks){
    let diff=new Date(`${t.date}T${t.time}`)-new Date();
    let mins=diff/1000/60;

    if(mins<=120 && mins>0 && !t.reminded){
      showToast(`${t.task} due soon 🔔`,"reminder");

      await updateDoc(doc(db,"tasks",t.id),{
        reminded:true
      });
    }
  }
}

// 🔁 TOGGLE STATUS
async function toggleStatus(id){
  let t=tasks.find(x=>x.id===id);

  await updateDoc(doc(db,"tasks",id),{
    status: t.status==="Pending"?"Completed":"Pending"
  });
}

// ❌ DELETE
async function deleteTask(id){
  await deleteDoc(doc(db,"tasks",id));
  showToast("Task Deleted ❌","error");
}

// ✏️ EDIT (FULL FIXED)
async function editTask(id){
  let t=tasks.find(x=>x.id===id);

  let newTask=prompt("Edit Task:",t.task);
  let newDate=prompt("Edit Date (YYYY-MM-DD):",t.date);
  let newTime=prompt("Edit Time (HH:MM):",t.time);
  let newPriority=prompt("Edit Priority (Low/Medium/High):",t.priority);

  if(!newTask || !newDate || !newTime || !newPriority) return;

  await updateDoc(doc(db,"tasks",id),{
    task:newTask,
    date:newDate,
    time:newTime,
    priority:newPriority
  });

  showToast("Task Updated ✏️","success");
}

// 🧹 CLEAR (SAFE)
async function clearAll(){
  if(!confirm("Delete all tasks?")) return;

  const snapshot=await getDocs(collection(db,"tasks"));

  for(let d of snapshot.docs){
    await deleteDoc(doc(db,"tasks",d.id));
  }

  showToast("All Tasks Cleared 🧹","error");
}

// 🌐 GLOBAL
window.addTask=addTask;
window.clearAll=clearAll;
window.deleteTask=deleteTask;
window.editTask=editTask;
window.toggleStatus=toggleStatus;