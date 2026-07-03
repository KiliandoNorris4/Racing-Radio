import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://ugyjydxtsyuawgdrxeug.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVneWp5ZHh0c3l1YXdnZHJ4ZXVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE2MjQyMDgsImV4cCI6MjA5NzIwMDIwOH0.9Mt-Iz1T-HNTCCAj65AxGJt9eqHq6Y9VXNZJedCFWR4";

const supabaseClient = createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

/* ==========================================
   TRACKTIME V2
   STREAMPLAN.JS
   TEIL 1
========================================== */

let currentWeek = new Date();

let streams = [];

/* ==========================================
   START
========================================== */

document.addEventListener("DOMContentLoaded", async () => {

    await initializeStreamplan();

});

/* ==========================================
   INITIALISIERUNG
========================================== */

async function initializeStreamplan() {

    await loadWeek();

    setupButtons();

}

/* ==========================================
   BUTTONS
========================================== */

function setupButtons() {

    const prev =
        document.getElementById("prevWeek");

    const next =
        document.getElementById("nextWeek");

    if (prev) {

        prev.addEventListener("click", previousWeek);

    }

    if (next) {

        next.addEventListener("click", nextWeek);

    }

}

/* ==========================================
   WOCHE LADEN
========================================== */

async function loadWeek() {

    streams = await getStreams();
    console.log("STREAMS AUS SUPABASE:", streams);
    renderCalendar();

}

async function getStreams() {
    const { data, error } = await supabaseClient
        .from("streams")
        .select("*")
    if (error) throw error;

    return data;
}
/* ==========================================
   WOCHE ZURÜCK
========================================== */

function previousWeek() {

    currentWeek.setDate(

        currentWeek.getDate() - 7

    );

    renderCalendar();

}

/* ==========================================
   WOCHE VOR
========================================== */

function nextWeek() {

    currentWeek.setDate(

        currentWeek.getDate() + 7

    );

    renderCalendar();

}

/* ==========================================
   WOCHENBEGINN
========================================== */

function getMonday(date) {

    const monday = new Date(date);

    const day = monday.getDay();

    const diff =

        day === 0

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
   TAGE DER WOCHE
========================================== */

function getWeekDays() {

    const monday =

        getMonday(currentWeek);

    const days = [];

    for (

        let i = 0;

        i < 7;

        i++

    ) {

        const day =

            new Date(monday);

        day.setDate(

            monday.getDate() + i

        );

        days.push(day);

    }

    return days;

}

/* ==========================================
   TRACKTIME V2
   STREAMPLAN.JS
   TEIL 2
========================================== */

/* ==========================================
   KALENDER ZEICHNEN
========================================== */

function renderCalendar() {

    const calendar = document.getElementById("calendar");

    if (!calendar) return;

    calendar.innerHTML = "";

    const days = getWeekDays();

    days.forEach(day => {

        calendar.appendChild(createDayCard(day));

    });

}

/* ==========================================
   TAGESKARTE
========================================== */

function createDayCard(day) {
    const card = document.createElement("div");
    card.className = "calendar-day";

    const id = formatDateId(day);

    card.innerHTML = `
        <div class="calendar-header">
            <span>${formatDay(day)}</span>
        </div>

        <div class="calendar-streams" id="day-${id}"></div>
    `;

    setTimeout(() => {
        renderStreamsForDay(id);
    }, 0);

    return card;
}

/* ==========================================
   STREAMS EINES TAGES
========================================== */

function renderStreamsForDay(dayId) {

    const container = document.getElementById(

        `day-${dayId}`

    );

    if (!container) return;

    container.innerHTML = "";

    const dayStreams = streams.filter(stream => {

        return stream.date === dayId;

    });

    if (dayStreams.length === 0) {

        container.innerHTML =

        `

        <div class="no-stream">

            Kein Stream geplant

        </div>

        `;

        return;

    }



   

    dayStreams
        .sort((a,b) =>

            a.time.localeCompare(
                b.time
            )

        )
        .forEach(stream => {

            container.innerHTML +=

                createStreamCard(
                    stream
                );

        });

}


/* ==========================================
   HEUTE?
========================================== */

function isToday(day) {

    const today = new Date();

    return (

        today.getFullYear() === day.getFullYear()

        &&

        today.getMonth() === day.getMonth()

        &&

        today.getDate() === day.getDate()

    );

}

/* ==========================================
   WOCHENTAG
========================================== */

function getWeekday(day) {

    return day.toLocaleDateString(

        "de-DE",

        {

            weekday:"long"

        }

    );

}

/* ==========================================
   DATUM
========================================== */

function formatDay(day) {

    return day.toLocaleDateString(

        "de-DE",

        {

            day:"2-digit",

            month:"2-digit"

        }

    );

}

/* ==========================================
   YYYY-MM-DD
========================================== */

function formatDateId(day) {

    return day.toISOString()

        .split("T")[0];

}

/* ==========================================
   TRACKTIME V2
   STREAMPLAN.JS
   TEIL 3
========================================== */

/* ==========================================
   FORMULAR INITIALISIEREN
========================================== */

function setupStreamForm() {

    const form =
        document.getElementById("streamForm");

    if (!form) return;

    form.addEventListener(
        "submit",
        submitStream
    );

}

/* ==========================================
   STREAM SPEICHERN
========================================== */

async function submitStream(event) {

    event.preventDefault();

    const button =
        event.target.querySelector("button");

    const title =
        document.getElementById("streamTitle")
        ?.value
        .trim();

    const date =
        document.getElementById("streamDate")
        ?.value;

    const time =
        document.getElementById("streamTime")
        ?.value;

    const description =
        document.getElementById("streamDescription")
        ?.value
        .trim() || "";

    const game =
        document.getElementById("streamGame")
        ?.value || "";

    if (!title || !date || !time) {

        showToast(
            "Bitte alle Pflichtfelder ausfüllen.",
            false
        );

        return;
    }

    try {

        showLoading(button);

        await addStream(

            title,

            date,

            time,

            description

        );

        showToast(
            "Stream gespeichert."
        );

        event.target.reset();

        await loadWeek();

    }

    catch (error) {

        console.error(error);

        showToast(
            "Stream konnte nicht gespeichert werden.",
            false
        );

    }

    finally {

        hideLoading(button);

    }

}


/* ==========================================
   STREAM DETAILS
========================================== */

function createStreamCard(stream) {

    return `

    <div class="stream-item">

        <div class="stream-info">

            <div class="stream-time">

                ${stream.time.slice(0,5)}

            </div>

            <div class="stream-title">

                ${stream.title}

            </div>

        </div>

        <div class="stream-actions">

            

        </div>

    </div>

    `;

}

/* ==========================================
   STREAMS IM KALENDER
========================================== */



/* ==========================================
   ADMIN SICHTBAR?
========================================== */

function isAdminMode() {

    const admin =
        document.body.dataset.admin;

    return admin === "true";

}

/* ==========================================
   ADMIN BUTTONS
========================================== */

function createAdminButtons(stream) {

    if (!isAdminMode())
        return "";

    return `

    
    `;

}

/* ==========================================
   TRACKTIME V2
   STREAMPLAN.JS
   TEIL 4
========================================== */

/* ==========================================
   NÄCHSTEN STREAM FINDEN
========================================== */

function getNextStream() {

    const now = new Date();

    const upcoming = streams.filter(stream => {

        const streamDate = new Date(
            `${stream.date}T${stream.time}`
        );

        return streamDate >= now;

    });

    if (upcoming.length === 0)
        return null;

    upcoming.sort((a, b) => {

        return new Date(`${a.date}T${a.time}`)

            -

            new Date(`${b.date}T${b.time}`);

    });

    return upcoming[0];

}

/* ==========================================
   HOMEPAGE AKTUALISIEREN
========================================== */

function updateHomepage() {

    const stream = getNextStream();

    const title =
        document.getElementById("nextStreamTitle");

    const date =
        document.getElementById("nextStreamDate");

    const time =
        document.getElementById("nextStreamTime");

    const countdown =
        document.getElementById("nextStreamCountdown");

    if (
        !title ||
        !date ||
        !time ||
        !countdown
    ) return;

    if (!stream) {

        title.textContent =
            "Kein Stream geplant";

        date.textContent = "-";

        time.textContent = "-";

        countdown.textContent = "";

        return;

    }

    title.textContent =
        stream.title;

    date.textContent =
        formatDate(stream.date);

    time.textContent =
        stream.time.slice(0, 5);

    updateCountdown(stream);

}

/* ==========================================
   COUNTDOWN
========================================== */

let countdownInterval = null;

function updateCountdown(stream) {

    const element =
        document.getElementById(
            "nextStreamCountdown"
        );

    if (!element)
        return;

    if (countdownInterval) {

        clearInterval(
            countdownInterval
        );

    }

    function tick() {

        const target = new Date(
            `${stream.date}T${stream.time}`
        );

        const now = new Date();

        const diff =
            target - now;

        if (diff <= 0) {

            element.textContent =
                "🔴 LIVE";

            return;

        }

        const days =
            Math.floor(
                diff / 86400000
            );

        const hours =
            Math.floor(
                (diff % 86400000)
                / 3600000
            );

        const minutes =
            Math.floor(
                (diff % 3600000)
                / 60000
            );

        element.textContent =
            `${days} Tage ${hours} Std ${minutes} Min`;

    }

    tick();

    countdownInterval =
        setInterval(
            tick,
            60000
        );

}

/* ==========================================
   LIVE AKTUALISIERUNG
========================================== */

function startStreamRefresh() {

    setInterval(async () => {

        await loadWeek();

        updateHomepage();

    }, 60000);

}

/* ==========================================
   STREAM STATUS
========================================== */

function streamIsLive(stream) {

    const start =
        new Date(
            `${stream.date}T${stream.time}`
        );

    const end =
        new Date(start);

    end.setHours(
        end.getHours() + 3
    );

    const now =
        new Date();

    return now >= start && now <= end;

}

/* ==========================================
   INITIALISIERUNG
========================================== */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        startStreamRefresh();

    }
);

function showLoading(button) {

    if (!button) return;

    button.dataset.originalText = button.innerHTML;

    button.disabled = true;

    button.innerHTML = `
        <span class="spinner"></span>
        Speichern...
    `;

}

function hideLoading(button) {

    if (!button) return;

    button.disabled = false;

    button.innerHTML = button.dataset.originalText || "Speichern";

}

async function testSupabase() {
    const { data, error } = await supabaseClient
        .from("streams")
        .select("*");

    console.log("DATA:", data);
    console.log("ERROR:", error);
}

testSupabase();