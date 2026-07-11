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