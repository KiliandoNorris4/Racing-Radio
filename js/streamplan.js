import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/* ==========================================
   SUPABASE
========================================== */

const SUPABASE_URL = "https://ugyjydxtsyuawgdrxeug.supabase.co";

const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVneWp5ZHh0c3l1YXdnZHJ4ZXVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE2MjQyMDgsImV4cCI6MjA5NzIwMDIwOH0.9Mt-Iz1T-HNTCCAj65AxGJt9eqHq6Y9VXNZJedCFWR4";

const supabase = createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

/* ==========================================
   VARIABLEN
========================================== */

let streams = [];

let currentWeek = new Date();

let countdownInterval = null;

/* ==========================================
   START
========================================== */

document.addEventListener("DOMContentLoaded", async () => {

    await loadStreams();

    renderCalendar();

    updateCountdown();

    startAutoRefresh();

});

/* ==========================================
   STREAMS LADEN
========================================== */

async function loadStreams() {

    const { data, error } = await supabase

        .from("streams")

        .select("*")

        .order("date")

        .order("time");

    if (error) {

        console.error(error);

        return;

    }

    streams = data ?? [];

}

/* ==========================================
   WOCHENWECHSEL
========================================== */

window.previousWeek = function(direction){

    currentWeek.setDate(

        currentWeek.getDate() + direction * 7

    );

    renderCalendar();

    updateCountdown();

}

/* ==========================================
   MONTAG BERECHNEN
========================================== */

function getMonday(date){

    const monday = new Date(date);

    const day = monday.getDay();

    const diff = day === 0

        ? -6

        : 1 - day;

    monday.setDate(

        monday.getDate() + diff

    );

    monday.setHours(

        0,
        0,
        0,
        0

    );

    return monday;

}

/* ==========================================
   WOCHE
========================================== */

function getWeekDays(){

    const monday = getMonday(currentWeek);

    const days = [];

    for(let i=0;i<7;i++){

        const day = new Date(monday);

        day.setDate(

            monday.getDate()+i

        );

        days.push(day);

    }

    return days;

}

/* ==========================================
   FORMAT
========================================== */

function formatDay(date){

    return date.toLocaleDateString(

        "de-DE",

        {

            day:"2-digit",

            month:"2-digit"

        }

    );

}

function formatDateId(date){

    return date

        .toISOString()

        .split("T")[0];

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

    const yearStart = new Date(

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

/* ==========================================
   HEUTE?
========================================== */

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

function renderCalendar(){

    const calendar =
        document.getElementById("calendar");

    if(!calendar) return;

    const days = getWeekDays();

    document.getElementById("weekText").textContent =
        `Kalenderwoche ${getWeekNumber(days[0])}`;

    const nextStream = getNextStream();

    let html = "";

    /* =====================
       DATUM
    ===================== */

    html += `
        <tr>
            <td class="row-title">
                Datum
            </td>
    `;

    days.forEach(day=>{

        html += `

            <td class="${
                isToday(day)
                ? "today"
                : ""
            }">

                <strong>

                    ${formatDay(day)}

                </strong>

            </td>

        `;

    });

    html += "</tr>";

    /* =====================
       STREAMS
    ===================== */

    html += `
        <tr>

            <td class="row-title">

                Streams

            </td>
    `;

    days.forEach(day=>{

        const id = formatDateId(day);

        const dayStreams = streams

            .filter(stream=>stream.date===id)

            .sort(

                (a,b)=>

                a.time.localeCompare(b.time)

            );

        let cell="";

        if(dayStreams.length===0){

            cell=`

                <div class="no-stream">

                    Kein Stream geplant

                </div>

            `;

        }

        else{

            dayStreams.forEach(stream=>{

                cell += createStreamCard(

                    stream,

                    nextStream

                );

            });

        }

        html += `

            <td class="${
                isToday(day)
                ? "today"
                : ""
            }">

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

function createStreamCard(

    stream,

    nextStream

){

    let classes="stream-entry";

    if(

        nextStream

        &&

        nextStream.id===stream.id

    ){

        classes +=

            " next-stream";

    }

    if(

        streamIsLive(stream)

    ){

        classes +=

            " live";

    }

    return `

        <div class="${classes}">

            <div class="stream-time">

                ${stream.time.slice(0,5)}

            </div>

            <div class="stream-title">

                ${stream.title}

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

    if(upcoming.length===0)

        return null;

    upcoming.sort(

        (a,b)=>

        new Date(`${a.date}T${a.time}`)

        -

        new Date(`${b.date}T${b.time}`)

    );

    return upcoming[0];

}

/* ==========================================
   LIVE STATUS
========================================== */

function streamIsLive(stream){

    const start = new Date(
        `${stream.date}T${stream.time}`
    );

    const end = new Date(start);

    end.setHours(
        end.getHours() + 3
    );

    const now = new Date();

    return now >= start && now <= end;

}

/* ==========================================
   COUNTDOWN
========================================== */

function updateCountdown(){

    const element =
        document.getElementById("countdown");

    if(!element) return;

    if(countdownInterval){

        clearInterval(countdownInterval);

    }

    function tick(){

        const stream = getNextStream();

        if(!stream){

            element.textContent =
                "Momentan ist kein Stream geplant.";

            return;

        }

        const target = new Date(
            `${stream.date}T${stream.time}`
        );

        const now = new Date();

        const diff = target - now;

        if(diff <= 0){

            if(streamIsLive(stream)){

                element.textContent =
                    `🔴 LIVE: ${stream.title}`;

            }else{

                element.textContent =
                    "Der Stream ist beendet.";

            }

            return;

        }

        const days = Math.floor(diff / 86400000);

        const hours = Math.floor(
            (diff % 86400000) / 3600000
        );

        const minutes = Math.floor(
            (diff % 3600000) / 60000
        );

        element.textContent =
            `Nächster Stream: ${stream.title} in ${days} Tage ${hours} Std ${minutes} Min`;

    }

    tick();

    countdownInterval =
        setInterval(tick,60000);

}

/* ==========================================
   AUTOMATISCHE AKTUALISIERUNG
========================================== */

function startAutoRefresh(){

    setInterval(async()=>{

        await loadStreams();

        renderCalendar();

        updateCountdown();

    },60000);

}

/* ==========================================
   ADMIN (Platzhalter)
========================================== */

window.login = function(){

    alert("Adminbereich folgt.");

}

window.addStream = function(){

    alert("Stream hinzufügen folgt.");

}

window.closeAdmin = function(){

    document
        .getElementById("admin")
        ?.classList.add("hidden");

}

/* ==========================================
   FEHLERBEHANDLUNG
========================================== */

window.addEventListener("error",e=>{

    console.error(
        "TrackTime Fehler:",
        e.error
    );

});

console.log(
    "✅ TrackTime Streamplan geladen."
);