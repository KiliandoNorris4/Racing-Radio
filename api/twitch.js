/* ==========================================
   TRACKTIME TWITCH API
========================================== */

const CLIENT_ID = process.env.TWITCH_CLIENT_ID;
const CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET;

const CHANNEL = "kiliando_norris4";

/* ==========================================
   TOKEN HOLEN
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

export default async function handler(req, res) {

    try {

        const accessToken = await getAccessToken();

        const response = await fetch(
            `https://api.twitch.tv/helix/streams?user_login=${CHANNEL}`,
            {
                headers: {
                    "Client-ID": CLIENT_ID,
                    "Authorization": `Bearer ${accessToken}`
                }
            }
        );

        if (!response.ok) {
            throw new Error("Twitch API Fehler");
        }

        const result = await response.json();

        if (result.data.length === 0) {

            return res.status(200).json({
                live: false
            });

        }

        const stream = result.data[0];

        return res.status(200).json({

            live: true,

            title: stream.title,

            game: stream.game_name,

            viewers: stream.viewer_count,

            started_at: stream.started_at,

            thumbnail: stream.thumbnail_url
                .replace("{width}", "640")
                .replace("{height}", "360")

        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            error: error.message
        });

    }

}