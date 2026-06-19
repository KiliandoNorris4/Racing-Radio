const SUPABASE_URL = "https://ugyjydxtsyuawgdrxeug.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVneWp5ZHh0c3l1YXdnZHJ4ZXVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE2MjQyMDgsImV4cCI6MjA5NzIwMDIwOH0.9Mt-Iz1T-HNTCCAj65AxGJt9eqHq6Y9VXNZJedCFWR4";

const supabaseClient = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);
async function submitSong(){
const viewer =
document.getElementById("viewer").value;

const song =
document.getElementById("song").value;

const artist =
document.getElementById("artist").value;

if(!viewer || !song || !artist){
alert("Bitte alles ausfüllen");
return;
}

await supabaseClient
.from("songs")
.insert([{
viewer,
song,
artist,
likes:0
}]);

alert("Song Gesendet");

loadSongs();
}

async function loadSongs(){


const { data } = await supabaseClient
.from("songs")
.select("*")
.order("likes",{ascending:false});

if (data && data.length > 0) {
  const latest = data[0];

  const text =
    `${latest.song} - ${latest.artist} (${latest.viewer})`;

  const el =
    document.getElementById("nowPlayingText");

  el.style.opacity = "0";

  setTimeout(() => {
    el.innerText = text;
    el.style.opacity = "1";
  }, 200);
}

const list =
document.getElementById("songList");

list.innerHTML="";

data.forEach((item,index)=>{

list.innerHTML += `
<div class="song">

<div>
<h3>${musik + 1}. ${item.song}</h3>
<p>${item.artist}</p>
<small>${item.viewer}</small>
</div>

<div class="like-btn"
onclick="likeSong(${item.id},${item.likes})">
👍 ${item.likes}
</div>

</div>
`;

});

renderTopSongs(data);

}

function renderTopSongs(data){

  const top = [...data]
    .sort((a,b) => b.likes - a.likes)
    .slice(0,5);

  document.getElementById("topSongs").innerHTML =
    top.map((s,index) => `
      <div class="song">
        <b>${index + 1}. ${s.song}</b><br>
        ${s.artist} ❤️ ${s.likes}
      </div>
    `).join("");
}

async function likeSong(id,currentLikes){

await supabaseClient
.from("songs")
.update({
likes:currentLikes+1
})
.eq("id",id);

loadSongs();
}

loadSongs();

setInterval(loadSongs, 3000);

function toggleMenu(){

  document
    .getElementById("sideMenu")
    .classList
    .toggle("active");

}







let currentWeek = 0;
let streams = JSON.parse(localStorage.getItem("streams")) || [];
const pw = "5Tyavs8c1b5d";

/* ADMIN */
function openAdmin(){ document.getElementById("admin").classList.remove("hidden"); }
function closeAdmin(){ document.getElementById("admin").classList.add("hidden"); }

function login(){
  if(document.getElementById("pw").value === pw){
    document.getElementById("adminPanel").classList.remove("hidden");
    renderAdminList();
  } else alert("Falsches Passwort");
}

function addStream(){
  streams.push({
    id: Date.now(),
    title: title.value,
    date: date.value,
    time: time.value
  });

  save();
  render();
}

/* DELETE */
function deleteStream(id){
  streams = streams.filter(s => s.id !== id);
  save();
  render();
  renderAdminList();
}

function save(){
  localStorage.setItem("streams", JSON.stringify(streams));
}

/* WEEK */
function changeWeek(dir){
  currentWeek += dir;
  render();
}

function getWeekDates(offset){
  let now = new Date();
  now.setDate(now.getDate() + offset * 7);

  let start = new Date(now);
  start.setDate(now.getDate() - now.getDay() + 1);

  let days = [];
  for(let i=0;i<7;i++){
    let d = new Date(start);
    d.setDate(start.getDate()+i);
    days.push(d);
  }
  return days;
}

/* RENDER */
function render(){
  let calendar = document.getElementById("calendar");
  calendar.innerHTML = "";

  let days = getWeekDates(currentWeek);

  days.forEach(day=>{
    let dateStr = day.toISOString().split("T")[0];

    let cell = document.createElement("div");
    cell.className = "cell";

    cell.innerHTML = `<b>${day.toDateString().slice(0,10)}</b>`;

    streams.filter(s=>s.date===dateStr).forEach(s=>{
      cell.innerHTML += `<div class="stream">${s.time} ${s.title}</div>`;
    });

    calendar.appendChild(cell);
  });

  document.getElementById("weekText").innerText =
    "Woche " + currentWeek;

  countdown();
}

/* COUNTDOWN */
function countdown(){
  let now = new Date();

  let next = streams
    .map(s => new Date(s.date + " " + s.time))
    .filter(d => d > now)
    .sort((a,b)=>a-b)[0];

  if(!next){
    document.getElementById("countdown").innerText = "Kein nächster Stream";
    return;
  }

  let diff = next - now;
  let h = Math.floor(diff/1000/60/60);
  let m = Math.floor(diff/1000/60)%60;

  document.getElementById("countdown").innerText =
    "Nächster Stream in " + h + "h " + m + "m";
}

/* ADMIN LIST */
function renderAdminList(){
  let list = document.getElementById("list");
  list.innerHTML = "";

  streams.forEach(s=>{
    list.innerHTML += `
      <div>
        ${s.date} ${s.time} - ${s.title}
        <button onclick="deleteStream(${s.id})">X</button>
      </div>
    `;
  });
}

render();