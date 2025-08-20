import axios from "axios";
import { getSpotifyToken } from "../utilis/token.js";
import Artist from "../model/Artist.js";

export async function searchArtistsFromSpotify(query, limit = 20, offset = 0) {
  const token = await getSpotifyToken();
  const url = `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=artist&limit=${limit}&offset=${offset}`;
  const { data } = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } });
  const items = data?.artists?.items || [];

  await Promise.all(
    items.map((a) =>
      Artist.findOneAndUpdate(
        { spotifyId: a.id },
        {
          spotifyId: a.id,
          name: a.name,
          genres: a.genres || [],
          followers: a.followers?.total || 0,
          images: (a.images || []).map((im) => ({
            url: im.url,
            width: im.width,
            height: im.height
          })),
          imageUrl: a.images?.[0]?.url || null,   
          popularity: a.popularity || 0
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      )
    )
  );

  return items;
}

export async function getArtistDetails(spotifyId) {
  const cached = await Artist.findOne({ spotifyId });
  if (cached) return cached;

  const token = await getSpotifyToken();
  const { data: a } = await axios.get(`https://api.spotify.com/v1/artists/${spotifyId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  const saved = await Artist.findOneAndUpdate(
    { spotifyId: a.id },
    {
      spotifyId: a.id,
      name: a.name,
      genres: a.genres || [],
      followers: a.followers?.total || 0,
      images: (a.images || []).map((im) => ({
        url: im.url,
        width: im.width,
        height: im.height
      })),
      imageUrl: a.images?.[0]?.url || null,  
      popularity: a.popularity || 0
    },
    { upsert: true, new: true }
  );

  return saved;
}
