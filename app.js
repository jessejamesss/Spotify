const express = require("express");
const bodyParser = require("body-parser");
const ejs = require('ejs');
const path = require('path');

const app = express();
var tracks_name = [];
var tracks_id = [];
var tracks_data = [];
var user_songs = [];
var song_ids = [];
var song_data = [];

parseCSVData(tracks_name, tracks_id, tracks_data);

app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({
    extended: true
}));

app.get("/", (req, res) => {
    res.render("home");
});

app.get("/home", (req, res) => {
    res.render("home");
});

app.get("/searched-song", (req, res) => {
    res.render('searched-song');
});

app.get("/update", (req, res) => {
    res.render('update');
});

app.get("/function", (req, res) => {
    res.render('function', {
        selectSongs: user_songs
    });
});

app.post('/searched-song', (req, res) => {
    var isSong = false;
    var searchInput = req.body.searchbar.toLowerCase();
    if (req.body.selection == 'song') {
        var songIndex = [];
        var songInfo = [];

        for (var i = 0; i < tracks_name.length; i++) {
            if (tracks_name[i] == null) {
                continue;
            }
            if (tracks_name[i].includes(searchInput)) {
                if (oneArtist(tracks_data[i])) {
                    songIndex.push(i);
                    songInfo.push(tracks_data[i]);

                }
            }
        }

        if (songInfo.length != 0) {
            isSong = true;
        }
    }

    if (isSong) {
        res.render('searched-song', {
            isSong_ejs: true,
            songResults: songInfo,
            selectedSongs: user_songs
        });
    }
    else {
        var artistSongs = [];
        for (var i = 0; i < tracks_data.length; i++) {
            if (tracks_data[i][5] == searchInput && !artistSongs.includes(tracks_data[i][1])) {
                artistSongs.push(tracks_data[i][1]);
            }
        }

        res.render('searched-song', {
            isSong_ejs: false,
            songsByArtist: artistSongs
        });
    }
});

app.post('/function', (req, res) => {
    var selectedSong = req.body.song;
    var selectedSongID = req.body.songID;
    var songToDelete = req.body.songToDelete;
    var deleteIndex = user_songs.indexOf(songToDelete);

    if (selectedSong != undefined) {
        user_songs.push(selectedSong);
        song_ids.push(selectedSongID);
        console.log(user_songs)
        console.log(song_ids);

        for (var i = 0; i < tracks_id.length; i++) {
            if (tracks_id[i] == selectedSongID) {
                song_data.push(tracks_data[i]);
            }
        }
    }

    console.log(deleteIndex);
    if (deleteIndex > -1 && songToDelete != null) {
        user_songs.splice(deleteIndex, 1);
        song_data.splice(deleteIndex, 1);
        song_ids.splice(deleteIndex, 1);
    }

    var uniqueID = req.body.songID;
    var danceability = req.body.danceability;
    var energy = req.body.energy;
    var loudness = req.body.loudness;
    var speechiness = req.body.speechiness;
    var acousticness = req.body.acousticness;
    var instrumentalness = req.body.instrumentalness;
    var liveness = req.body.liveness;
    var valence = req.body.valence;
    var tempo = req.body.tempo;

    for (var j = 0; j < song_data.length; j++) {
        if (song_data[j][0] == uniqueID) {
            if (req.body.danceability != undefined) { song_data[j][8] = danceability; }
            if (energy != undefined) { song_data[j][9] = energy; }
            if (loudness != undefined) { song_data[j][11] = loudness; }
            if (speechiness != undefined) { song_data[j][13] = speechiness; }
            if (acousticness != undefined) { song_data[j][14] = acousticness; }
            if (instrumentalness != undefined) { song_data[j][15] = instrumentalness; }
            if (liveness != undefined) { song_data[j][16] = liveness; }
            if (valence != undefined) { song_data[j][17] = valence; }
            if (tempo != undefined) { song_data[j][18] = tempo; }
        }
    }

    res.render('function', {
        selectSongs: user_songs,
        selectSongID: song_ids,
        songData: song_data
    });
});

app.post('/update', (req, res) => {
    var uniqueID = req.body.ID;

    res.render('update', {
        selectSongs: user_songs,
        songData: song_data,
        ID: uniqueID
    });
});

app.listen(3000, () => {
    console.log("server is listening on port 3000");
});

//functions

function parseCSVData(tn, ti, td) {
    const fs = require('fs');

    const artists_name = [];
    const artists_id = [];
    const artists_results = fs.readFileSync('artists.csv').toString().split(/\r\n|\n|\r/);
    const a_res = artists_results.map((line) => line.split(","));
    const artists_data = a_res.slice(1);

    for (var i = 0; i < artists_data.length; i++) {
        artists_name.push(artists_data[i][3]);
    }
    for (var i = 0; i < artists_data.length; i++) {
        artists_id.push(artists_data[i][0]);
    }

    const tracks_results = fs.readFileSync('tracks.csv').toString().split(/\r\n|\n|\r/);
    const t_res = tracks_results.map((line) => line.split(","));

    for (var i = 1; i < t_res.length; i++) {
        td.push(t_res[i]);
    }
    for (var i = 0; i < td.length; i++) {
        if (td[i][5] != null) {
            var temp = td[i][5].toLowerCase();
            td[i][5] = temp;
        }
    }
    for (var i = 0; i < td.length; i++) {
        tn.push(td[i][1]);
    }
    for (var i = 0; i < tn.length; i++) {
        if (tn[i] != null) {
            var temp2 = tn[i].toLowerCase();
            tn[i] = temp2;
        }
    }
    for (var i = 0; i < td.length; i++) {
        ti.push(td[i][0]);
    }
}

function oneArtist(songData) {
    if (songData[5].substring(songData[5].length - 2) == '\']') {
        return true;
    }
    return false;
}