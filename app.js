const express = require("express");
const bodyParser = require("body-parser");

const app = express();
var path = require('path');
var tracks_name = [];
var tracks_id = [];
var tracks_data = [];

parseCSVData(tracks_name, tracks_id, tracks_data);

app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.urlencoded({
    extended:true
}));

app.get("/", (req, res) => {
    res.render("home");
});

app.post("/", (req, res) => {
    var song = req.body.searchbar;
    var data = displaySong(song, tracks_name, tracks_data);
    res.send(data);
    //console.log(req.body);
});

app.listen(3000, () => {
    console.log("server is listening on port 3000");
});



//functions
function parseCSVData(tn, ti, td) {
    const fs = require('fs');

    const artists_results = fs.readFileSync('artists.csv').toString().split(/\r\n|\n|\r/);
    const a_res = artists_results.map((line) => line.split(","));

    const artists_data = a_res.slice(1);

    const artists_name = [];
    const artists_id = [];

    for (var i = 0; i < artists_data.length; i++) {
        artists_name.push(artists_data[i][3]);
    }

    for (var i = 0; i < artists_data.length; i++) {
        artists_id.push(artists_data[i][0]);
    }

    //console.log(artists_data);

    const tracks_results = fs.readFileSync('tracks.csv').toString().split(/\r\n|\n|\r/);
    const t_res = tracks_results.map((line) => line.split(","));

    for (var i = 1; i < t_res.length; i++) {
        td.push(t_res[i]);
    }

    for (var i = 0; i < td.length; i++) {
        tn.push(td[i][1]);
    }

    for (var i = 0; i < td.length; i++) {
        ti.push(td[i][0]);
    }
}

function displaySong(song, tn, td) {
    var j;
    var trackID;
    var danceability;
    var energy;
    var loudness;
    for (var i = 0; i < tn.length; i++) {
        if (tn[i] == song) {
            j = i;
        }
    }

    trackID = td[j][0];
    danceability = td[j][8];
    energy = td[j][9];
    loudness = td[j][11];

    var info = "ID: " + trackID + " Danceability: " + danceability + " Energy: " + energy + " Loudness: " + loudness;
    return info;
}