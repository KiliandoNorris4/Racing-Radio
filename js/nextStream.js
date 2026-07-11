import { getStreams } from "./supabase.js";

let nextStream = null;

document.addEventListener("DOMContentLoaded", init);

async function init() {

    await loadNextStream();

    await checkTwitch();

    setInterval(checkTwitch, 30000);

}

async function loadNextStream() {

    const streams = await getStreams();

    nextStream = getNextStream(streams);

    if (!nextStream) {

        document.getElementById("nextStreamTitle").textContent =
            "Momentan kein Stream geplant";

        return;

    }

    document.getElementById("nextStreamTitle").textContent =
        nextStream.title;

    document.getElementById("nextStreamDescription").textContent =
        nextStream.description || "";

    document.getElementById("nextStreamDate").textContent =
        "📅 " + formatDate(nextStream.date);

    document.getElementById("nextStreamTime").textContent =
        "🕒 " + nextStream.time;

    updateCountdown();

    setInterval(updateCountdown,1000);

}

/* ==========================================
   TWITCH STATUS
========================================== */

async function checkTwitch() {

    try {

        const response = await fetch("/api/twitch");

        if (!response.ok) return;

        const data = await response.json();

        const liveStatus = document.getElementById("liveStatus");

if (!data.live) {

    if (liveStatus) {

        liveStatus.className = "status offline";

        liveStatus.textContent = "⚫ Aktuell Offline";

    }

    return;

}

if (liveStatus) {

    liveStatus.className = "status live";

    liveStatus.textContent =
        `🔴 LIVE • ${data.title} • ${data.viewers} Zuschauer`;

}

        document.getElementById("nextLiveStatus").textContent =
            "🔴 JETZT LIVE";

        document.getElementById("nextStreamTitle").textContent =
            data.title;

        document.getElementById("nextStreamDescription").textContent =
            `🎮 ${data.game}`;

        document.getElementById("nextStreamDate").textContent =
            `👥 ${data.viewers} Zuschauer`;

        document.getElementById("nextStreamTime").textContent =
            "";

        const started = new Date(data.started_at);

        function updateLiveTime() {

            const now = new Date();

            const diff = now - started;

            const hours = Math.floor(diff / 3600000);

            const minutes = Math.floor((diff % 3600000) / 60000);

            document.getElementById("nextStreamCountdown").textContent =
                `🔴 LIVE seit ${hours} Std ${minutes} Min`;

        }

        updateLiveTime();

        setInterval(updateLiveTime, 60000);

    } catch (error) {

        console.error("Twitch API:", error);

    }

}

/* ==========================================
   COUNTDOWN
========================================== */

function updateCountdown() {

    if (!nextStream) return;

    const status =
        document.getElementById("nextLiveStatus");

    const countdown =
        document.getElementById("nextStreamCountdown");

    const now = new Date();

    const target =
        new Date(`${nextStream.date}T${nextStream.time}`);

    if (now >= target) {

        status.textContent = "🔴 STREAM SOLLTE LIVE SEIN";

        countdown.textContent = "Prüfe Twitch...";

        return;

    }

    const diff = target - now;

    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);

    countdown.textContent =
        `${days}T ${hours}Std ${minutes}Min ${seconds}Sek`;

}

/* ==========================================
   HILFSFUNKTIONEN
========================================== */

function getNextStream(streams) {

    const now = new Date();

    const upcoming = streams
        .filter(stream => new Date(`${stream.date}T${stream.time}`) >= now)
        .sort((a, b) =>
            new Date(`${a.date}T${a.time}`) -
            new Date(`${b.date}T${b.time}`)
        );

    return upcoming.length ? upcoming[0] : null;

}

function formatDate(dateString) {

    return new Date(dateString).toLocaleDateString("de-DE", {

        weekday: "long",
        day: "2-digit",
        month: "long"

    });

}