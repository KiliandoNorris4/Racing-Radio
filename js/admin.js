import {
    getStreams,
    addStream,
    updateStream,
    deleteStream
} from "./supabase.js";

/* ==========================================
   TRACKTIME ADMIN V2
========================================== */

const ADMIN_PASSWORD = "5Tyavs8c1b5d";

let editingId = null;

let allStreams = [];

/* ==========================================
   START
========================================== */

document.addEventListener("DOMContentLoaded", () => {

    setupAdmin();

});

/* ==========================================
   SETUP
========================================== */

function setupAdmin() {

    document
        .getElementById("saveStream")
        .addEventListener(
            "click",
            saveStream
        );

    document
        .getElementById("closeAdmin")
        .addEventListener(
            "click",
            closeAdmin
        );

    document
        .getElementById("searchStream")
        .addEventListener(
            "input",
            filterStreams
        );

    document.addEventListener(
        "keydown",
        adminShortcut
    );

}

/* ==========================================
   ADMIN ÖFFNEN
========================================== */

function adminShortcut(event){

    if(

        event.ctrlKey &&

        event.shiftKey &&

        event.key.toLowerCase()==="a"

    ){

        const password = prompt(

            "Admin Passwort"

        );

        if(password===ADMIN_PASSWORD){

            openAdmin();

        }else{

            showToast(

                "❌ Falsches Passwort"

            );

        }

    }

}

async function openAdmin(){

    document

        .getElementById("adminModal")

        .classList.remove("hidden");

    await refreshList();

}

function closeAdmin(){

    editingId = null;

    clearForm();

    document

        .getElementById("adminModal")

        .classList.add("hidden");
}

/* ==========================================
   STREAM SPEICHERN
========================================== */

async function saveStream() {

    const title =
        document.getElementById("streamTitle").value.trim();

    const description =
        document.getElementById("streamDescription").value.trim();

    const date =
        document.getElementById("streamDate").value;

    const time =
    document.getElementById("streamTime").value || null;

if (!title || !date) {

    showToast("⚠ Bitte Titel und Datum ausfüllen.");

    return;

}

   const stream = {

    title,
    description,
    date,
    time: time || null

};

    try {

        if (editingId === null) {

            await addStream(stream);

            showToast("✅ Stream hinzugefügt");

        } else {

            await updateStream(editingId, stream);

            showToast("💾 Stream gespeichert");

        }

        editingId = null;

        clearForm();

        await refreshList();

        window.dispatchEvent(
            new Event("streamsUpdated")
        );

    } catch (error) {

        console.error(error);

        showToast("❌ Fehler beim Speichern");

    }

}

/* ==========================================
   LISTE AKTUALISIEREN
========================================== */

async function refreshList() {

    allStreams = await getStreams();

    renderStreamList(allStreams);

}

/* ==========================================
   FORMULAR FÜLLEN
========================================== */

function editStream(id) {

    const stream = allStreams.find(s => s.id === id);

    if (!stream) return;

    editingId = id;

    document.getElementById("streamTitle").value =
        stream.title;

    document.getElementById("streamDescription").value =
        stream.description || "";

    document.getElementById("streamDate").value =
        stream.date;

    document.getElementById("streamTime").value =
        stream.time;

    document.getElementById("saveStream").textContent =
        "💾 Änderungen speichern";

}

/* ==========================================
   FORMULAR LEEREN
========================================== */

function clearForm() {

    document.getElementById("streamTitle").value = "";

    document.getElementById("streamDescription").value = "";

    document.getElementById("streamDate").value = "";

    document.getElementById("streamTime").value = "";

    document.getElementById("saveStream").textContent =
        "💾 Stream speichern";

}

/* ==========================================
   STREAMLISTE
========================================== */

function renderStreamList(list) {

    const container =
        document.getElementById("streamList");

    container.innerHTML = "";

    if (list.length === 0) {

        container.innerHTML = `
            <p>Keine Streams gefunden.</p>
        `;

        return;

    }

    list.forEach(stream => {

        const card = document.createElement("div");

        card.className = "admin-stream";

        card.innerHTML = `

            <div class="admin-info">

                <strong>${stream.title}</strong><br>

                ${stream.description || ""}<br>

                📅 ${stream.date}
                |
                🕒 ${stream.time ? stream.time : "Streamstart ungeplant"}

            </div>

            <div class="admin-buttons">

                <button
                    class="edit-btn"
                    data-id="${stream.id}">

                    ✏️

                </button>

                <button
                    class="delete-btn"
                    data-id="${stream.id}">

                    🗑️

                </button>

            </div>

        `;

        container.appendChild(card);

    });

    document
        .querySelectorAll(".edit-btn")
        .forEach(button => {

            button.addEventListener("click", () => {

                editStream(
                    Number(button.dataset.id)
                );

            });

        });

    document
        .querySelectorAll(".delete-btn")
        .forEach(button => {

            button.addEventListener("click", async () => {

                const id =
                    Number(button.dataset.id);

                if (!confirm("Stream wirklich löschen?")) {

                    return;

                }

                try {

                    await deleteStream(id);

                    showToast("🗑️ Stream gelöscht");

                    await refreshList();

                    window.dispatchEvent(
                        new Event("streamsUpdated")
                    );

                } catch (error) {

                    console.error(error);

                    showToast("❌ Löschen fehlgeschlagen");

                }

            });

        });

}

/* ==========================================
   SUCHE
========================================== */

function filterStreams(event) {

    const text =
        event.target.value.toLowerCase();

    const filtered = allStreams.filter(stream => {

        return (

            stream.title
                .toLowerCase()
                .includes(text)

            ||

            (stream.description || "")
                .toLowerCase()
                .includes(text)

        );

    });

    renderStreamList(filtered);

}

/* ==========================================
   TOAST
========================================== */

function showToast(text) {

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
   DEBUG
========================================== */

console.log(
    "%cTrackTime Admin V2 geladen",
    "color:#e10600;font-size:14px;font-weight:bold;"
);