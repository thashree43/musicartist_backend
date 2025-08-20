import axios from "axios";
import dotenv from "dotenv";
dotenv.config();


let spotifyToken = null;
let tokenExpiry = 0;


export async function getSpotifyToken() {
if (spotifyToken && Date.now() < tokenExpiry) return spotifyToken;


const basic = Buffer.from(
`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
).toString("base64");


const response = await axios.post(
"https://accounts.spotify.com/api/token",
"grant_type=client_credentials",
{ headers: { Authorization: `Basic ${basic}`, "Content-Type": "application/x-www-form-urlencoded" } }
);


spotifyToken = response.data.access_token;
tokenExpiry = Date.now() + response.data.expires_in * 1000;
return spotifyToken;
}