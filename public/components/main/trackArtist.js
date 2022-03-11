const template = document.createElement('template')

template.innerHTML = `
    <style>
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        :host(track-artist) {
            display: block;
            max-width: 100%:
            min-width: 200px;
        }
        
        a {
            text-decoration: none;
            color: inherit;
        }

        .artist_name:hover, .track_name:hover {
            text-decoration: underline;
        }
        
        .artist_name {
            font-size: 18px;
            margin-bottom: 5px;
            display: block;
            width: 100%;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .track_details {
            flex: 1 1 200px;
        }

        .track_name {
            font-size: 14px;
            opacity: 70%;
            display: block;
            width: 100%;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .artist_details {
            width: 100%;
            display: flex;
            align-items: center;
        }

        #artist_details_img {
            flex: 0 0 auto;
            width: 60px;
            height: 60px;
            margin-right: 15px;
        }

        #artist_details_img img {
            width: 100%;
            height: 100%;
            border-radius: 20px;
        }

    </style>

    <div class="artist_details">
        <a target="_blank" id="artist_details_img" ><img src="./jan-blomqvist.jpg" alt="Artist"></a>
        <div class="track_details">
            <a target="_blank" class="artist_name">Jan Blomqvist</a>
            <a target="_blank" class="track_name">The Space In Between</a>
        </div>
    </div>
`

class TrackArtist extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({mode: 'open'})
        this.shadowRoot.appendChild(template.content.cloneNode(true))
    }

    addImgSrc(src) {
        this.shadowRoot.querySelector('#artist_details_img img').setAttribute('src', src);
    }

    addAlbumLink(href) {
        this.shadowRoot.querySelector('#artist_details_img').setAttribute('href', href);
    }

    addTrackName(name) {
        this.shadowRoot.querySelector('.track_name').textContent = name;
        this.shadowRoot.querySelector('.track_name').setAttribute('title', name)
    }

    addArtistName(name) {
        this.shadowRoot.querySelector('.artist_name').textContent = name;
        this.shadowRoot.querySelector('.artist_name').setAttribute('title', name);
    }

    addTrackLink(href) {
        this.shadowRoot.querySelector('.track_name').setAttribute('href', href);
    }

    addArtistLink(href) {
        this.shadowRoot.querySelector('.artist_name').setAttribute('href', href);
    }
}

window.customElements.define('track-artist', TrackArtist);