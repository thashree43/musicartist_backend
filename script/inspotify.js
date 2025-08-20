// ingestArtists.js
import dotenv from "dotenv";
import mongoose from "mongoose";
import { searchArtistsFromSpotify } from "../service/spotify.js";
import Artist from "../model/Artist.js"; 

dotenv.config();

const LETTERS = "abcdefghijklmnopqrstuvwxyz".split("");

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("✅ Connected to MongoDB");

  let totalSaved = 0;

  for (const letter of LETTERS) {
    console.log(`🔍 Searching for artists with: ${letter}`);

    try {
      const items = await searchArtistsFromSpotify(letter, 50, 0); 
      for (const artist of items) {
        await Artist.updateOne(
          { spotifyId: artist.id },
          {
            $set: {
              name: artist.name,
              genres: artist.genres,
              image: artist.images?.[0]?.url || null,
              followers: artist.followers?.total || 0,
              popularity: artist.popularity || 0,
            },
          },
          { upsert: true }
        );
      }

      totalSaved += items.length;
      console.log(`✅ Saved ${items.length} artists for query "${letter}"`);
    } catch (err) {
      console.error("❌ Error:", err.message);
    }
  }

  console.log(`🎉 Done! Total artists saved: ${totalSaved}`);
  mongoose.disconnect();
}

run();
