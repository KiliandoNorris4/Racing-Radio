/* ==========================================
   TRACKTIME V2
   HOME.JS
========================================== */

document.addEventListener("DOMContentLoaded", () => {

    loadNextStream();

    // Alle 60 Sekunden aktualisieren
    setInterval(loadNextStream, 60000);

});

/* ==========================================
   NÄCHSTEN STREAM LADEN
========================================== */

async function loadNextStream() {

    try {

        const streams = await getStreams();

        const title = document.getElementById("nextStreamTitle");
        const date = document.getElementById("nextStreamDate");
        const time = document.getElementById("nextStreamTime");
        const countdown = document.getElementById("nextStreamCountdown");

        if (!title || !date || !time || !countdown) return;

        const now = new Date();

        // Nur zukünftige Streams
        const upcoming = streams.filter(stream => {

            const streamDate = new Date(`${stream.date}T${stream.time}`);

            return streamDate >= now;

        });

        if (upcoming.length === 0) {

            title.textContent = "Kein Stream geplant";
            date.textContent = "-";
            time.textContent = "-";
            countdown.textContent = "";

            return;

        }

        upcoming.sort((a, b) => {

            return new Date(`${a.date}T${a.time}`) -
                   new Date(`${b.date}T${b.time}`);

        });

        const stream = upcoming[0];

        title.textContent = stream.title;
        date.textContent = formatDate(stream.date);
        time.textContent = formatTime(stream.time);

        updateCountdown(stream);

    }

    catch (error) {

        console.error(error);

        showToast("Fehler beim Laden des Streams", false);

    }

}

/* ==========================================
   COUNTDOWN
========================================== */

function updateCountdown(stream) {

    const countdown = document.getElementById("nextStreamCountdown");

    function tick() {

        if (!countdown) return;

        countdown.textContent =
            getCountdown(stream.date, stream.time);

    }

    tick();

    clearInterval(window.streamCountdown);

    window.streamCountdown = setInterval(tick, 60000);

}