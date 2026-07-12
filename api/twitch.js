/* ==========================================
   TRACKTIME TWITCH API
========================================== */

const CLIENT_ID = process.env.TWITCH_CLIENT_ID;
const CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET;

/* ==========================================
   TEAMMITGLIEDER
========================================== */

const MEMBERS = [

    "kiliando_norris4",

    // Weitere Fahrer hier hinzufügen
    // "fahrer2",
    // "fahrer3",

];

/* ==========================================
   TOKEN
========================================== */

async function getAccessToken() {

    const response = await fetch(

        "https://id.twitch.tv/oauth2/token",

        {

            method: "POST",

            headers: {

                "Content-Type":
                    "application/x-www-form-urlencoded"

            },

            body:

                `client_id=${CLIENT_ID}` +

                `&client_secret=${CLIENT_SECRET}` +

                `&grant_type=client_credentials`

        }

    );

    if (!response.ok) {

        throw new Error(
            "Twitch Token konnte nicht geladen werden."
        );

    }

    const data = await response.json();

    return data.access_token;

}

/* ==========================================
   HELIX REQUEST
========================================== */

async function twitchRequest(endpoint, token) {

    const response = await fetch(

        `https://api.twitch.tv/helix/${endpoint}`,

        {

            headers: {

                "Client-ID": CLIENT_ID,

                "Authorization":
                    `Bearer ${token}`

            }

        }

    );

    if (!response.ok) {

        throw new Error(

            "Twitch API Fehler"

        );

    }

    return response.json();

}

/* ==========================================
   API
========================================== */

export default async function handler(req, res) {

    try {

        const token = await getAccessToken();

        const userQuery = MEMBERS
            .map(user => `login=${user}`)
            .join("&");

        const users = await twitchRequest(

            `users?${userQuery}`,

            token

        );

        const streamQuery = MEMBERS
            .map(user => `user_login=${user}`)
            .join("&");

        const streams = await twitchRequest(

            `streams?${streamQuery}`,

            token

        );

                /* ==========================================
           DATEN AUFBEREITEN
        ========================================== */

        const members = {};

        users.data.forEach(user => {

            const stream = streams.data.find(

                s =>

                s.user_id === user.id

            );

            members[user.login] = {

                id: user.id,

                login: user.login,

                display_name: user.display_name,

                profile_image: user.profile_image_url,

                offline_image: user.offline_image_url,

                live: !!stream,

                title: stream
                    ? stream.title
                    : "",

                game: stream
                    ? stream.game_name
                    : "",

                viewers: stream
                    ? stream.viewer_count
                    : 0,

                started_at: stream
                    ? stream.started_at
                    : null,

                thumbnail: stream

                    ? stream.thumbnail_url
                        .replace("{width}", "1280")
                        .replace("{height}", "720")

                    : user.profile_image_url,

                followers: 0

            };

        });

        /* ==========================================
           FOLLOWER LADEN
        ========================================== */

        for (const member of Object.values(members)) {

            try {

                const followerData =
                    await twitchRequest(

                        `members/followers?broadcaster_id=${member.id}`,

                        token

                    );

                member.followers =
                    followerData.total;

            }

            catch (error) {

                console.error(

                    "Follower konnten nicht geladen werden:",

                    member.login

                );

            }

        }

        /* ==========================================
           JSON ZURÜCKGEBEN
        ========================================== */

        return res.status(200).json(

            members

        );

    }

    catch (error) {

        console.error(error);

        return res.status(500).json({

            error: error.message

        });

    }

}