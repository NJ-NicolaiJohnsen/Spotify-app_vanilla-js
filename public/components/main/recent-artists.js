import './artist.js'
import './title.js'
const template = document.createElement('template');
template.innerHTML = `
    <style>
        * {
            padding: 0;
            margin: 0;
            box-sizing: border-box;
        }

        :host(recent-artists) {
            flex: 0 0 calc(25% - 30px);
        }

        #recent-artists {
            display: grid;
            grid-gap: 10px;
            grid-template-columns: 1fr 1fr;
            border-radius: 25px;
            overflow: hidden;
        }
    </style>
    
    <section>
        <title-elem text="Recent artists"></title-elem>
        <div id="recent-artists">
            
        </div>
    </section>
    
`


class RecentArtist extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({mode: 'open'})
        this.shadowRoot.appendChild(template.content.cloneNode(true))
    }

    connectedCallback() {
        const artists = new Promise((resolve, reject) => {
            const xhttp = new XMLHttpRequest();
            xhttp.onload = function() {
                resolve(JSON.parse(this.responseText))
            }
            xhttp.open("GET", 'http://localhost:3000/recent_artists')
            xhttp.send();
        })
        artists.then(data => {
            this.makeArtistElem(data)
        })
    }

    makeArtistElem(artists) {
        const recent_artists = this.shadowRoot.querySelector('#recent-artists');
        artists.forEach(artist => {
            const elem = document.createElement('artist-elem');
            elem.setAttribute('imgsrc', artist.img);
            elem.setAttribute('spotifyURL', artist.url);
            recent_artists.appendChild(elem);
        })
    }
}



window.customElements.define('recent-artists', RecentArtist);