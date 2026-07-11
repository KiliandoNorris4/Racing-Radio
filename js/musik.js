
import { supabase } from "./supabase.js";

/* ==========================================
   TRACKTIME V2
   MUSIK.JS
   TEIL 1
========================================== */

document.addEventListener("DOMContentLoaded", () => {

    initializeMusicPage();

});

/* ==========================================
   INITIALISIERUNG
========================================== */

async function initializeMusicPage() {

    setupMusicForm();

    await loadSongs();

    startAutoRefresh();

}

/* ==========================================
   FORMULAR
========================================== */

function setupMusicForm() {

    const form = document.getElementById("songForm");

    if (!form) return;

    form.addEventListener("submit", submitSong);

}

/* ==========================================
   SONG ABSENDEN
========================================== */

async function submitSong(event) {

    console.log("SUBMIT FUNKTION AUSGELÖST");
    
    event.preventDefault();

    const button = event.target.querySelector("button");

    const viewer =
        document.getElementById("viewer").value.trim();

    const song =
        document.getElementById("song").value.trim();

    const artist =
        document.getElementById("artist").value.trim();

    if (!viewer || !song || !artist) {

        showToast(
            "Bitte alle Felder ausfüllen.",
            false
        );

        return;

    }

    try {

        showLoading(button);

        await addSong(
            viewer,
            song,
            artist
        );

        showToast(
            "Song erfolgreich gesendet."
        );

        event.target.reset();

        await loadSongs();

    }

    catch (error) {

        console.error(error);

        showToast(
            error.message,
            false
        );

    }

    finally {

        hideLoading(button);

    }

}

async function addSong(viewer, song, artist) {

    const { data, error } = await supabase
        .from("songs")
        .insert([{
            viewer,
            song,
            artist,
            likes: 0
        }]);

    if (error) {
        throw error;
    }

    return data;
}

/* ==========================================
   AUTO REFRESH
========================================== */

function startAutoRefresh() {

    setInterval(async () => {

        await loadSongs();

    }, 30000);

}

/* ==========================================
   SONGS LADEN
========================================== */

async function loadSongs() {

    try {

        const { data, error } = await supabase
            .from("songs")
            .select("*")
            .order("likes", { ascending: false });

        if (error) throw error;

        const songs = data;

        renderSongs(songs);

        renderTopSongs(songs);

        updateNowPlaying(songs);

    }

    catch (error) {

        console.error(error);

        showToast(
            "Songs konnten nicht geladen werden.",
            false
        );

    }

}

async function getSongs() {
    const { data, error } = await supabase
        .from("songs")
        .select("*")
        .order("likes", { ascending: false });

    if (error) throw error;

    return data;
}

/* ==========================================
   SONGLISTE
========================================== */

function renderSongs(songs) {

    const container =
        document.getElementById("songList");

    if (!container) return;

    container.innerHTML = "";

    if (songs.length === 0) {

        container.innerHTML = `

            <div class="empty-message">

                Noch keine Songs vorhanden.

            </div>

        `;

        return;

    }

    songs.forEach(song => {

        container.innerHTML += `

            <div class="song">

                <div>

                    <h3>${song.song}</h3>

                    <p>${song.artist}</p>

                    <small>

                        von ${song.viewer}

                    </small>

                </div>

                <button
                    class="like-btn"
                    onclick="likeSongClick(${song.id}, ${song.likes})">

                    ❤️ ${song.likes}

                </button>

            </div>

        `;

    });

}

/* ==========================================
   TOP 5
========================================== */

function renderTopSongs(songs) {

    const container =
        document.getElementById("topSongs");

    if (!container) return;

    container.innerHTML = "";

    if (songs.length === 0) {

        container.innerHTML = `

            <div class="empty-message">

                Keine Songs vorhanden.

            </div>

        `;

        return;

    }

    const topFive = songs
        .slice()
        .sort((a, b) => b.likes - a.likes)
        .slice(0, 5);

    topFive.forEach((song, index) => {

        container.innerHTML += `

            <div class="song">

                <div>

                    <h3>

                        #${index + 1}
                        ${song.song}

                    </h3>

                    <p>${song.artist}</p>

                    <small>

                        ❤️ ${song.likes}

                    </small>

                </div>

            </div>

        `;

    });

}

/* ==========================================
   LIKE BUTTON
========================================== */

async function likeSongClick(id, currentLikes) {

    console.log("LIKE GEDRÜCKT", id, currentLikes);
    
    try {

        await likeSong(id, currentLikes);

        await loadSongs();

    }

    catch (error) {

        console.error(error);

        showToast(
            "Like konnte nicht gespeichert werden.",
            false
        );

    }

}

async function likeSong(id, currentLikes) {

    const newLikes = currentLikes + 1;

    const { error } = await supabase
        .from("songs")
        .update({
            likes: newLikes
        })
        .eq("id", id);


    if (error) {
        throw error;
    }

}

/* ==========================================
   NOW PLAYING
========================================== */

function updateNowPlaying(songs) {

    const nowPlaying =
        document.getElementById("nowPlayingText");

    if (!nowPlaying) return;

    if (songs.length === 0) {

        nowPlaying.textContent =
            "Momentan keine Musikwünsche";

        return;

    }

    const topSong = songs
        .slice()
        .sort((a, b) => b.likes - a.likes)[0];

    nowPlaying.textContent =
        `${topSong.song} • ${topSong.artist}`;

}

/* ==========================================
   LIVE UPDATE
========================================== */

let musicRefresh = null;

function startLiveMusic() {

    if (musicRefresh) {

        clearInterval(musicRefresh);

    }

    musicRefresh = setInterval(async () => {

        await loadSongs();

    }, 30000);

}

/* ==========================================
   FILTER
========================================== */

function searchSongs(search) {

    const songs =
        document.querySelectorAll(".song");

    const value =
        search.toLowerCase();

    songs.forEach(song => {

        const text =
            song.innerText.toLowerCase();

        if (text.includes(value)) {

            song.style.display = "";

        }

        else {

            song.style.display = "none";

        }

    });

}

/* ==========================================
   SORTIERUNG
========================================== */

function sortSongsByNewest(songs) {

    return songs.sort((a, b) =>

        new Date(b.created_at) -

        new Date(a.created_at)

    );

}

function sortSongsByLikes(songs) {

    return songs.sort((a, b) =>

        b.likes - a.likes

    );

}

/* ==========================================
   REFRESH BUTTON
========================================== */

async function refreshSongs() {

    try {

        await loadSongs();

        showToast(
            "Songliste aktualisiert."
        );

    }

    catch (error) {

        console.error(error);

    }

}

/* ==========================================
   TRACKTIME V2
   MUSIK.JS
   TEIL 4
========================================== */

/* ==========================================
   SUPABASE REALTIME
========================================== */

function enableRealtimeMusic() {

    supabase
        .channel("songs-channel")

        .on(
            "postgres_changes",
            {
                event: "*",
                schema: "public",
                table: "songs"
            },
            async () => {

                await loadSongs();

            }
        )

        .subscribe();

}

/* ==========================================
   PAGE VISIBILITY
========================================== */

document.addEventListener(
    "visibilitychange",
    async () => {

        if (!document.hidden) {

            await loadSongs();

        }

    }
);

/* ==========================================
   ONLINE / OFFLINE
========================================== */

window.addEventListener(
    "online",
    () => {

        showToast(
            "Verbindung wiederhergestellt."
        );

        loadSongs();

    }
);

window.addEventListener(
    "offline",
    () => {

        showToast(
            "Keine Internetverbindung.",
            false
        );

    }
);

/* ==========================================
   ENTER KEY
========================================== */

document.addEventListener(
    "keydown",
    e => {

        if (
            e.key === "Enter" &&
            document.activeElement.tagName !== "TEXTAREA"
        ) {

            const form =
                document.getElementById("songForm");

            if (form) {

                form.requestSubmit();

            }

        }

    }
);

/* ==========================================
   COPY SONG TITLE
========================================== */

function copySongTitle(title) {

    navigator.clipboard
        .writeText(title)
        .then(() => {

            showToast(
                "Songtitel kopiert."
            );

        });

}

/* ==========================================
   SHARE SONG
========================================== */

async function shareSong(song, artist) {

    if (!navigator.share)
        return;

    try {

        await navigator.share({

            title: song,

            text:
                `${song} - ${artist}`

        });

    }

    catch {

    }

}

/* ==========================================
   PERFORMANCE
========================================== */

let refreshTimeout;

function scheduleRefresh() {

    clearTimeout(refreshTimeout);

    refreshTimeout = setTimeout(

        loadSongs,

        500

    );

}

/* ==========================================
   START
========================================== */

enableRealtimeMusic();

window.likeSongClick = likeSongClick;