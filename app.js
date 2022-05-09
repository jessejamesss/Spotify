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
var artists_name = [];
var artists_id = [];
var songInfo = [];

const jsonData = require('./dict_artists.json');

var artistID;
var reccArray = [];
var reccArtist = [];
var popularRating = 0;
var popularSong = 0; //song id
var popularName = ""; //song name
var popularSongsIDArray = []; //song ID array
var popularSongsNameArray = []; //songName array
var popSongData = []; //data for pop songs
var temp = 0;
var traits = [];
var count = 1;

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

app.get("/search", (req, res) => {
    res.render("search");
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

//////// trait tracker ////////

app.post('/tt-search', (req, res) => {
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
        res.render('tt-search', {
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

        res.render('tt-search', {
            isSong_ejs: false,
            songsByArtist: artistSongs
        });
    }
});

app.post('/trait-tracker', (req, res) => {
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
                song_data.push(tracks_data[i].slice(tracks_data[i].length - 12));
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

    res.render('trait-tracker', {
        selectSongs: user_songs,
        selectSongID: song_ids,
        songData: song_data
    });
});

app.post('/tt-search', (req, res) => {
    res.render('tt-search', {
        selectSongs: user_songs,
        selectSongID: song_ids,
        songData: song_data
    });
});

app.post('/tt-update', (req, res) => {
    var uniqueID = req.body.ID;

    res.render('tt-update', {
        selectSongs: user_songs,
        songData: song_data,
        ID: uniqueID
    });
});

var meanArray = []; //array of mean
var scoreDeviation = [];

app.post('/tt-results', (req, res) => {

    //NEW LINES OF CODE
    // delete columns we don't need
    song_data.forEach(a => a.splice(2, 1));
    song_data.forEach(a => a.splice(3, 1));
    song_data.forEach(a => a.splice(9, 1));
    song_data.forEach(a => a.splice(2, 1));
    song_data.forEach(a => a.splice(7, 1));


    console.log(song_data);

    //get the sum
    for (var i = 0; i < song_data.length; i++) {
        if (song_data[i] != null) {
            for (var j = 0; j < song_data[i].length; j++) {
                traits.push(parseFloat(song_data[i][j]));
            }
        }
        break;
    }

    for (var i = temp + 1; i < song_data.length; i++) {
        if (song_data[i] != null) {
            for (var j = 0; j < song_data[i].length; j++) {
                traits[j] += (parseFloat(song_data[i][j]));
            }
            count++;
        }
    }

    console.log(song_data);

    for (var i = 0; i < traits.length; i++) {
        meanArray.push(traits[i] / count);
    }

    for (var i = 0; i < song_data.length; i++) { //each row
        if (song_data[i] != null) {
            scoreDeviation.push([]);
            for (var j = 0; j < song_data[i].length; j++) {
                scoreDeviation[i].push((song_data[i][j] - meanArray[j]) ** 2);
            }
        }
    }

    //sum of squares
    for (var j = 0; j < scoreDeviation[0].length; j++) {
        traits[j] = (scoreDeviation[0][j]);
    }
    for (var i = 1; i < scoreDeviation.length; i++) {
        for (var j = 0; j < scoreDeviation[i].length; j++) {
            traits[j] += scoreDeviation[i][j];
        }
    }

    //variance and square root
    for (var i = 0; i < traits.length; i++) {
        traits[i] = (traits[i] / count) ** .5;
    }
    console.log(traits);

    var trait_names = ["Danceability", "Energy", "Speechiness", "Acousticness", "Instrumentalness", "Liveness", "Valence"];
    
    res.render('tt-results', {
        selectSongs: user_songs,
        results: traits,
        traits: trait_names
    });
});

//////// track recommender ////////

app.post('/tr-search', (req, res) => {
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
        res.render('tr-search', {
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

        res.render('tr-search', {
            isSong_ejs: false,
            songsByArtist: artistSongs
        });
    }
});

app.post('/track-recommender', (req, res) => {
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

    res.render('track-recommender', {
        selectSongs: user_songs,
        selectSongID: song_ids,
        songData: song_data
    });
});

app.post('/tr-search', (req, res) => {
    res.render('tr-search', {
        selectSongs: user_songs,
        selectSongID: song_ids,
        songData: song_data
    });
});

app.post('/tr-update', (req, res) => {
    var uniqueID = req.body.ID;

    res.render('tr-update', {
        selectSongs: user_songs,
        songData: song_data,
        ID: uniqueID
    });
});

app.post('/tr-results', (req, res) => {
    var tr_results = [];
    var givenSong = req.body.song;

    for (var i = 0; i < tracks_data.length; i++) {
        if (givenSong == tracks_data[i][1]) {
            artistID = tracks_data[i][6].toString();
            artistID = artistID.slice(2, artistID.length - 2);
            break;
        }
    }

    //output top 5 names into recc array
    if (jsonData.hasOwnProperty(artistID)) {
        for (var i = 0; i < 5; i++) {
            reccArray.push(jsonData[artistID][i]);
        }
    }

    //output the names of top 5 artist from the recommended artists array (do i need this block of code tho?)
    for (var i = 0; i < reccArray.length; i++) {
        for (var j = 1; j < artists_id.length; j++) {
            if (artists_id[j] == reccArray[i]) {
                reccArtist.push(artists_name[j]);
            }
        }
    }

    // get the names of the most popular songs from each of the artists into an array
    for (var i = 0; i < reccArray.length; i++) {
        for (var j = 0; j < tracks_data.length; j++) {
            if (tracks_data[j].slice(6, tracks_data[j].length - 13).toString().includes(reccArray[i])) {
                if (tracks_data[j][2] > popularRating) {
                    popularRating = tracks_data[j][2];
                    popularSong = tracks_data[j][0];
                    popularName = tracks_data[j][1];
                    temp = j;
                }
            }
        }
        if (temp != 0) {
            popularSongsIDArray.push(popularSong);
            popularSongsNameArray.push(popularName);
            popSongData.push(tracks_data[temp].slice(tracks_data[i].length - 12));
            popularRating = 0;
            popularSong = 0;
            popularName = "";
            temp = 0;
        }
        else if (temp == 0) {
            popularSongsNameArray.push(null);
        }
    }

    for (var i = 0; i < reccArtist.length; i++) {
        if (popularSongsNameArray[i] != null) {
            tr_results.push(reccArtist[i] + ": " + popularSongsNameArray[i]);
        }
    }

    res.render('tr-results', {
        results: tr_results 
    });
});

//////// artist similarity ////////

app.post('/as-search', (req, res) => {
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
        res.render('as-search', {
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

        res.render('as-search', {
            isSong_ejs: false,
            songsByArtist: artistSongs
        });
    }
});

app.post('/artist-similarity', (req, res) => {
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

    res.render('artist-similarity', {
        selectSongs: user_songs,
        selectSongID: song_ids,
        songData: song_data
    });
});

app.post('/as-search', (req, res) => {
    res.render('as-search', {
        selectSongs: user_songs,
        selectSongID: song_ids,
        songData: song_data
    });
});

app.post('/as-update', (req, res) => {
    var uniqueID = req.body.ID;

    res.render('as-update', {
        selectSongs: user_songs,
        songData: song_data,
        ID: uniqueID
    });
});

// app.post('/as-results', (req, res) => {
//     res.render('tr-results', {
//         results: tr_results
//     });
// });

//////// functions ////////

function parseCSVData(tn, ti, td) {
    const fs = require('fs');

    const artists_results = fs.readFileSync('artists.csv').toString().split(/\r\n|\n|\r/);
    const a_res = artists_results.map((line) => line.split(","));
    const artists_data = a_res.slice(1);

    for (var i = 0; i < artists_data.length; i++) {
        artists_name.push(artists_data[i][artists_data[i].length - 2]);
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