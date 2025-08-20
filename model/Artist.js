import mongoose from "mongoose";


const locationSchema = new mongoose.Schema(
{
city: String,
state: String,
country: String,
lat: Number,
lon: Number,
source: { type: String, default: "unknown" } 
},
{ _id: false }
);


const artistSchema = new mongoose.Schema(
{
spotifyId: { type: String, unique: true, required: true, index: true },
name: { type: String, required: true },
genres: { type: [String], default: [] },
followers: { type: Number, default: 0 },
popularity: { type: Number, default: 0 },
images: { type: [{ url: String, width: Number, height: Number }], default: [] },
imageUrl: { type: String }, 


location: { type: locationSchema, default: {} },


nameFolded: { type: String, index: true },
nameEdgeNgrams: { type: [String], index: true },


updatedAt: { type: Date, default: Date.now }
},
{ timestamps: true }
);

function fold(str) {
return (str || "")
.toLowerCase()
.normalize("NFD")
.replace(/\p{Diacritic}/gu, "");
}


function edgeNgrams(str, min = 2, max = 20) {
const out = [];
const clean = fold(str);
for (let i = min; i <= Math.min(max, clean.length); i++) {
out.push(clean.slice(0, i));
}
return out;
}


artistSchema.pre("save", function (next) {
this.nameFolded = fold(this.name);
this.nameEdgeNgrams = edgeNgrams(this.name);
this.imageUrl = this.images?.[0]?.url || this.imageUrl;
this.updatedAt = new Date();
next();
});


// Useful compound indexes
artistSchema.index({ nameFolded: 1, followers: -1 });
artistSchema.index({ nameEdgeNgrams: 1, followers: -1 });
artistSchema.index({ "location.country": 1, "location.city": 1 });


export default mongoose.model("Artist", artistSchema);