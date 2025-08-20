import express from "express";
import Artist from "../model/Artist.js";
import { searchArtistsFromSpotify } from "../service/spotify.js";

const router = express.Router();

router.get("/search", async (req, res) => {
  try {
    const q = String(req.query.q || "").trim();
    const limit = Math.min(parseInt(req.query.limit || "10", 10), 50);

    if (!q) return res.json({ suggestions: [], results: [] });

    const regex = new RegExp(q, "i");

    const dbResults = await Artist.find({
      $or: [
        { name: regex },
        { nameFolded: { $regex: q.toLowerCase() } }
      ]
    })
      .sort({ followers: -1 })
      .limit(limit)
      .select("name imageUrl genres followers location spotifyId");

    let results = dbResults;
    if (dbResults.length < 5) {
      await searchArtistsFromSpotify(q, limit);

      const updatedResults = await Artist.find({
        $or: [
          { name: regex },
          { nameFolded: { $regex: q.toLowerCase() } }
        ]
      })
        .sort({ followers: -1 })
        .limit(limit)
        .select("name imageUrl genres followers location spotifyId");

      results = updatedResults;
    }

    res.json({ suggestions: results.slice(0, 8), results });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Search failed" });
  }
});

export default router;
