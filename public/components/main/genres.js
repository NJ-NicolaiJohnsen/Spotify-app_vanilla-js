import './genreButton.js'
import './title.js'
const genreButton = document.createElement('genre-button');

const template = document.createElement('template');

template.innerHTML = `
    <style>
        *{
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        :host(genres-elem) {
            flex: 0 0 calc(25% - 30px);
        }
    
        #genres {
            width: 100%;
        }

        #genres_wrap {
            flex-wrap: wrap;
            width: 100%;
            gap: 12px;
            margin-bottom: 24px;
            display: flex;
        }
        
        a {
            text-decoration: none;
            color: white;
        }
        
        #all_genres_btn {
            display: inline-block;
            width: 100%;
            padding: 22px;
            background: #1A1A1A;
            border-radius: 22px;
            text-align: center;
            transition: background 0.1s;
        }
        
        #all_genres_btn:hover {
            background: #262626;
        }
    </style>

    <section id="genres">
        <title-elem text="Genres"></title-elem>
        <div id="genres_wrap">
            
        </div>
        <a id="all_genres_btn" href="#">All Genres</a>
    </section>
`


class Genres extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({mode: 'open'})
        this.shadowRoot.appendChild(template.content.cloneNode(true))   
        
    }

    addButton(genre, playlistURL) {
        const genreBtn = genreButton.cloneNode(true);
        function capitalizeFirstLetter(string) {
            let strArr = string.split(' ')
            let capString = '';
            strArr.forEach(word => {
                capString += word.charAt(0).toUpperCase() + word.slice(1) + " ";
            })
            return capString;
        }
        genreBtn.setGenreName(capitalizeFirstLetter(genre))
        genreBtn.addLinkToGenre(playlistURL)
        this.shadowRoot.querySelector('#genres_wrap').appendChild(genreBtn);
    }

    connectedCallback() {
        const genres = new Promise((resolve, reject) => {
            const xhttp = new XMLHttpRequest();
            xhttp.onload = function() {
                
                resolve(JSON.parse(this.responseText))
            }
            xhttp.open("GET", 'http://localhost:3000/top_genres')
            xhttp.send();
        })
        genres.then(data=>{
            return data.map(genre => {
                return new Promise((resolve, reject) => {
                    const genreFixed = genre.replaceAll(" ", "%20").toLowerCase().replace("danish", "dansk");
                    let query = `q=genre=${genreFixed}&type=playlist&limit=1`
                    const xhttp = new XMLHttpRequest();
                    xhttp.onload = function() {
                        if (this.status === 200) {
                            let btnObj = new Object();
                            btnObj.genre = genre;
                            btnObj.playlistURL = JSON.parse(this.responseText).playlistURL;
                            resolve(btnObj)
                        }
                        else {
                            let btnObj = new Object();
                            btnObj.genre = genre;
                            btnObj.playlistURL = 'https://open.spotify.com/search'
                            reject(btnObj);
                        }
                    }
                    xhttp.open("POST", 'http://localhost:3000/search_playlist')
                    xhttp.send(query);
                })
            })
        })
        .then(playlists => {
            playlists.forEach(playlist => {
                playlist.then(data => {
                    this.addButton(data.genre, data.playlistURL)
                })
                .catch(err => {
                    console.error('The search failed');
                    this.addButton(err.genre, err.playlistURL)
                })
            })
        })
        
    }
}

window.customElements.define('genres-elem', Genres);