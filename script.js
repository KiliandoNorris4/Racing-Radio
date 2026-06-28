/* =====================================
   SUPABASE
===================================== */

const SUPABASE_URL =
"https://ugyjydxtsyuawgdrxeug.supabase.co";

const SUPABASE_KEY =
"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVneWp5ZHh0c3l1YXdnZHJ4ZXVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE2MjQyMDgsImV4cCI6MjA5NzIwMDIwOH0.9Mt-Iz1T-HNTCCAj65AxGJt9eqHq6Y9VXNZJedCFWR4";

let supabaseClient = null;

if (typeof supabase !== "undefined") {
    supabaseClient =
        supabase.createClient(
            SUPABASE_URL,
            SUPABASE_KEY
        );
}

/* =====================================
   MUSIKSEITE
===================================== */

async function submitSong() {

    const viewer =
        document.getElementById("viewer")?.value;

    const song =
        document.getElementById("song")?.value;

    const artist =
        document.getElementById("artist")?.value;

    if (!viewer || !song || !artist) {

        alert(
            "Bitte alle Felder ausfüllen."
        );

        return;
    }

    const { data, error } = await supabaseClient
    .from("songs")
    .insert([
        {
            viewer,
            song,
            artist,
            likes: 0
        }
    ]);

console.log("DATA:", data);
console.log("ERROR:", error);

if (error) {
    alert(error.message);
    return;
}

alert("Song erfolgreich gespeichert!");

    document.getElementById("viewer").value = "";
    document.getElementById("song").value = "";
    document.getElementById("artist").value = "";

    loadSongs();
}

async function loadSongs() {

    if (!document.getElementById("songList"))
        return;

    const { data, error } =
        await supabaseClient
            .from("songs")
            .select("*")
            .order(
                "likes",
                {
                    ascending: false
                }
            );

    if (error) {

        console.error(error);

        return;
    }

    updateNowPlaying(data);

    renderSongList(data);

    renderTopSongs(data);
}

function updateNowPlaying(data) {

    if (
        !data ||
        data.length === 0
    )
        return;

    const latest = data[0];

    const text =
        `${latest.song} - ${latest.artist}`;

    const element =
        document.getElementById(
            "nowPlayingText"
        );

    if (!element) return;

    element.textContent = text;
}

function renderSongList(data) {

    const songList =
        document.getElementById(
            "songList"
        );

    if (!songList) return;

    songList.innerHTML = "";

    data.forEach(
        (item, index) => {

            songList.innerHTML += `

            <div class="song">

                <div>

                    <h3>
                        ${index + 1}.
                        ${item.song}
                    </h3>

                    <p>
                        ${item.artist}
                    </p>

                    <small>
                        ${item.viewer}
                    </small>

                </div>

                <div
                    class="like-btn"
                    onclick="likeSong(
                        ${item.id},
                        ${item.likes}
                    )">

                    👍 ${item.likes}

                </div>

            </div>

            `;
        }
    );
}

function renderTopSongs(data) {

    const topSongs =
        document.getElementById(
            "topSongs"
        );

    if (!topSongs) return;

    const top =
        [...data]
            .sort(
                (a, b) =>
                    b.likes - a.likes
            )
            .slice(0, 5);

    topSongs.innerHTML =
        top.map(
            (song, index) => `
            <div class="song">

                <div>

                    <h3>
                        ${index + 1}.
                        ${song.song}
                    </h3>

                    <p>
                        ${song.artist}
                    </p>

                </div>

                <strong>
                    ❤️ ${song.likes}
                </strong>

            </div>
        `
        ).join("");
}

async function likeSong(
    id,
    currentLikes
) {

    await supabaseClient
        .from("songs")
        .update({
            likes:
                currentLikes + 1
        })
        .eq("id", id);

    loadSongs();
}

/* =====================================
   STREAMPLAN
===================================== */

let currentWeek = 0;

let streams =
    JSON.parse(
        localStorage.getItem(
            "streams"
        )
    ) || [];

const adminPassword =
    "5Tyavs8c1b5d";

/* ADMIN */

function openAdmin() {

    document
        .getElementById("admin")
        ?.classList.remove(
            "hidden"
        );
}

function closeAdmin() {

    document
        .getElementById("admin")
        ?.classList.add(
            "hidden"
        );
}

function login() {

    const password =
        document
            .getElementById("pw")
            ?.value;

    if (
        password ===
        adminPassword
    ) {

        document
            .getElementById(
                "adminPanel"
            )
            ?.classList.remove(
                "hidden"
            );

        renderAdminList();

    } else {

        alert(
            "Falsches Passwort"
        );
    }
}

function addStream() {

    const title =
        document
            .getElementById(
                "title"
            ).value;

    const date =
        document
            .getElementById(
                "date"
            ).value;

    const time =
        document
            .getElementById(
                "time"
            ).value;

    if (
        !title ||
        !date ||
        !time
    )
        return;

    await supabaseClient
    .from("streams")
    .insert([{
        title,
        date,
        time
    }]);

    saveStreams();

    renderCalendar();

    renderAdminList();

    updateHomepageStream();
}

function deleteStream(id) {

    streams =
        streams.filter(
            stream =>
                stream.id !== id
        );

    saveStreams();

    renderCalendar();

    renderAdminList();

    updateHompageStream();
}

function saveStreams() {

    localStorage.setItem(
        "streams",
        JSON.stringify(
            streams
        )
    );
}

/* WEEK */

function changeWeek(direction) {

    currentWeek += direction;

    renderCalendar();
}

function getWeekDates(offset) {

    const now =
        new Date();

    now.setDate(
        now.getDate() +
        offset * 7
    );

    const monday =
        new Date(now);

    monday.setDate(
        now.getDate() -
        now.getDay() +
        1
    );

    const days = [];

    for (
        let i = 0;
        i < 7;
        i++
    ) {

        const day =
            new Date(monday);

        day.setDate(
            monday.getDate() +
            i
        );

        days.push(day);
    }

    return days;
}

async function renderCalendar() {

    const calendar =
        document.getElementById(
            "calendar"
        );

    if (!calendar)
        return;

    calendar.innerHTML = "";

    const days =
        getWeekDates(
            currentWeek
        );

    days.forEach(day => {

        const dateString =
            day
                .toISOString()
                .split("T")[0];

        const cell =
            document.createElement(
                "div"
            );

        cell.className =
            "cell";

        cell.innerHTML =
            `<b>${dateString}</b>`;

        streams
            .filter(
                stream =>
                    stream.date ===
                    dateString
            )
            .forEach(stream => {

                cell.innerHTML += `
                <div class="stream">
                    ${stream.time}
                    ${stream.title}
                </div>
                `;
            });

        calendar.appendChild(
            cell
        );

        const streams =
            await loadStreams();

    });

    const weekText =
        document.getElementById(
            "weekText"
        );

    if (weekText) {

        weekText.textContent =
            `Woche ${currentWeek}`;
    }

    updateCountdown();
}

function updateCountdown() {

    const countdown =
        document.getElementById(
            "countdown"
        );

    if (!countdown)
        return;

    const now =
        new Date();

    const nextStream =
        streams
            .map(
                stream =>
                    new Date(
                        stream.date +
                        " " +
                        stream.time
                    )
            )
            .filter(
                date =>
                    date > now
            )
            .sort(
                (a, b) =>
                    a - b
            )[0];

    if (!nextStream) {

        countdown.textContent =
            "Kein geplanter Stream";

        return;
    }

    const difference =
        nextStream - now;

    const hours =
        Math.floor(
            difference /
            1000 /
            60 /
            60
        );

    const minutes =
        Math.floor(
            difference /
            1000 /
            60
        ) % 60;

    countdown.textContent =
        `Nächster Stream in ${hours}h ${minutes}m`;
}

function updateHomepageStream() {

    const titleEl =
        document.getElementById("nextStreamTitle");

    if (!titleEl) return;

    const dateEl =
        document.getElementById("nextStreamDate");

    const countdownEl =
        document.getElementById("nextStreamCountdown");

    const now = new Date();

    const nextStream = streams
        .filter(s => s.date && s.time)
        .sort((a, b) =>
            new Date(a.date + " " + a.time) -
            new Date(b.date + " " + b.time)
        )
        .find(s =>
            new Date(s.date + " " + s.time) > now
        );

    if (!nextStream) {

        titleEl.textContent =
            "Kein Stream geplant";

        dateEl.textContent = "";

        countdownEl.textContent = "";

        return;
    }

    const streamDate =
        new Date(
            nextStream.date +
            " " +
            nextStream.time
        );

    const diff =
        streamDate - now;

    const hours =
        Math.floor(
            diff / 1000 / 60 / 60
        );

    const minutes =
        Math.floor(
            diff / 1000 / 60
        ) % 60;

    titleEl.textContent =
        nextStream.title;

    dateEl.textContent =
        `${nextStream.date} | ${nextStream.time}`;

    countdownEl.textContent =
        `In ${hours}h ${minutes}m`;
}

function renderAdminList() {

    const list =
        document.getElementById(
            "list"
        );

    if (!list)
        return;

    list.innerHTML = "";

    streams.forEach(stream => {

        list.innerHTML += `

        <div>

            <span>
                ${stream.date}
                ${stream.time}
                -
                ${stream.title}
            </span>

            <button
                onclick="
                deleteStream(
                ${stream.id}
                )">

                X

            </button>

        </div>

        `;
    });
}

/* =====================================
   PAGE INIT
===================================== */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        if (
            document.getElementById(
                "songList"
            )
        ) {

            loadSongs();

            setInterval(
                loadSongs,
                5000
            );
        }

        if (
            document.getElementById(
                "calendar"
            )
        ) {

            renderCalendar();
        }

        updateHomepageStream();
    }
);

async function loadStreams(){

    const { data, error } =
        await supabaseClient
            .from("streams")
            .select("*");

    if(error){
        console.error(error);
        return [];
    }

    return data;
}

async function updateHomepageStream(){

    const streams =
        await loadStreams();

    const now = new Date();

    const nextStream =
        streams
        .sort((a,b)=>
            new Date(a.date+" "+a.time) -
            new Date(b.date+" "+b.time)
        )
        .find(s =>
            new Date(s.date+" "+s.time) > now
        );

    const title =
        document.getElementById(
            "nextStreamTitle"
        );

    const date =
        document.getElementById(
            "nextStreamDate"
        );

    const countdown =
        document.getElementById(
            "nextStreamCountdown"
        );

    if(!nextStream){

        title.textContent =
            "Kein Stream geplant";

        date.textContent = "";
        countdown.textContent = "";

        return;
    }

    title.textContent =
        nextStream.title;

    date.textContent =
        `${nextStream.date} | ${nextStream.time}`;
}