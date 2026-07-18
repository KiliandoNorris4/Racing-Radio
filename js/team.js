/* ==========================================
   TRACKTIME V2
   TEAM LIVE STATUS
========================================== */

async function updateTeamStatus() {

    try {

        const response = await fetch("/api/twitch");

        if (!response.ok) {

            throw new Error("Twitch API konnte nicht geladen werden.");

        }

        const members = await response.json();

        Object.values(members).forEach(member => {

            updateMemberCard(member);

        });

    }

    catch (error) {

        console.error(error);

    }

}

/* ==========================================
   MITGLIED AKTUALISIEREN
========================================== */

function updateMemberCard(member) {

    const card = document.querySelector(

        `[data-twitch="${member.login}"]`

    );

    if (!card) return;

    const dot = card.querySelector(".live-dot");

    const image = card.querySelector(".member-image");

    const followers = card.querySelector(".member-followers");

    const viewers = card.querySelector(".member-viewers");

    const game = card.querySelector(".member-game");

    const title = card.querySelector(".member-title");

    const status = card.querySelector(".member-status");

    /* -----------------------
       Bild wechseln
    ----------------------- */

    image.src =
    member.thumbnail ||
    member.profile_image;

    /* -----------------------
       Live Punkt
    ----------------------- */

    if (member.live) {

        dot.classList.remove("offline");

        dot.classList.add("online");

        status.textContent = "LIVE";

    }

    else {

        dot.classList.remove("online");

        dot.classList.add("offline");

        status.textContent = "Offline";

    }

    /* -----------------------
       Infos
    ----------------------- */

    if(followers){
    followers.textContent =
        `👥 ${member.followers} Follower`;
}

    if(viewers){
        viewers.textContent =
        member.live
            ? `👀 ${member.viewers} Zuschauer`
            : "";
    }
    
if(game){
    game.textContent =
        member.live
            ? `🎮 ${member.game}`
            : "";
}
    if(title){
title.textContent =
        member.live
            ? member.title
            : "";
    }
}

/* ==========================================
   START
========================================== */

updateTeamStatus();

setInterval(

    updateTeamStatus,

    30000

);