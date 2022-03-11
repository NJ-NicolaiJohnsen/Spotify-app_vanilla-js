const http = require('http');
const {URL} = require('url');
const fs = require('fs');
const lookup = require('mime-types').lookup;
const nodemailer = require('nodemailer');
const dotenv = require('dotenv')
dotenv.config();

const {
        redirect_uri,
        scope,
        client_id,
        reqAccessToken,
        reqUser,
        reqPrev,
        reqNext,
        reqPause,
        reqResume,
        reqPlay,
        reqVolume,
        reqSeek,
        reqRepeat,
        reqShuffle,
        getVolumeLevel,
        reqGenres,
        getTopGenres,
        getTopTracks,
        getRecentArtists,
        getPlaylist,
        reqSearch,
        reqFeaturedPlaylist,
        reqLikedTracksContains,
        reqLikedTracksFirstTrack,
        reqRemoveLikeFromTrack,
        reqLikeTrack,
        getPlaybackState,
        doResumeOrPause,
        reqAvailableDevices,
        reqTransferPlayback,
    } = require('./requests/requests')

function queryToJSON(chunk) {
    let queryObject = {};
    const data = Buffer.from(chunk).toString()
    const pairs = data.split('&');
    pairs.forEach((pair) => {
        pair = pair.split('=');
        queryObject[pair[0]] = decodeURIComponent(pair[1] || '')
    })
    queryObject = JSON.parse(JSON.stringify(queryObject))
    return queryObject;
}

/** When the client requests an endpoint, such as /next, /prev, /pause or /resume, this function will be called. This is a simple command, meaning it needs no data besides itself. The command itself is self-sufficient. 
It is also a boolean type command, meaning the callbacks provided within will check if the function they are trying to run is already running. 
If the player is already playing, then the resume command will do nothing.
If the player is already on shuffle, then the shuffle command will put it back to un-shuffle.
 * @param {http.ServerResponse}     response    The http response stream created from http.createServer(req, res, callback)
 * @param {callback_function}       callback    The command to be sent to the spotify API.
 * Redirects the client back to the User Interface. So if the client manually enters the endpoint, the command will work just the same, but they will be redirected back.
 */
function simpleCommand(response, callback) { 
    callback().then(() => {
        response.statusCode = 204; // callback performed, no data returned.
        response.end()
    })
}

/**Takes one input, such as a string or integer, from the request stream, and uses that in the callback.
 * The input from the request stream is accessed by the name parameter provided.
 * @param {http.IncomingMessage}    request     The http request stream created from http.createServer(req, res, callback)
 * @param {http.ServerResponse}     response    The http response stream created from http.createServer(req, res, callback)
 * @param {callback_function}       callback    The command to be sent to the spotify API.
 * @param {string}                  name        The name of the property sent from the client
 * Redirects the client back to the User Interface. So if the client manually enters the endpoint, the command will work just the same, but they will be redirected back.
 */
function inputCommand(request, response, callback, name) {
    let json = null;
    request.on('data', (chunk) => {
        json = queryToJSON(chunk)
    })
    
    request.on('end', () => callback(json[name]))
    response.writeHead(302, {
        "Location": 'http://localhost:3000/player'
    })
    response.end()
}

function getBasicData(response, callback) {
    callback().then(data => {
        data = JSON.stringify(data);
        response.writeHead(200, {
            "Content-Type": "application/json",
            "Content-Length": Buffer.byteLength(data)
        })
        response.end(data)
    })
}

function callPlay(request, response, callback) {
    let json = null;
    request.on('data', (chunk) => {
        json = queryToJSON(chunk)
    })
    
    request.on('end', () => {
        let uriDetails = [];
        for (const key in json) {
            uriDetails.push(json[key])
        }
        const [uri, uriType] = uriDetails;
        callback(uriType, uri);
    })
    response.writeHead(302, {
        "Location": 'http://localhost:3000/player'
    })
    response.end()
}

function getData(response, name, callback) {
    callback()
        .then(data => {
            let obj = {}
            obj[name] = data
            const json = JSON.stringify(obj)
            response.writeHead(200, {
                "Content-Type": "application/json",
                "Content-Length": Buffer.byteLength(json)
            })
            response.end(json)
        })
}

function loadFile(res, path) {
    let file = __dirname + "/public" + path;
    fs.readFile(file, function(err, content) {
        if (err) {
            console.log(`File Not Found ${file}`);
            res.writeHead(404);
            res.end();
        }
        else {

            let mime = lookup(file)
            res.writeHead(200, { "Content-Type": mime });
            res.end(content);
        }
    })
}

const server = http.createServer((req, res) => {
    const url =  new URL(req.url, "http://localhost:3000");
    const path = url.pathname;

    if (path.includes('.')) {
        loadFile(res, path)
        return null;
    }

    switch(path) {
        case "/login":
            res.writeHead(302, {
                location: "https://accounts.spotify.com/authorize?client_id=" + client_id + "&response_type=code&redirect_uri=" +redirect_uri+ "&scope=" + scope
            })
            res.end()
            break;
        case "/callback":
            const code = url.searchParams.get('code')
            reqAccessToken(code)// gets access_token upon successful request
            res.writeHead(302, {
                location: "http://localhost:3000/player"
            })
            res.end()
            break;
        case "/player":
            res.writeHead(200, {
                "Content-Type": "text/html"
            })
            fs.createReadStream('public/app.html').pipe(res)
            break;
        case "/user":
            getBasicData(res, reqUser)
            break;
        case "/prev":
            simpleCommand(res, reqPrev)
            break;
        case "/next":
            simpleCommand(res, reqNext)
            break;
        case "/pause":
            simpleCommand(res, reqPause)
            break;
        case "/resume":
            simpleCommand(res, reqResume)
            break;
        case "/resume_or_pause":
            simpleCommand(res, doResumeOrPause);
            break;
        case "/play": 
            callPlay(req, res, reqPlay)
            break;
        case "/playback":
            getBasicData(res, getPlaybackState)
            break;
        case "/setVolume":
            inputCommand(req, res, reqVolume, "volume")
            break;
        case "/getVolume":
            getData(res, "volume", getVolumeLevel)
            break;
        case "/seek_to_position":
            inputCommand(req, res, reqSeek, "position")
            break;
        case "/repeat":
            simpleCommand(res, reqRepeat)
            break;
        case "/shuffle":
            simpleCommand(res, reqShuffle)
            break;
        case "/search":
            let query = null;
            req.on('data', (chunk) => {
                query = Buffer.from(chunk).toString();
            })
            req.on('end', ()=> {
                reqSearch(query).then(results=> {
                    results = Buffer.from(results).toString()
                    res.writeHead(200, {
                        "Content-Type": "application/json",
                        "Content-Length": Buffer.byteLength(results)
                    })
                    res.end(results)
                })
            })
            break;
        case "/search_playlist":
            let query2 = null;
            req.on('data', (chunk) => {
                query2 = Buffer.from(chunk).toString()
            })
            req.on('end', () => {
                getPlaylist(reqSearch, query2).then(data => {
                    data = JSON.stringify(data)
                    res.writeHead(200, {
                        "Content-Type": "application/json",
                        "Content-Length": Buffer.byteLength(data)
                    })
                    res.end(data)
                })
                .catch(err => {
                    res.writeHead(401, {
                        "Content-Type": "application/json",
                        "Content-Length": Buffer.byteLength("The search query did not work.")
                    })
                    res.end(err.toString())
                })
            })
            break;
        case "/liked_tracks_first_track":
            getBasicData(res, reqLikedTracksFirstTrack);
            break;
        case "/liked_tracks_contains":
            reqLikedTracksContains(url.searchParams.get('id')).then(data => {
                data = Buffer.from(data).toString();
                res.writeHead(200, {
                    "Content-Type": "application/json",
                    "Content-Length": Buffer.byteLength(data)
                })
                res.end(data)
            })
            break;
        case "/like_track": 
            reqLikeTrack(url.searchParams.get('id')).then( () => {
                res.statusCode = 204;
                res.end()
            })
            break;
        case "/remove_like_from_track":
            reqRemoveLikeFromTrack(url.searchParams.get('id')).then(() => {
                res.statusCode = 204;
                res.end()
            })
            break;
        case "/featured_playlist":
            getPlaylist(reqFeaturedPlaylist).then(playlist=>{
                playlist = JSON.stringify(playlist);
                res.writeHead(200, {
                    "Content-Type": "application/json",
                    "Content-Length": Buffer.byteLength(playlist)
                })
                res.end(playlist)
            })
            // getBasicData(res, getPlaylist(reqFeaturedPlaylist));
            break;
        case "/genres": // TO-DO -- refactor /genres, /top_genres, /top_tracks, /recent_artists, /featured_playlist. They all do the same thing.
            getBasicData(res, reqGenres);
            break;
        case "/top_genres":
            getBasicData(res, getTopGenres);
            break;
        case "/top_tracks":
            getBasicData(res, getTopTracks);
            break;
        case "/recent_artists":
            getBasicData(res, getRecentArtists);
            break;
        case "/devices":
            // reqAvailableDevices().then(data => {
            //     const devices = Buffer.from(data).toString();
            //     res.writeHead(200, {
            //         'Content-Type': 'application/json',
            //         "Content-Length": Buffer.byteLength(devices)
            //     })
            //     res.end(devices);
            // })
            getBasicData(res, reqAvailableDevices);
            break;
        case "/transfer_playback":
            inputCommand(req, res, reqTransferPlayback, "device_id")
            break;
        case "/share_track_by_email":
            reqUser().then(data =>{
                const html = url.searchParams.get('html')
                const recipient = url.searchParams.get('recipient')
                let transporter = nodemailer.createTransport({
                    host: "smtp-mail.outlook.com",
                    port: 587,
                    secure: false, // upgrade later with STARTTLS
                    tls: {
                        ciphers:'SSLv3'
                    },
                    auth: {
                        user: data.email,
                        pass:  process.env.EMAIL_PASSWORD
                    }
                });
    
                let mailOptions = {
                    from: `"${data.display_name}" <${data.email}>`, // sender address (who sends)
                    to: `${recipient}`, // list of receivers (who receives)
                    subject: 'I like this song on spotify', // Subject line
                    text: 'There would otherwise be a song here', // plaintext body
                    html: html // html body
                };
    
                transporter.sendMail(mailOptions, function(error, info){
                    if (error) {
                        console.log(error);
                    } else {
                        console.log('Email sent: ' + info.response);
                    }
                });
                res.statusCode = 200;
                res.end();
            })
            break;
        default:
            res.writeHead(404);
            res.write("<h1>Sorry, nothing found!<h1>");
            res.end();
    }
})

server.listen(3000)


