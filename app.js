require("dotenv").config();

const express = require("express");
const hbs = require("hbs");

// require spotify-web-api-node package here:
const SpotifyWebApi = require("spotify-web-api-node");

const app = express();

app.set("view engine", "hbs");
app.set("views", __dirname + "/views");
app.use(express.static(__dirname + "/public"));
hbs.registerPartials(__dirname + "/views/partials");

// setting the spotify-api goes here:
const spotifyApi = new SpotifyWebApi({
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
});

// Retrieve an access token
spotifyApi
  .clientCredentialsGrant()
  .then((data) => spotifyApi.setAccessToken(data.body["access_token"]))
  .catch((error) =>
    console.log("Something went wrong when retrieving an access token", error)
  );

// Our routes go here:
app.get("/", (req, res) => {
  res.render("home");
});

app.get("/artist-search", (req, res) => {
  console.log(req.query);
  const { artist } = req.query;
  spotifyApi
    .searchArtists(artist)
    .then((data) => {
      //console.log("The received data from the API: ", data.body.artists.items);
      // ----> 'HERE WHAT WE WANT TO DO AFTER RECEIVING THE DATA FROM THE API'
      res.render("artist-results", { data: data.body.artists.items });
    })
    .catch((err) =>
      console.log("The error while searching artists occurred: ", err)
    );
});

app.get("/albums/:artistId", (req, res) => {
  console.log(req.params);
  const { artistId } = req.params;
  spotifyApi.getArtistAlbums(artistId).then((data) => {
    console.log("Retrieving data", data.body.items);
    res.render("albums", { albums: data.body.items });
  });
});

app.get("/view-tracks/:albumId", (req, res) => {
  const { albumId } = req.params;
  spotifyApi
    .getAlbumTracks(albumId, { limit: 12, offset: 0 })
    .then((data) => {
      console.log(data.body.items);
      res.render("tracks", { tracks: data.body.items });
    })
    .catch((err) => {
      console.log(err);
    });
});

app.listen(process.env.PORT, () =>
  console.log(
    `My Spotify project running on port ${process.env.PORT} 🎧 🥁 🎸 🔊`
  )
);
