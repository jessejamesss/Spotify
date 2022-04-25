const express = require("express");
const bodyParser = require("body-parser");
const ejs = require('ejs');
const path = require('path');

const app = express();
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
    res.render("q1");
});

app.post("/", (req, res) => {
    var isSong = false;
    var searchInput = req.body.searchbar.toLowerCase();
    if (req.body.selection == 'song' ) {
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

    if (isSong){
        res.render('searched-song', {
            isSong_ejs: true,
            songResults: songInfo
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
    // console.log(songList[1])
}

function oneArtist(songData) {
    if (songData[5].substring(songData[5].length - 2) == '\']') {
        return true;
    }
    return false;
}

var songList = [];

// function addToArray(){
//     console.log("-------");
//     alert("hello");
//
//     // songList.push(songInfo[i][1]); //added
//     // for (var i = 0; i < songList.length; i++)
//     //     console.log(songList[i])
// }
//
// btn1.addEventListener('click', function( event ) {
//     search();
// });


