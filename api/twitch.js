/* ==========================================
   TRACKTIME TWITCH API
========================================== */

const CLIENT_ID = process.env.TWITCH_CLIENT_ID;
const CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET;

const CHANNEL = "kiliando_norris4";


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

    const data = await response.json();

    return data.access_token;

}

/* ==========================================
   API
========================================== */

export default async function handler(req, res) {

    try {

        const accessToken = await getAccessToken();

        const query = CHANNELS
            .map(channel => `user_login=${channel}`)
            .join("&");

        const response = await fetch(

            `https://api.twitch.tv/helix/streams?${query}`,

            {
                headers: {

                    "Client-ID": CLIENT_ID,

                    "Authorization":
                        `Bearer ${accessToken}`

                }
            }

        );

        const result = await response.json();

        const members = {};

        CHANNELS.forEach(channel => {

            members[channel] = {

                live: false

            };

        });

        result.data.forEach(stream => {

            members[stream.user_login.toLowerCase()] = {

                live: true,

                title: stream.title,

                game: stream.game_name,

                viewers: stream.viewer_count,

                started_at: stream.started_at,

                thumbnail:
                    stream.thumbnail_url
                        .replace("{width}", "640")
                        .replace("{height}", "360")

            };

        });

        res.status(200).json(members);

    }

    catch(error){

        console.error(error);

        res.status(500).json({

            error:error.message

        });

    }

}