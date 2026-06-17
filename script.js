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
<h3>${index + 1}. ${item.song}</h3>
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