const express = require("express");
const bodyParser = require("body-parser");
const ejs = require('ejs');
const path = require('path');

const app = express();
var tracks_name = [];
var tracks_id = [];
var tracks_data = [];
var user_songs = [];
var artists_name = [];
var artists_id = [];
var songInfo = [];

parseCSVData(tracks_name, tracks_id, tracks_data);

app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({
    extended:true
}));

app.get("/", (req, res) => {
    res.render("home");
});

// app.get("/q1", (req, res) => {
//     res.render('q1');
// });

app.get("/searched-song", (req, res) => {
    res.render('searched-song');
});

app.get("/function", (req, res) => {
    res.render('function', {
        selectSongs: user_songs
    });
});

app.post("/searched-song", (req, res) => {
    var isSong = false;
    var searchInput = req.body.searchbar.toLowerCase();
    if (req.body.selection == 'song' ) {
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

    if (isSong){
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

// app.post('/function', (req, res) => {
//     var selectedSong = req.body.song;
//
//     user_songs.push(selectedSong);
//     console.log(user_songs)
//
//     res.render('function', {
//         selectSongs : user_songs
//     });
// });

app.listen(3000, () => {
    console.log("server is listening on port 3000");
});



//functions

function parseCSVData(tn, ti, td) {
    const fs = require('fs');


    const artists_results = fs.readFileSync('artists.csv').toString().split(/\r\n|\n|\r/);
    const a_res = artists_results.map((line) => line.split(","));
    const artists_data = a_res.slice(1);

    // push artist name from artist.csv into array
    for (var i = 0; i < artists_data.length; i++) {
        artists_name.push(artists_data[i][artists_data[i].length-2]);
    }

    //push artist id from artist.csv into array
    for (var i = 0; i < artists_data.length; i++) {
        artists_id.push(artists_data[i][0]);
    }

    const tracks_results = fs.readFileSync('tracks.csv').toString().split(/\r\n|\n|\r/);
    const t_res = tracks_results.map((line) => line.split(","));

    for (var i = 1; i < t_res.length; i++) {
        td.push(t_res[i]);
    }
    for (var i = 0; i< td.length; i++){
        if (td[i][5] != null){
            var temp = td[i][5].toLowerCase();
            td[i][5] = temp;
        }
    }
    for (var i = 0; i < td.length; i++) {
        tn.push(td[i][1]);
    }
    for (var i = 0; i< tn.length; i++){
        if (tn[i] != null){
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


// second question
const jsonData = require('./dict_artists.json');

var artistID;
var reccArray = [];
var popularRating = 0;
var popularSong;
var popularSongsArray = [];
app.post('/function', (req, res) => {
    var givenSong = req.body.song;

    for (var i = 0; i < tracks_data.length; i++){
        if (givenSong == tracks_data[i][1]) {
            artistID = tracks_data[i][6].toString();
            artistID = artistID.slice(2,artistID.length-2);
             console.log(artistID);
            break;
        }
    }

    //output top 5 names into recc array
    if (jsonData.hasOwnProperty(artistID)){
        for (var i = 0; i < 5; i++) {
            reccArray.push(jsonData[artistID][i]);
            console.log(jsonData[artistID][i]);
        }
    }
    // output the names of top 5 artist from the recommended artists array (do i need this block of code tho?)
    // for (var i = 0; i < reccArray.length; i++){
    //     for (var j = 0; j < artists_id.length; j++) {
    //         if (artists_id[j] == reccArray[i]) {
    //            console.log(artists_name[j]);
    //         }
    //     }
    // }
    // get the names of the most popular songs from each of the artists into an array
    for (var i = 0; i < reccArray.length; i++){
        for (var j = 0; j < tracks_data.length; j++) {
            if (tracks_data[j][tracks_data[j].length-14] == reccArray[i]) {
                if (tracks_data[j][2] > popularRating){
                    popularRating = tracks_data[j][2];
                    popularSong = tracks_data[j][0];
                    // console.log(popularSong);
                }
            }
        }
        popularSongsArray.push(popularSong);
        popularRating = 0;
    }
    for (var i = 0; i < popularSongsArray.length;i++){
        console.log(popularSongsArray[i]);
    }

});



//8,9,11,13,14,15,16,17,18
// for (var i = 0; i < songInfo.length; i++)

