import './user-favs-card.js';

const template = document.createElement('template')

template.innerHTML = `
    <style>
        * {
            box-sizing: border-box;
            padding: 0;
            margin: 0;
        }

        #user_favs {
            margin-top: 36px;
            width: 100%;
            flex-wrap: no-wrap;
            display: flex;
            gap: 30px;
        }
    </style>


    <section id="user_favs">
        
    </section>
`


class UserFavs extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({mode: 'open'})
        this.shadowRoot.appendChild(template.content.cloneNode(true))
        this.addReleaseRadar();
        this.addDailyMix();
        this.addLikedSongs();
        this.addPersonalGenre();
    }

    addCard(playlist, uriType) {
        const card = document.createElement('user-favs-card');
        card.addBackgroundImage(playlist.imageURL);
        card.addTitle(playlist.name);
        card.addPlaylistDetail(playlist.totalTracks + " Tracks");
        card.addDescription(playlist.description);
        card.addLinkToPlaylist(playlist.playlistURL);
        if (uriType === 'playlist') {
            card.addButtonPlaylistID(playlist.playlistURI);
        }
        else if (uriType === 'track') {
            card.addButtonTrackURI(playlist.playlistURI);
        }
        
        this.shadowRoot.querySelector('#user_favs').appendChild(card)
    }

    //Each of the below 4 methods are going to make a request to the server, in order to get information about liked songs, new relesed songs, daily mixes and most played genres.
    addReleaseRadar() { // Displays the user's 1st featured playlist.
        const data = new Promise((resolve, reject) => {
            const xhttp = new XMLHttpRequest();
            xhttp.onload = function() {
                resolve(JSON.parse(this.responseText))                
            }
            xhttp.open("GET", 'http://localhost:3000/featured_playlist')
            xhttp.send();
        })
        data.then(playlist => {this.addCard(playlist, 'playlist')})        
    }

    addDailyMix() {
        const data = new Promise((resolve, reject) => {
            const xhttp = new XMLHttpRequest();
            xhttp.onload = function() {
                resolve(JSON.parse(this.responseText))                
            }
            xhttp.open("POST", 'http://localhost:3000/search_playlist')
            xhttp.send(`q=discover%20weekly&type=playlist&market=DK&limit=1`);
        })
        data.then(playlist=> {this.addCard(playlist, 'playlist')})
        
    }

    addLikedSongs() {
        const data = new Promise((resolve, reject) => {
            const xhttp = new XMLHttpRequest();
            xhttp.onload = function() {
                resolve(JSON.parse(this.responseText))                
            }
            xhttp.open("GET", 'http://localhost:3000/liked_tracks_first_track')
            xhttp.send();
        })
        data.then(playlist => {this.addCard(playlist, 'track')})
    }

    addPersonalGenre() { // displays the user's most listened to genre, using the spotify api search endpoint.
        const data = new Promise((resolve, reject) => { // 1. get the top genre from the server.
            const xhttp = new XMLHttpRequest();
            xhttp.onload = function() {
                resolve(JSON.parse(this.responseText))                
            }
            xhttp.open("GET", 'http://localhost:3000/top_genres')
            xhttp.send();
        })

        function doFuckingSearch(genres, n) {
            return new Promise((resolve, reject) => { // 2. get the search result from the server.
                const genreFixed = genres[n].replaceAll(" ", "%20").toLowerCase().replace("danish", "dansk");   // replace all spaces with the url-encoded space, %20.
                            // make the string lower case,
                            // replace instances of danish with dansk, because the spotify's search endpoint cant handle a country specific search in english.
                const xhttp = new XMLHttpRequest();
                xhttp.onload = function() {
                    if (this.status > 300) {
                        n++;
                        resolve(doFuckingSearch(genres, n))
                    }
                    else {
                        resolve(JSON.parse(this.responseText))
                    }
                }
                xhttp.open("POST", 'http://localhost:3000/search_playlist')
                xhttp.send(`q=genre=${genreFixed}&type=playlist&market=DK&limit=1`);
            })
        }

        data.then(genres => {
            return doFuckingSearch(genres, 0)
        })
        .then(playlist => {
            this.addCard(playlist, 'playlist')
        })

    }
}

window.customElements.define('user-favs', UserFavs);