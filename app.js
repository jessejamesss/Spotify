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
var tt_data = [];

const jsonData = require('./dict_artists.json');

var artistID;

var popularRating = 0;
var popularSong = 0; //song id
var popularName = ""; //song name
var popularSongsIDArray = []; //song ID array
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
    var request = req.headers.referer;

    if (selectedSong != undefined) {
        user_songs.push(selectedSong);
        song_ids.push(selectedSongID);
        console.log(user_songs)
        console.log(song_ids);

        for (var i = 0; i < tracks_id.length; i++) {
            if (tracks_id[i] == selectedSongID) {
                song_data.push(tracks_data[i]);
                tt_data.push(tracks_data[i].slice(tracks_data[i].length - 12));
            }
        }
    }

    console.log(deleteIndex);
    if (deleteIndex > -1 && songToDelete != null) {
        user_songs.splice(deleteIndex, 1);
        song_data.splice(deleteIndex, 1);
        tt_data.splice(deleteIndex, 1);
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
            if (danceability != undefined) { 
                song_data[j][8] = danceability; 
                tt_data[j][0] = danceability; 
            }
            if (energy != undefined) {
                song_data[j][9] = energy;
                tt_data[j][1] = energy;  
            }
            if (loudness != undefined) { 
                song_data[j][11] = loudness; 
                tt_data[j][3] = loudness; 
            }
            if (speechiness != undefined) { 
                song_data[j][13] = speechiness; 
                tt_data[j][5] = speechiness; 
            }
            if (acousticness != undefined) { 
                song_data[j][14] = acousticness; 
                tt_data[j][6] = acousticness; 
            }
            if (instrumentalness != undefined) { 
                song_data[j][15] = instrumentalness; 
                tt_data[j][7] = instrumentalness; 
            }
            if (liveness != undefined) { 
                song_data[j][16] = liveness; 
                tt_data[j][8] = liveness; 
            }
            if (valence != undefined) { 
                song_data[j][17] = valence; 
                tt_data[j][9] = valence; 
            }
            if (tempo != undefined) {
                song_data[j][18] = tempo; 
                tt_data[j][10] = tempo; 
            }
        }
    }

    if (request == "http://localhost:3000/tt-searchAdd") {
        res.render('tt-results', {
            selectSongs: user_songs,
            selectSongID: song_ids,
            songData: song_data,
            results: traits
        });
    }
    else if (request == "http://localhost:3000/tt-results") {
        res.render('tt-results', {
            selectSongs: user_songs,
            selectSongID: song_ids,
            songData: song_data,
            results: traits
        }); 
    }
    else {
        res.render('trait-tracker', {
            selectSongs: user_songs,
            selectSongID: song_ids,
            songData: song_data
        });
    }
});

// app.post('/tt-search', (req, res) => {
//     res.render('tt-search', {
//         selectSongs: user_songs,
//         selectSongID: song_ids,
//         songData: song_data
//     });
// });

app.post('/tt-update', (req, res) => {
    var uniqueID = req.body.ID;

    res.render('tt-update', {
        selectSongs: user_songs,
        songData: song_data,
        ID: uniqueID
    });
});

app.post('/tt-searchAdd', (req, res) => {
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
        res.render('tt-searchAdd', {
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

        res.render('tt-searchAdd', {
            isSong_ejs: false,
            songsByArtist: artistSongs
        });
    }
});

var meanArray = []; //array of mean
var scoreDeviation = [];
var variance = [];

app.post('/tt-results', (req, res) => {
    var request = req.headers.referer;

    console.log("hi");

    if (meanArray.length == 0) {
        console.log("hey");
        //NEW LINES OF CODE
        // delete columns we don't need
        tt_data.forEach(a => a.splice(2, 1));
        tt_data.forEach(a => a.splice(3, 1));
        tt_data.forEach(a => a.splice(9, 1));
        tt_data.forEach(a => a.splice(2, 1));
        tt_data.forEach(a => a.splice(7, 1));


        console.log(tt_data);

        //get the sum
        for (var i = 0; i < tt_data.length; i++) {
            if (tt_data[i] != null) {
                for (var j = 0; j < tt_data[i].length; j++) {
                    traits.push(parseFloat(tt_data[i][j]));
                }
            }
            break;
        }

        for (var i = temp + 1; i < tt_data.length; i++) {
            if (tt_data[i] != null) {
                for (var j = 0; j < tt_data[i].length; j++) {
                    traits[j] += (parseFloat(tt_data[i][j]));
                }
                count++;
            }
        }

        console.log(tt_data);

        for (var i = 0; i < traits.length; i++) {
            meanArray.push(traits[i] / count);
        }

        for (var i = 0; i < tt_data.length; i++) { //each row
            if (tt_data[i] != null) {
                scoreDeviation.push([]);
                for (var j = 0; j < tt_data[i].length; j++) {
                    scoreDeviation[i].push((tt_data[i][j] - meanArray[j]) ** 2);
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
            traits[i] = (traits[i] / count);
            variance[i] = traits[i];
            traits[i] = traits[i] ** .5;
        }
        console.log(traits);

        res.render('tt-results', {
            selectSongs: user_songs,
            selectSongID: song_ids,
            songData: song_data,
            results: traits
        });
    }   
    else {
        // console.log("tt_data");
        // console.log(tt_data);
        // console.log("traits");
        // console.log(traits);

        count++;
        var newInput = tt_data[tt_data.length - 1];
        var newAverage = 0;
        var first = 0;
        var stdUpdate = [];

        // console.log("newInput");
        // console.log(newInput);

        newInput.splice(2, 1);
        newInput.splice(3, 1);
        newInput.splice(9, 1);
        newInput.splice(2, 1);
        newInput.splice(7, 1);

        // console.log("newInput2");
        // console.log(newInput);

        // console.log(count);
        // console.log(variance);
        // console.log(meanArray);

        for (var i = 0; i < traits.length; i++) {
            firstPart = parseFloat((count - 1) * variance[i]);
            // console.log(firstPart);
            newAverage = (meanArray[i] * (count - 1)); 
            newAverage = (newAverage + parseFloat(newInput[i])) / count;
            // console.log(newInput[i]);
            // console.log(newAverage);
            stdUpdate.push(((firstPart + (parseFloat(newInput[i]) - newAverage) * (newInput[i] - meanArray[i])) / count) ** .5);
            // console.log(stdUpdate[i]);
        }

        console.log("stdUpdate");
        // console.log(stdUpdate);

        res.render('tt-results', {
            selectSongs: user_songs,
            selectSongID: song_ids,
            songData: song_data,
            results: stdUpdate
        });
    } 
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
            if (danceability != undefined) { song_data[j][8] = danceability; }
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

var k = -1;
app.post('/tr-results', (req, res) => {
    var tr_results = [];
    var popularSongsNameArray = [];
    var reccArray = [];
    var reccArtist = [];
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

    console.log(reccArtist);

    //user chooses which trait to recommend by

    if (req.body.selectTrait == 'danceability') {
        k = 12;
    }
    else if (req.body.selectTrait == 'energy') {
        k = 11;
    }
    else if (req.body.selectTrait == 'speechiness') {
        k = 7;
    }
    else if (req.body.selectTrait == 'acousticness') {
        k = 6;
    }
    else if (req.body.selectTrait == 'instrumentalness') {
        k = 5;
    }
    else if (req.body.selectTrait == 'liveness') {
        k = 4;
    }
    else if (req.body.selectTrait == 'valence') {
        k = 3;
    }

    // get the names of the most popular songs from each of the artists into an array
    for (var i = 0; i < reccArray.length; i++) {
        for (var j = 0; j < tracks_data.length; j++) {
            if (tracks_data[j].slice(6, tracks_data[j].length - 13).toString().includes(reccArray[i])) {
                if (tracks_data[j][2] > popularRating) {
                    if (req.body.selectTrait == 'popularity') {
                        popularRating = tracks_data[j][2]; 
                    }
                    else {
                        popularRating = tracks_data[j][tracks_data[j].length - k];
                    }
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
        song: givenSong,
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