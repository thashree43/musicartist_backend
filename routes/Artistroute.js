import express from "express";
import { getArtistDetails } from "../service/spotify.js";
import Artist from "../model/Artist.js";


const router = express.Router();


router.get("/artist/:id", async (req, res) => {
try {
const doc = await getArtistDetails(req.params.id);
res.json(doc);
} catch (e) {
console.error(e);
res.status(500).json({ error: "Failed to fetch artist" });
}
});


router.get("/artist/db/:mongoId", async (req, res) => {
try {
const doc = await Artist.findById(req.params.mongoId);
if (!doc) return res.status(404).json({ error: "Not found" });
res.json(doc);
} catch (e) {
res.status(500).json({ error: "Server error" });
}
});


export default router;