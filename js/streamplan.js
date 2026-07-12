import { getStreams } from "./supabase.js";

/* ==========================================
   TRACKTIME STREAMPLAN V4
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

    await updateTwitchStatus();

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

    try {

        streams = await getStreams();

    } catch (error) {

        console.error("Streams konnten nicht geladen werden:", error);

        streams = [];

    }

}

/* ==========================================
   TWITCH STATUS
========================================== */

async function updateTwitchStatus() {

    try {

        const response = await fetch("/api/twitch");

        if (!response.ok) {

            twitchLive = false;

            return;

        }

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

    const diff = day === 0 ? -6 : 1 - day;

    monday.setDate(monday.getDate() + diff);

    monday.setHours(0,0,0,0);

    return monday;

}

function getWeekDays() {

    const monday = getMonday(currentWeek);

    const days = [];

    for(let i = 0; i < 7; i++){

        const day = new Date(monday);

        day.setDate(monday.getDate() + i);

        days.push(day);

    }

    return days;

}

function formatDate(date){

    return date.toLocaleDateString("de-DE",{

        day:"2-digit",

        month:"2-digit"

    });

}

function formatDateId(date){

    return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`;

}

function isToday(date){

    const today = new Date();

    return today.getFullYear()===date.getFullYear()

        && today.getMonth()===date.getMonth()

        && today.getDate()===date.getDate();

}

function getWeekNumber(date){

    const d = new Date(Date.UTC(

        date.getFullYear(),

        date.getMonth(),

        date.getDate()

    ));

    d.setUTCDate(

        d.getUTCDate()+4-(d.getUTCDay()||7)

    );

    const yearStart = new Date(

        Date.UTC(d.getUTCFullYear(),0,1)

    );

    return Math.ceil(

        (((d-yearStart)/86400000)+1)/7

    );

}

/* ==========================================
   KALENDER
========================================== */

function renderCalendar() {

    const calendar = document.getElementById("calendar");

    if (!calendar) return;

    const days = getWeekDays();

    document.getElementById("weekText").textContent =
        `Kalenderwoche ${getWeekNumber(days[0])}`;

    let html = "";

    /* DATUM */

    html += `
        <tr>
            <td class="row-title">Datum</td>
    `;

    days.forEach(day => {

        html += `
            <td class="${isToday(day) ? "today" : ""}">
                <strong>${formatDate(day)}</strong>
            </td>
        `;

    });

    html += "</tr>";

    /* STREAMS */

    html += `
        <tr>
            <td class="row-title">Streams</td>
    `;

    const nextStream = getNextStream();

    days.forEach(day => {

        const id = formatDateId(day);

        const dayStreams = streams
            .filter(stream => stream.date === id)
            .sort((a,b)=>a.time.localeCompare(b.time));

        let cell = "";

        if(dayStreams.length === 0){

            cell = `
                <div class="no-stream">
                    Kein Stream geplant
                </div>
            `;

        }else{

            dayStreams.forEach(stream=>{

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

/* ==========================================
   STREAM KARTE
========================================== */

function createStreamCard(stream,nextStream){

    let classes = "stream-card";

    if(nextStream && stream.id === nextStream.id){

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

    const upcoming = streams

        .filter(stream => {

            return new Date(
                `${stream.date}T${stream.time}`
            ) >= now;

        })

        .sort((a,b)=>

            new Date(`${a.date}T${a.time}`)

            -

            new Date(`${b.date}T${b.time}`)

        );

    return upcoming.length

        ? upcoming[0]

        : null;

}

/* ==========================================
   LIVE STATUS
========================================== */

function streamIsLive(stream){

    if(!stream) return false;

    const next = getNextStream();

    if(!next) return false;

    return twitchLive && stream.id === next.id;

}

/* ==========================================
   COUNTDOWN
========================================== */

function updateCountdown() {

    const countdown = document.getElementById("countdown");
    const title = document.getElementById("nextStreamTitle");
    const date = document.getElementById("nextStreamDate");
    const nextCountdown = document.getElementById("nextStreamCountdown");

    if (countdownInterval) {
        clearInterval(countdownInterval);
    }

    function update() {

        const next = getNextStream();

        if (!next) {

            if (countdown)
                countdown.textContent = "Momentan ist kein Stream geplant.";

            if (title) title.textContent = "Kein Stream geplant";
            if (date) date.textContent = "";
            if (nextCountdown) nextCountdown.textContent = "";

            return;

        }

        const target = new Date(`${next.date}T${next.time}`);
        const now = new Date();

        const diff = target - now;

        title.textContent = next.title;

        date.textContent =
            target.toLocaleDateString("de-DE", {
                weekday: "long",
                day: "2-digit",
                month: "long"
            }) +
            " • " +
            next.time.slice(0,5) +
            " Uhr";

        /* ==========================
           TWITCH LIVE
        ========================== */

        if (twitchLive) {

            if (countdown)
                countdown.innerHTML =
                    `🔴 LIVE • <strong>${next.title}</strong>`;

            if (nextCountdown)
                nextCountdown.innerHTML =
                    "🔴 LIVE";

            return;

        }

        /* ==========================
           STREAM SOLLTE STARTEN
        ========================== */

        if (diff <= 0) {

            if (countdown)
                countdown.innerHTML =
                    "🟡 Stream startet gleich...";

            if (nextCountdown)
                nextCountdown.innerHTML =
                    "🟡 Stream startet gleich...";

            return;

        }

        /* ==========================
           NORMALER COUNTDOWN
        ========================== */

        const days = Math.floor(diff / 86400000);
        const hours = Math.floor((diff % 86400000) / 3600000);
        const minutes = Math.floor((diff % 3600000) / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);

        if (countdown) {

            countdown.innerHTML =
                `⏳ Nächster Stream: <strong>${next.title}</strong><br>
                 in ${days} Tage ${hours} Std ${minutes} Min`;

        }

        if (nextCountdown) {

            nextCountdown.innerHTML =
                `${days}T ${hours}Std ${minutes}Min ${seconds}Sek`;

        }

    }

    update();

    countdownInterval = setInterval(update,1000);

}

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

/* ==========================================
   TOAST
========================================== */

export function showToast(text){

    const toast = document.getElementById("toast");

    if(!toast) return;

    toast.textContent = text;

    toast.classList.add("show");

    setTimeout(()=>{

        toast.classList.remove("show");

    },3000);

}

/* ==========================================
   HILFSFUNKTIONEN
========================================== */

function formatTime(time){

    if(!time) return "";

    return time.slice(0,5);

}

function sortStreams(list){

    return list.sort((a,b)=>

        a.time.localeCompare(b.time)

    );

}

/* ==========================================
   DEBUG
========================================== */

console.log(
    "%c✅ TrackTime Streamplan V4 geladen",
    "color:#e10600;font-size:14px;font-weight:bold;"
);