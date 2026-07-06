import {
    getStreams,
    addStream,
    deleteStream
} from "./supabase.js";

/* ==========================================
   ADMIN STATUS
========================================== */

let adminMode = false;

const ADMIN_PASSWORD = "tracktimeadmin";

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

    const closeBtn =
        document.getElementById("closeAdmin");

    const saveBtn =
        document.getElementById("saveStream");

    if (closeBtn) {

        closeBtn.addEventListener(
            "click",
            closeAdmin
        );

    }

    if (saveBtn) {

        saveBtn.addEventListener(
            "click",
            saveNewStream
        );

    }

    document.addEventListener(
        "keydown",
        openAdminShortcut
    );

}

/* ==========================================
   ADMIN ÖFFNEN
========================================== */

function openAdminShortcut(event) {

    if (
        event.ctrlKey &&
        event.shiftKey &&
        event.key === "A"
    ) {

        const password = prompt(
            "Admin Passwort:"
        );

        if (
            password ===
            ADMIN_PASSWORD
        ) {

            adminMode = true;

            openAdmin();

        } else {

            showToast(
                "Falsches Passwort"
            );

        }

    }

}

function openAdmin() {

    document
        .getElementById("adminModal")
        ?.classList.remove(
            "hidden"
        );

    loadAdminList();

}

function closeAdmin() {

    document
        .getElementById("adminModal")
        ?.classList.add(
            "hidden"
        );

}

/* ==========================================
   STREAM SPEICHERN
========================================== */

async function saveNewStream() {

    const title =
        document.getElementById(
            "streamTitle"
        ).value.trim();

    const date =
        document.getElementById(
            "streamDate"
        ).value;

    const time =
        document.getElementById(
            "streamTime"
        ).value;

    if (
        !title ||
        !date ||
        !time
    ) {

        showToast(
            "Bitte alle Felder ausfüllen"
        );

        return;

    }

    try {

        await addStream({

            title,
            date,
            time,
            description: ""

        });

        showToast(
            "Stream gespeichert"
        );

        clearForm();

        await loadAdminList();

        window.dispatchEvent(
            new Event(
                "streamsUpdated"
            )
        );

    } catch (error) {

        console.error(error);

        showToast(
            "Fehler beim Speichern"
        );

    }

}

/* ==========================================
   LISTE LADEN
========================================== */

async function loadAdminList() {

    const container =
        document.getElementById(
            "streamList"
        );

    if (!container)
        return;

    const streams =
        await getStreams();

    container.innerHTML = "";

    streams.forEach(stream => {

        const item =
            document.createElement(
                "div"
            );

        item.className =
            "admin-stream";

        item.innerHTML = `

            <div>

                <strong>
                    ${stream.title}
                </strong>

                <br>

                ${stream.date}
                -
                ${stream.time}

            </div>

            <button
                data-id="${stream.id}"
                class="delete-btn">

                Löschen

            </button>

        `;

        container.appendChild(
            item
        );

    });

    document
        .querySelectorAll(
            ".delete-btn"
        )
        .forEach(btn => {

            btn.addEventListener(
                "click",
                deleteHandler
            );

        });

}

/* ==========================================
   LÖSCHEN
========================================== */

async function deleteHandler(event) {

    const id =
        Number(
            event.target.dataset.id
        );

    const confirmed =
        confirm(
            "Stream löschen?"
        );

    if (!confirmed)
        return;

    try {

        await deleteStream(id);

        showToast(
            "Stream gelöscht"
        );

        await loadAdminList();

        window.dispatchEvent(
            new Event(
                "streamsUpdated"
            )
        );

    } catch (error) {

        console.error(error);

        showToast(
            "Löschen fehlgeschlagen"
        );

    }

}

/* ==========================================
   FORM LEEREN
========================================== */

function clearForm() {

    document.getElementById(
        "streamTitle"
    ).value = "";

    document.getElementById(
        "streamDate"
    ).value = "";

    document.getElementById(
        "streamTime"
    ).value = "";

}

/* ==========================================
   TOAST
========================================== */

function showToast(text) {

    const toast =
        document.getElementById(
            "toast"
        );

    if (!toast)
        return;

    toast.textContent =
        text;

    toast.classList.add(
        "show"
    );

    setTimeout(() => {

        toast.classList.remove(
            "show"
        );

    }, 3000);

}