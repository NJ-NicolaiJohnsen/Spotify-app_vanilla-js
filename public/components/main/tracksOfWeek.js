import './track.js';
import './title.js';
const template = document.createElement('template')

template.innerHTML = `
    <style>
        * {
                box-sizing: border-box;
                margin: 0;
                padding: 0;
        }

        :host(tracks-of-week) {
            flex: 0 0 calc(50% - 30px);
        }
        
        .tracks_of_the_week_wrap {
            background-color: #0D0D0D;
            border: 1px solid #313131;
            border-radius: 22px;
            padding: 36px;
        }

    </style>

    <section id="tracks_of_the_week">
        <title-elem text="Tracks of the Week"></title-elem>
        <div class="tracks_of_the_week_wrap">

        </div>
    </section>
`

class TracksOfWeek extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({mode: 'open'})
        this.shadowRoot.appendChild(template.content.cloneNode(true))
    }

    connectedCallback() {
        const tracks = new Promise((resolve, reject) => {
            const xhttp = new XMLHttpRequest();
            xhttp.onload = function() {
                resolve(JSON.parse(this.responseText))
            }
            xhttp.open("GET", 'http://localhost:3000/top_tracks')
            xhttp.send();
        })
        tracks.then(data => {
            this.makeTrackElem(data)
        })
    }

    makeTrackElem(tracks) {
        const container = this.shadowRoot.querySelector('.tracks_of_the_week_wrap');
        tracks.forEach((track, index) => {
            const trackElem = document.createElement('track-elem');
            trackElem.setAttribute('imgsrc', track.img)
            trackElem.setAttribute('trackName', track.name);
            trackElem.setAttribute('artistName', track.artist);
            trackElem.setAttribute('trackURI', track.trackURI);
            trackElem.setAttribute('trackID', track.trackID);
            trackElem.setAttribute('artistURL', track.artistURL);
            trackElem.setAttribute('albumURL', track.albumURL);
            trackElem.setAttribute('trackURL', track.trackURL);
            if (index+1 === tracks.length) {
                trackElem.setAttribute('lasttrack', 1);
            }
            container.appendChild(trackElem);
        })
    }
}

window.customElements.define('tracks-of-week', TracksOfWeek);