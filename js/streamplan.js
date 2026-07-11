import { getStreams } from "./supabase.js";

/* ==========================================
   TRACKTIME STREAMPLAN V3
========================================== */

let currentWeek = new Date();

let streams = [];

let countdownInterval = null;

let twitchLive = false;

/* ==========================================
   START
========================================== */

document.addEventListener("DOMContentLoaded", init);

window.addEventListener("streamsUpdated", async () => {

    await loadStreams();

    renderCalendar();

    updateCountdown();

});

/* ==========================================
   INITIALISIERUNG
========================================== */

async function init() {

    setupButtons();

    await loadStreams();
    
    await updateTwitchStatus();
    
    renderCalendar();

    updateCountdown();

    startAutoRefresh();

}

/* ==========================================
   BUTTONS
========================================== */

function setupButtons() {

    document
        .getElementById("prevWeek")
        .addEventListener("click", () => {

            currentWeek.setDate(

                currentWeek.getDate() - 7

            );

            renderCalendar();

            updateCountdown();

        });

    document
        .getElementById("nextWeek")
        .addEventListener("click", () => {

            currentWeek.setDate(

                currentWeek.getDate() + 7

            );

            renderCalendar();

            updateCountdown();

        });

}

/* ==========================================
   STREAMS LADEN
========================================== */

async function loadStreams() {

    streams = await getStreams();

}

/* ==========================================
   TWITCH STATUS
========================================== */

async function updateTwitchStatus() {

    try {

        const response = await fetch("/api/twitch");

        if (!response.ok) return;

        const data = await response.json();

        twitchLive = data.live;

    } catch (error) {

        console.error("Twitch:", error);

        twitchLive = false;

    }

}

/* ==========================================
   DATUM
========================================== */

function getMonday(date) {

    const monday = new Date(date);

    const day = monday.getDay();

    const diff = day === 0

        ? -6

        : 1 - day;

    monday.setDate(

        monday.getDate() + diff

    );

    monday.setHours(

        0,0,0,0

    );

    return monday;

}

function getWeekDays() {

    const monday = getMonday(currentWeek);

    const days = [];

    for(let i=0;i<7;i++) {

        const day = new Date(monday);

        day.setDate(

            monday.getDate()+i

        );

        days.push(day);

    }

    return days;

}

function formatDate(date){

    return date.toLocaleDateString(

        "de-DE",

        {

            day:"2-digit",

            month:"2-digit"

        }

    );

}

function formatDateId(date) {

    const year = date.getFullYear();

    const month = String(date.getMonth() + 1).padStart(2, "0");

    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;

}

function getWeekNumber(date){

    const d = new Date(

        Date.UTC(

            date.getFullYear(),

            date.getMonth(),

            date.getDate()

        )

    );

    d.setUTCDate(

        d.getUTCDate()

        +4

        -(d.getUTCDay()||7)

    );

    const yearStart =

        new Date(

            Date.UTC(

                d.getUTCFullYear(),

                0,

                1

            )

        );

    return Math.ceil(

        (((d-yearStart)/86400000)+1)/7

    );

}

function isToday(date){

    const today = new Date();

    return (

        today.getFullYear()===date.getFullYear()

        &&

        today.getMonth()===date.getMonth()

        &&

        today.getDate()===date.getDate()

    );

}

/* ==========================================
   KALENDER ZEICHNEN
========================================== */

function renderCalendar() {

    const calendar = document.getElementById("calendar");

    if (!calendar) return;

    const days = getWeekDays();

    document.getElementById("weekText").textContent =
        `Kalenderwoche ${getWeekNumber(days[0])}`;

    let html = "";

    /* ==========================
       DATUM-ZEILE
    ========================== */

    html += `
        <tr>
            <td class="row-title">
                Datum
            </td>
    `;

    days.forEach(day => {

        html += `
            <td class="${isToday(day) ? "today" : ""}">
                <strong>${formatDate(day)}</strong>
            </td>
        `;

    });

    html += "</tr>";

    /* ==========================
       STREAM-ZEILE
    ========================== */

    html += `
        <tr>
            <td class="row-title">
                Streams
            </td>
    `;

    const nextStream = getNextStream();

    days.forEach(day => {

        const id = formatDateId(day);

        const dayStreams = streams

            .filter(stream => stream.date === id)

            .sort((a,b) => a.time.localeCompare(b.time));

        let cell = "";

        if(dayStreams.length === 0){

            cell = `
                <div class="no-stream">

                    Kein Stream geplant

                </div>
            `;

        }else{

            dayStreams.forEach(stream => {

                cell += createStreamCard(

                    stream,

                    nextStream

                );

            });

        }

        html += `

            <td class="${isToday(day) ? "today" : ""}">

                ${cell}

            </td>

        `;

    });

    html += "</tr>";

    calendar.innerHTML = html;

}

function updateNextStreamCard() {

    const title = document.getElementById("nextStreamTitle");
    const date = document.getElementById("nextStreamDate");
    const countdown = document.getElementById("nextStreamCountdown");

    if (!title || !date || !countdown) return;

    const next = getNextStream();

    if (!next) {
        title.textContent = "Kein Stream geplant";
        date.textContent = "";
        countdown.textContent = "";
        return;
    }

    title.textContent = next.title;

    const start = new Date(`${next.date}T${next.time}`);

    date.textContent = start.toLocaleDateString("de-DE", {
        weekday: "long",
        day: "2-digit",
        month: "long"
    }) + " • " + next.time.slice(0,5) + " Uhr";

    if (streamIsLive(next)) {
        countdown.innerHTML = "🔴 LIVE";
        return;
    }

    const diff = start - new Date();

    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);

    countdown.innerHTML =
        `⏳ ${days} Tage ${hours} Std ${minutes} Min`;
}

function renderNextStreamCard() {

    const title = document.getElementById("nextStreamTitle");
    const date = document.getElementById("nextStreamDate");
    const countdown = document.getElementById("nextStreamCountdown");

    if (!title || !date || !countdown) return;

    function updateCard() {

        const next = getNextStream();

        if (!next) {
            title.textContent = "Kein Stream geplant";
            date.textContent = "";
            countdown.textContent = "";
            return;
        }

        title.textContent = next.title;

        const streamDate = new Date(`${next.date}T${next.time}`);

        date.textContent = streamDate.toLocaleDateString("de-DE", {
            weekday: "long",
            day: "2-digit",
            month: "long"
        }) + " • " + next.time.slice(0, 5) + " Uhr";

        const now = new Date();
        const diff = streamDate - now;

        if (streamIsLive(next)) {
            countdown.innerHTML = "🔴 LIVE";
            return;
        }

        const days = Math.floor(diff / 86400000);
        const hours = Math.floor((diff % 86400000) / 3600000);
        const minutes = Math.floor((diff % 3600000) / 60000);

        countdown.innerHTML =
            `⏳ Startet in ${days} Tage ${hours} Std ${minutes} Min`;
    }

    updateCard();

    if (countdownInterval) {
        clearInterval(countdownInterval);
    }

    countdownInterval = setInterval(updateCard, 60000);
}

/* ==========================================
   STREAM KARTE
========================================== */

function createStreamCard(stream,nextStream){

    let classes = "stream-card";

    if(nextStream && nextStream.id === stream.id){

        classes += " next";

    }

    if(streamIsLive(stream)){

        classes += " live";

    }

    return `

        <div class="${classes}">

            <div class="stream-time">

                🕒 ${stream.time.slice(0,5)}

            </div>

            <div class="stream-title">

                ${stream.title}

            </div>

            <div class="stream-game">

                ${stream.description || ""}

            </div>

        </div>

    `;

}

/* ==========================================
   NÄCHSTER STREAM
========================================== */

function getNextStream(){

    const now = new Date();

    const upcoming = streams.filter(stream=>{

        const start = new Date(

            `${stream.date}T${stream.time}`

        );

        return start >= now;

    });

    if(upcoming.length===0){

        return null;

    }

    upcoming.sort((a,b)=>{

        return new Date(`${a.date}T${a.time}`)

            -

            new Date(`${b.date}T${b.time}`);

    });

    return upcoming[0];

}

/* ==========================================
   LIVE STATUS
========================================== */

function streamIsLive(stream){

    return twitchLive;

}

/* ==========================================
   COUNTDOWN
========================================== */

function updateCountdown() {

    const countdown = document.getElementById("countdown");

    if (countdownInterval) {
        clearInterval(countdownInterval);
    }

    function update() {

        const next = getNextStream();

        if (!next) {

            if (countdown)
                countdown.textContent = "Momentan ist kein Stream geplant.";

            updateNextStreamCard();

            return;
        }

        const now = new Date();
        const target = new Date(`${next.date}T${next.time}`);
        const diff = target - now;

        if (diff <= 0) {

    if (twitchLive) {

        if (countdown)
            countdown.innerHTML =
                `🔴 LIVE • <strong>${next.title}</strong>`;

    } else {

        if (countdown)
            countdown.innerHTML =
                `🟡 Stream startet gleich...`;

    }

    return;

}

const days = Math.floor(diff / 86400000);
const hours = Math.floor((diff % 86400000) / 3600000);
const minutes = Math.floor((diff % 3600000) / 60000);
            
        if (countdown)
                countdown.innerHTML =
                    `⏳ Nächster Stream: <strong>${next.title}</strong><br>
                     in ${days} Tage ${hours} Stunden ${minutes} Minuten`;
        }

        updateNextStreamCard();
    }

    update();

    countdownInterval = setInterval(update, 60000);


/* ==========================================
   AUTO REFRESH
========================================== */

function startAutoRefresh(){

    setInterval(async()=>{

        await loadStreams();

        await updateTwitchStatus();

        renderCalendar();

        updateCountdown();

    },30000);

}

console.log("✅ TrackTime Streamplan V3 geladen");

/* ==========================================
   TOAST
========================================== */

export function showToast(text) {

    const toast =
        document.getElementById("toast");

    if (!toast) return;

    toast.textContent = text;

    toast.classList.add("show");

    setTimeout(() => {

        toast.classList.remove("show");

    }, 3000);

}

/* ==========================================
   HILFSFUNKTIONEN
========================================== */

function formatTime(time) {

    if (!time) return "";

    return time.slice(0, 5);

}

function sortStreams(list) {

    return list.sort((a, b) =>

        a.time.localeCompare(b.time)

    );

}

/* ==========================================
   DEBUG
========================================== */

console.log(
    "%cTrackTime Streamplan V3 geladen",
    "color:#e10600;font-size:14px;font-weight:bold;"
);

async function updateTwitchStatus() {

    try {

        const response = await fetch("/api/twitch");

        if (!response.ok) return;

        const data = await response.json();

        twitchLive = data.live;

    } catch (error) {

        console.error(error);

    }

}

await loadStreams();

await updateTwitchStatus();

renderCalendar();

setInterval(async () => {

    await updateTwitchStatus();

    renderCalendar();

},30000);