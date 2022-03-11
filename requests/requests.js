const https = require('https')
const dotenv = require('dotenv')
dotenv.config();

const redirect_uri = "http://localhost:3000/callback"
const scope = "user-read-private user-read-playback-state user-modify-playback-state user-top-read user-library-read user-library-modify user-read-email"
const client_id = process.env.SPOTIFY_CLIENT_ID
const client_secret = process.env.SPOTIFY_CLIENT_SECRET
let accessData = null

function saveData(data) {
    accessData = data;
}

function sendReq(options, postData = null) {
    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            if (res.statusCode < 200 || res.statusCode >= 300) {
                return reject(new Error(res.statusCode + " " + res.statusMessage))
            }
            res.setEncoding('utf-8')
            let data = [];
            res.on('data', (chunk) => {
                data.push(Buffer.from(chunk))
            })
            res.on('end', () => {
                try {
                    data = Buffer.concat(data)
                }
                catch (err) {
                    reject(err)
                }
                resolve(data)
            })
        })

        req.on('error', (err) => {
            console.log(err)
            reject(err)
        })
        if (postData) {req.write(postData) }
        req.end()
    })
}

/* Get access token by making a POST request to the /api/token endpoint >>> 
 https://accounts.spotify.com/api/token */
function reqAccessToken(code) {
    const body = `code=${code}&redirect_uri=${redirect_uri}&grant_type=authorization_code`  

    const options = {
        hostname: "accounts.spotify.com",
        port: 443,
        timeout: 10000,
        path: "/api/token",
        method: "POST",
        headers: {
            "Authorization": "Basic " + Buffer.from(client_id + ':' + client_secret).toString('base64'),
            "Content-Type": "application/x-www-form-urlencoded",
            "Content-Length": Buffer.byteLength(body)
        }
    }
    saveData(sendReq(options, body)
            .then(data => JSON.parse(data))
            .catch(err => console.error(err))
        )
}


function reqUser() {
    return accessData.then(data => {
        const options = {
            hostname: "api.spotify.com",
            port: 443,
            path: "/v1/me",
            method: "GET",
            headers: {
                "Authorization": "Bearer " + data.access_token,
                "Content-Type": "application/json"
            }
        }
        return sendReq(options)
        .then( userData => {
            return JSON.parse(userData.toString())
        });
    })
    
}

function reqPrev() {
    return accessData.then(data => {
        const options = {
            hostname: "api.spotify.com",
            port: 443,
            timeout: 10000,
            path: '/v1/me/player/previous',
            method: 'POST',
            headers: {
                "Authorization": "Bearer " + data.access_token,
                "Content-Type": "application/json",
            }
        }
        return sendReq(options)
    })
}

function reqNext() {
    return accessData.then(data => {
        const options = {
            hostname: "api.spotify.com",
            port: 443,
            timeout: 10000,
            path: '/v1/me/player/next',
            method: 'POST',
            headers: {
                "Authorization": "Bearer " + data.access_token,
                "Content-Type": "application/json",
            }
        }
        return sendReq(options)
    })
}

function reqPause() {
    function pause() {
        return accessData.then(data => {
            const options = {
                hostname: "api.spotify.com",
                port: 443,
                timeout: 10000,
                path: '/v1/me/player/pause',
                method: 'PUT',
                headers: {
                    "Authorization": "Bearer " + data.access_token,
                    "Content-Type": "application/json",
                }
            }
            return sendReq(options);
        })
    }

    return reqPlaybackState().then(playbackState => {
        const playbackJSON = JSON.parse(playbackState.toString())
        const isPlaying = playbackJSON.is_playing
        if (isPlaying) { return pause() }
    })
}

function reqResume() {
    function resume() {
        return accessData.then(data => {
            const options = {
                hostname: "api.spotify.com",
                port: 443,
                timeout: 10000,
                path: '/v1/me/player/play',
                method: 'PUT',
                headers: {
                    "Authorization": "Bearer " + data.access_token,
                    "Content-Type": "application/json",
                }
            }
            return sendReq(options);
        })
    }
    return reqPlaybackState().then(playbackState => {
        const playbackJSON = JSON.parse(playbackState.toString())
        const isPlaying = playbackJSON.is_playing
        if (!isPlaying) { return resume() }
    })
}

function doResumeOrPause() {
    return reqPlaybackState().then(playbackState => {
        const playbackJSON = JSON.parse(playbackState.toString())
        const isPlaying = playbackJSON.is_playing
        if (isPlaying) { return reqPause(); }
        else {return reqResume();}

    })
}

function reqPlay(uriType, uri) {
    accessData.then(data => {
        let body;
        if (uriType === 'track') {
            body = `{
                "uris": ["${uri}"],
                "position_ms": 0
            }`
        }
        else if (uriType === 'playlist') {
            body = `{
                "context_uri": "${uri}",
                "position_ms": 0
            }`
        }

        const options = {
            hostname: "api.spotify.com",
            port: 443,
            timeout: 10000,
            path: '/v1/me/player/play',
            method: 'PUT',
            headers: {
                "Authorization": "Bearer " + data.access_token,
                "Content-Type": "application/json",
                "Content-Length": Buffer.byteLength(body)
            }
        }
        sendReq(options, body);
    })
}

function reqVolume(volumePercent) {
    accessData.then(data => {
        const options = {
            hostname: "api.spotify.com",
            port: 443,
            timeout: 10000,
            path: `/v1/me/player/volume?volume_percent=${volumePercent}`,
            method: 'PUT',
            headers: {
                "Authorization": "Bearer " + data.access_token,
                "Content-Type": "application/json",
            }
        }
        sendReq(options)
    })
}

function getVolumeLevel() {
    return reqPlaybackState().then(playbackState => {
        const playbackJSON = JSON.parse(playbackState.toString())
        const volumeLevel = playbackJSON.device.volume_percent;
        return volumeLevel;
    })
}

function reqPlaybackState() {
    return accessData.then(data => {
        const options = {
            hostname: "api.spotify.com",
            port: 443,
            path: "/v1/me/player",
            method: "GET",
            headers: {
                "Authorization": "Bearer " + data.access_token,
                "Content-Type": "application/json"
            }
        }
        return sendReq(options)
    })
}

function getPlaybackState() {
    return reqPlaybackState().then(data=> {
        data = JSON.parse(data.toString());
        let playback = {
            isPlaying: data.is_playing,
            shuffleState: data.shuffle_state,
            repeatState: data.repeat_state,
            volume: data.device.volume_percent,
            deviceID: data.device.id,
            isActive: data.device.is_active,
            trackProgress: data.progress_ms,
            trackDuration: data.item.duration_ms,
            trackName: data.item.name,
            playbackType: data.item.type,
            trackURI: data.item.uri,
            trackID: data.item.id,
            trackURL: data.item.external_urls.spotify,
            albumImage: data.item.album.images[2].url,
            albumURL: data.item.album.external_urls.spotify,
            artistURL: data.item.artists[0].external_urls.spotify,
            artistName: data.item.artists[0].name,
        }
        return playback
    })
}

function reqSeek(position) {
    position = Math.floor(position);
    accessData.then(data => {
        const options = {
            hostname: "api.spotify.com",
            port: 443,
            timeout: 10000,
            path: `/v1/me/player/seek?position_ms=${position}`,
            method: 'PUT',
            headers: {
                "Authorization": "Bearer " + data.access_token,
                "Content-Type": "application/json",
            }
        }
        sendReq(options)
    })
}

function reqRepeat() {
    function repeat(state) {
        accessData.then(data => {
            const options = {
                hostname: "api.spotify.com",
                port: 443,
                timeout: 10000,
                path: `/v1/me/player/repeat?state=${state}`,
                method: 'PUT',
                headers: {
                    "Authorization": "Bearer " + data.access_token,
                    "Content-Type": "application/json",
                }
            }
            sendReq(options)
        })
    }
    reqPlaybackState()
    .then(data => {
        if (JSON.parse(data.toString()).repeat_state === "off") {
            repeat("track")
        } else { repeat("off") }
    })
}

function reqShuffle() {
    function repeat(state) {
        accessData.then(data => {
            const options = {
                hostname: "api.spotify.com",
                port: 443,
                timeout: 10000,
                path: `/v1/me/player/shuffle?state=${state}`,
                method: 'PUT',
                headers: {
                    "Authorization": "Bearer " + data.access_token,
                    "Content-Type": "application/json",
                }
            }
            sendReq(options)
        })
    }
    reqPlaybackState()
    .then(data => {
        if (JSON.parse(data.toString()).shuffle_state) {
            repeat("false")
        } else { repeat("true") }
    })
}

function reqGenres() {
    return accessData.then(data => {
            const options = {
                hostname: "api.spotify.com",
                port: 443,
                timeout: 10000,
                path: "/v1/recommendations/available-genre-seeds",
                method: 'GET',
                headers: {
                    "Authorization": "Bearer " + data.access_token,
                    "Content-Type": "application/json",
                }
            }
            return sendReq(options).then(data=>JSON.parse(Buffer.from(data).toString()))
        })
}

/**
 * 
 * @param {String} time_range   the time range from which we can choose. short_term, medium_term or long_term.
 * @param {Integer} limit       The amount of artists returned. Defaults to 50.
 * @returns A request to the spotify api. If successfull, the response the top artists of the given time_range, limited to the given limit.
 */
function reqTopArtists(time_range, limit = 50) {
    return accessData.then(data => {
        const options = {
            hostname: "api.spotify.com",
            port: 443,
            timeout: 10000,
            path: `/v1/me/top/artists?time_range=${time_range}&limit=${limit}&offset=0`,
            method: 'GET',
            headers: {
                "Authorization": "Bearer " + data.access_token,
                "Content-Type": "application/json",
            }
        }
        return sendReq(options)
    })
}

function reqTopTracks(time_range, limit = 50) { // of the last 4 weeks
    return accessData.then(data => {
        const options = {
            hostname: "api.spotify.com",
            port: 443,
            timeout: 10000,
            path: `/v1/me/top/tracks?time_range=${time_range}&limit=${limit}&offset=0`,
            method: 'GET',
            headers: {
                "Authorization": "Bearer " + data.access_token,
                "Content-Type": "application/json",
            }
        }
        return sendReq(options)
    })
}


function getTopGenres() {
    return reqTopArtists("medium_term").then(topItems => {
        let data = JSON.parse(topItems.toString())
        let genres = [];
        data.items.forEach((item) => {
            if (item.genres[0] !== undefined) {
                item.genres.forEach(genre => {
                    genres.push(genre)
                })
            }
        })
        let occ = new Map() // occurences of a genres
        genres.forEach(item => {
            if (occ.has(item)) {
                let occurences = occ.get(item)
                occ.set(item, ++occurences)
            }
            else {
                occ.set(item, 1)
            }
        })

        function sort(arr, map) {
            let max = 0;
            let maxKey = '';
            for (const [key, value] of map) {
                if (value > max) {
                    max = map.get(key);
                    maxKey = key;
                }
            }
            arr.push(maxKey);
            map.delete(maxKey);
            if (map.size === 0) {
                return arr
            }
            return sort(arr, map);
        }
        let sortedGenres = sort(new Array(), occ);
        sortedGenres.splice(10, sortedGenres.length);
        return sortedGenres;
    }).catch(err => {console.error(err)})
}

function getTopTracks() {
    return reqTopTracks("short_term", 5).then(data => {
        data = JSON.parse(data).items;
        let tracks = data.map(track => {
            return {
                name: track.name,
                artist: track.artists[0].name,
                artistURL: track.artists[0].external_urls.spotify,
                img: track.album.images[2].url,
                albumURL: track.album.external_urls.spotify,
                trackURI: track.uri,
                trackID: track.id,
                trackURL: track.external_urls.spotify,
            }
        })
        return tracks;
    })
}

function getRecentArtists() {
    return reqTopArtists('short_term', 8).then(data => {
        const artists = JSON.parse(Buffer.from(data).toString());
        const arr = artists.items.map(artist => {
            return {
                url: artist.external_urls.spotify,
                img: artist.images[2].url
            }
        })
        return arr
    })
}

function reqFeaturedPlaylist() {
    return accessData.then(data => {
        const options = { // get spotify's featured playlists, limited to 1, in the DK region.
            hostname: "api.spotify.com",
            port: 443,
            timeout: 10000,
            path: "/v1/browse/featured-playlists?country=DK&locale=da_dk&limit=1&offset=0",
            method: 'GET',
            headers: {
                "Authorization": "Bearer " + data.access_token,
                "Content-Type": "application/json",
            }
        }
        return sendReq(options)
    })
}

function getPlaylist(callback, query = null) {
    return callback(query).then(data => {
        data = JSON.parse(Buffer.from(data).toString())
        const playlist = {
            name: data.playlists.items[0].name,
            description: decodeURI(data.playlists.items[0].description), //TO-DO -- unescape html entities and encoded URI's. Decode them.
            totalTracks: data.playlists.items[0].tracks.total,
            playlistURL: data.playlists.items[0].external_urls.spotify,
            imageURL: data.playlists.items[0].images[0].url,
            playlistURI: data.playlists.items[0].uri
        }
        return playlist
    }).catch(err => console.error(err))
}

function reqSearch(query) {
    return accessData.then(data => {
        const options = {
            hostname: "api.spotify.com",
            port: 443,
            timeout: 10000,
            path: `/v1/search?${query}`,
            method: 'GET',
            headers: {
                "Authorization": "Bearer " + data.access_token,
                "Content-Type": "application/json",
            }
        }
        return sendReq(options)
    })
}

function reqLikedTracksFirstTrack() {
    return accessData.then(data => {
        const options = {
            hostname: "api.spotify.com",
            port: 443,
            timeout: 10000,
            path: `/v1/me/tracks`,
            method: 'GET',
            headers: {
                "Authorization": "Bearer " + data.access_token,
                "Content-Type": "application/json",
            }
        }
        return sendReq(options)
    })
    .then(data => { // I cannot figure out how to make this a playlist, so i am just going to use the first track in the list of tracks.
        data = JSON.parse(Buffer.from(data).toString())
        const track = {
            name: "Gemte sange",
            description: 'Alle dine gamle favoritter TM',
            totalTracks: data.total,
            playlistURL: data.items[0].track.external_urls.spotify,
            imageURL: data.items[0].track.album.images[1].url,
            playlistURI: data.items[0].track.uri
        }
        return track
    })
}

function reqLikedTracksContains(id) {
    return accessData.then(data => {
        const options = {
            hostname: "api.spotify.com",
            port: 443,
            timeout: 10000,
            path: `/v1/me/tracks/contains?ids=${id}`,
            method: 'GET',
            headers: {
                "Authorization": "Bearer " + data.access_token,
                "Content-Type": "application/json",
            }
        }
        return sendReq(options)
    })
}

function reqLikeTrack(id) { // add track to liked songs
    return accessData.then(data => {
        const options = {
            hostname: "api.spotify.com",
            port: 443,
            timeout: 10000,
            path: `/v1/me/tracks?ids=${id}`,
            method: 'PUT',
            headers: {
                "Authorization": "Bearer " + data.access_token,
                "Content-Type": "application/json",
            }
        }
        return sendReq(options)
    })
}

function reqRemoveLikeFromTrack(id) { // add track to liked songs
    return accessData.then(data => {
        const options = {
            hostname: "api.spotify.com",
            port: 443,
            timeout: 10000,
            path: `/v1/me/tracks?ids=${id}`,
            method: 'DELETE',
            headers: {
                "Authorization": "Bearer " + data.access_token,
                "Content-Type": "application/json",
            }
        }
        return sendReq(options)
    })
}

function reqAvailableDevices() {
    return accessData.then(data => {
        const options = {
            hostname: "api.spotify.com",
            port: 443,
            timeout: 10000,
            path: `/v1/me/player/devices`,
            method: 'GET',
            headers: {
                "Authorization": "Bearer " + data.access_token,
                "Content-Type": "application/json",
            }
        }
        return sendReq(options).then(buf => JSON.parse(Buffer.from(buf).toString()))
    })
}

function reqTransferPlayback(deviceID) {
    const body = {
        device_ids: [
            deviceID
        ]
    }

    return accessData.then(data => {
        const options = {
            hostname: "api.spotify.com",
            port: 443,
            timeout: 10000,
            path: `/v1/me/player`,
            method: 'PUT',
            headers: {
                "Authorization": "Bearer " + data.access_token,
                "Content-Type": "application/json",
            }
        }
        return sendReq(options, JSON.stringify(body))
    })
}

module.exports = {
                redirect_uri,
                scope, 
                client_id, 
                client_secret,
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
                reqFeaturedPlaylist,
                reqSearch,
                getPlaylist,
                reqLikedTracksContains,
                reqLikedTracksFirstTrack,
                reqRemoveLikeFromTrack,
                reqLikeTrack,
                getPlaybackState,
                doResumeOrPause,
                reqAvailableDevices,
                reqTransferPlayback,
            };