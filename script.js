//  TOAST
function showToast(msg, type="success"){
  let box = document.getElementById("toastContainer");

  let div = document.createElement("div");
  div.className = `toast ${type}`;
  div.innerText = msg;

  box.appendChild(div);
  setTimeout(()=>div.remove(),4000);
}

//  TIME FORMAT
function formatTime(time){
  let [hour, minute] = time.split(":");
  hour = parseInt(hour);

  let ampm = hour >= 12 ? "PM" : "AM";
  hour = hour % 12 || 12;

  return `${hour}:${minute} ${ampm}`;
}

//  FIREBASE
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-app.js";

import {
  getFirestore,
  collection,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  onSnapshot,
  getDocs,
  setDoc
} from "https://www.gstatic.com/firebasejs/12.12.0/firebase-firestore.js";

import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.12.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyA27U7UomdZCWF0T4e2gkkGc5mIq_EfJA4",
  authDomain: "student-task-manager-3841f.firebaseapp.com",
  projectId: "student-task-manager-3841f",
  storageBucket: "student-task-manager-3841f.appspot.com",
  messagingSenderId: "871860364670",
  appId: "1:871860364670:web:d1ba0e3876949df9aa3f2f"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

let tasks = [];
let currentUser = null;
let unsubscribe = null;
let userDocId = null;

//  LOAD
window.onload = () => {
  setInterval(updateCountdown,1000);
  setInterval(checkReminder,60000);
};

//  AUTH STATE
onAuthStateChanged(auth, async (user)=>{
  if(user){
    currentUser = user;

    userDocId = user.email.replace(/\./g,"_");

    document.getElementById("authBox").style.display="none";
    document.getElementById("appBox").style.display="block";

    document.getElementById("userEmail").innerText = "👤 " + user.email;

    await setDoc(doc(db,"users",userDocId),{
      email:user.email
    },{merge:true});

    loadTasks();

  }else{
    document.getElementById("authBox").style.display="block";
    document.getElementById("appBox").style.display="none";
  }
});

//  REGISTER
async function register(){
  let email=document.getElementById("email").value;
  let pass=document.getElementById("password").value;

  if(!email || !pass){
    showToast("Fill all fields","error");
    return;
  }

  try{
    await createUserWithEmailAndPassword(auth,email,pass);
    showToast("Registered ✅");
  }catch(e){
    showToast(e.message,"error");
  }
}

//  LOGIN
async function login(){
  let email=document.getElementById("email").value;
  let pass=document.getElementById("password").value;

  if(!email || !pass){
    showToast("Fill all fields","error");
    return;
  }

  try{
    await signInWithEmailAndPassword(auth,email,pass);
    showToast("Login Success ✅");
  }catch(e){
    showToast(e.message,"error");
  }
}

//  LOGOUT
async function logout(){
  await signOut(auth);
  showToast("Logged out");
}

//  ADD TASK
async function addTask(){

  if(!currentUser){
    showToast("Login first","error");
    return;
  }

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

  try{
    await addDoc(collection(db,"users",userDocId,"tasks"),{
      task,date,time,priority,
      status:"Pending",
      reminded:false
    });

    showToast("Task Added ✅");

    document.getElementById("taskInput").value="";
    document.getElementById("deadline").value="";
    document.getElementById("taskTime").value="";

  }catch(e){
    showToast("Error: " + e.message,"error");
  }
}

//  LOAD TASKS
function loadTasks(){

  if(!currentUser) return;

  let table = document.getElementById("taskTable");
  let count = document.getElementById("taskCount");

  if(unsubscribe){
    unsubscribe();
  }

  unsubscribe = onSnapshot(
    collection(db,"users",userDocId,"tasks"),
    (snapshot)=>{

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
<button class="delete-btn" onclick="deleteTask('${t.id}')">Delete</button>
</td>
`;
      });

    }
  );
}

//  TIMER
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

//  REMINDER
async function checkReminder(){
  for(let t of tasks){
    let diff=new Date(`${t.date}T${t.time}`)-new Date();
    let mins=diff/1000/60;

    if(mins<=120 && mins>0 && !t.reminded){
      showToast(`${t.task} due soon 🔔`);

      await updateDoc(doc(db,"users",userDocId,"tasks",t.id),{
        reminded:true
      });
    }
  }
}

//  STATUS
async function toggleStatus(id){
  let t=tasks.find(x=>x.id===id);

  await updateDoc(doc(db,"users",userDocId,"tasks",id),{
    status: t.status==="Pending"?"Completed":"Pending"
  });
}

//  DELETE
async function deleteTask(id){
  await deleteDoc(doc(db,"users",userDocId,"tasks",id));
  showToast("Task Deleted ❌");
}

//  EDIT
async function editTask(id){
  let t=tasks.find(x=>x.id===id);

  let newTask=prompt("Edit Task:",t.task);
  let newDate=prompt("Edit Date:",t.date);
  let newTime=prompt("Edit Time:",t.time);
  let newPriority=prompt("Edit Priority:",t.priority);

  if(!newTask || !newDate || !newTime || !newPriority) return;

  await updateDoc(doc(db,"users",userDocId,"tasks",id),{
    task:newTask,
    date:newDate,
    time:newTime,
    priority:newPriority
  });

  showToast("Task Updated ✏️");
}

//  CLEAR ALL
async function clearAll(){
  if(!confirm("Delete all tasks?")) return;

  const snapshot=await getDocs(collection(db,"users",userDocId,"tasks"));

  for(let d of snapshot.docs){
    await deleteDoc(doc(db,"users",userDocId,"tasks",d.id));
  }

  showToast("All Tasks Cleared 🧹");
}

//  GLOBAL
window.addTask=addTask;
window.clearAll=clearAll;
window.deleteTask=deleteTask;
window.editTask=editTask;
window.toggleStatus=toggleStatus;
window.register=register;
window.login=login;
window.logout=logout;