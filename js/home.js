/* ==========================================
   TRACKTIME V2
   HOME.JS
========================================== */
document.addEventListener("DOMContentLoaded", () => {

    loadNextStream();

    // Alle 60 Sekunden aktualisieren
    setInterval(loadNextStream, 60000);

});

import { supabase } from "js/supabase.js";

export async function getStreams() {
    const { data, error } = await supabase
        .from("streams")
        .select("*");

    if (error) {
        console.error(error);
        return [];
    }

    return data;
}

import { getStreams } from "./streams.js";

let countdownInterval;

document.addEventListener("DOMContentLoaded", () => {
    loadNextStream();

    // Auto refresh (alle 60s)
    setInterval(loadNextStream, 60000);

    // 🔥 REALTIME UPDATE
    subscribeToStreamChanges();
});

async function loadNextStream() {

    const streams = await getStreams();

    const now = new Date();

    const enriched = streams.map(s => {
        const start = new Date(`${s.date}T${s.time}`);
        const end = new Date(start.getTime() + (s.duration || 60) * 60000);

        return {
            ...s,
            start,
            end,
            status:
                now >= start && now <= end
                    ? "LIVE"
                    : now < start
                    ? "UPCOMING"
                    : "ENDED"
        };
    });

    const upcoming = enriched
        .filter(s => s.status !== "ENDED")
        .sort((a, b) => a.start - b.start);

    const stream = upcoming[0];

    if (!stream) return showEmpty();

    renderStream(stream);
}

function renderStream(stream) {

    const title = document.getElementById("nextStreamTitle");
    const date = document.getElementById("nextStreamDate");
    const time = document.getElementById("nextStreamTime");
    const countdown = document.getElementById("nextStreamCountdown");

    title.textContent = stream.title;

    date.textContent = stream.start.toLocaleDateString("de-DE");
    time.textContent = stream.start.toLocaleTimeString("de-DE", {
        hour: "2-digit",
        minute: "2-digit"
    });

    startCountdown(stream, countdown);
}

function startCountdown(stream, el) {

    clearInterval(countdownInterval);

    function update() {

        const now = new Date();
        const diff = stream.start - now;

        if (diff <= 0) {
            el.textContent = "🔴 LIVE";
            return;
        }

        const d = Math.floor(diff / (1000 * 60 * 60 * 24));
        const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const m = Math.floor((diff / (1000 * 60)) % 60);
        const s = Math.floor((diff / 1000) % 60);

        el.textContent = `${d}d ${h}h ${m}m ${s}s`;
    }

    update();
    countdownInterval = setInterval(update, 1000);
}

function getStatusBadge(stream) {

    const now = new Date();

    if (now >= stream.start && now <= stream.end) {
        return "LIVE 🔴";
    }

    if (now < stream.start) {
        return "UPCOMING 🟡";
    }

    return "ENDED ⚫";
}

import { supabase } from "./supabase.js";

function subscribeToStreamChanges() {

    supabase
        .channel("streams-channel")
        .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "streams" },
            () => {
                loadNextStream(); // 🔥 sofort refresh
            }
        )
        .subscribe();
}

document.addEventListener("DOMContentLoaded", () => {
    loadNextStream();
    setInterval(loadNextStream, 60000);
});

async function getStreams() {
    const { data, error } = await supabase
        .from("streams")
        .select("*");

    if (error) {
        console.error("Supabase Fehler:", error);
        return [];
    }

    return data;
}

async function loadNextStream() {

    try {

        const streams = await getStreams();

        const title = document.getElementById("nextStreamTitle");
        const date = document.getElementById("nextStreamDate");
        const time = document.getElementById("nextStreamTime");
        const countdown = document.getElementById("nextStreamCountdown");

        if (!title || !date || !time || !countdown) return;

        const now = new Date();

        const upcoming = streams.filter(stream => {
            return new Date(`${stream.date}T${stream.time}`) >= now;
        });

        if (upcoming.length === 0) {
            title.textContent = "Kein Stream geplant";
            date.textContent = "-";
            time.textContent = "-";
            countdown.textContent = "";
            return;
        }

        upcoming.sort((a, b) =>
            new Date(`${a.date}T${a.time}`) -
            new Date(`${b.date}T${b.time}`)
        );

        const stream = upcoming[0];

        title.textContent = stream.title;
        date.textContent = formatDate(stream.date);
        time.textContent = formatTime(stream.time);

        startCountdown(stream);

    } catch (error) {
        console.error(error);
        showToast("Fehler beim Laden des Streams", false);
    }
}

function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString("de-DE", {
        weekday: "short",
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
    });
}

function formatTime(timeStr) {
    return timeStr.slice(0, 5);
}

let countdownInterval;

function startCountdown(stream) {

    const countdown = document.getElementById("nextStreamCountdown");
    if (!countdown) return;

    function update() {

        const now = new Date();
        const target = new Date(`${stream.date}T${stream.time}`);

        const diff = target - now;

        if (diff <= 0) {
            countdown.textContent = "LIVE!";
            return;
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / (1000 * 60)) % 60);
        const seconds = Math.floor((diff / 1000) % 60);

        countdown.textContent =
            `${days}d ${hours}h ${minutes}m ${seconds}s`;
    }

    clearInterval(countdownInterval);
    update();
    countdownInterval = setInterval(update, 1000);
}

function showToast(message) {
    alert(message);
}