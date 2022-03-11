import './playButton.js'
const template = document.createElement('template');

template.innerHTML = `
    <style>
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        :host(user-favs-card) {
            flex-shrink: 0;

            flex-basis: calc(25% - 30px);
            aspect-ratio: 330/460;
            flex-grow: 0;
            z-index: 1;
        }
        
        a {
            text-decoration: none;
            color: white;
            overflow: hidden;
        }

        .user_favs_item {
            height: 100%;
            width: 100%;
            border-radius: 60px;
            padding: 36px;
            background-position: center;
            background-repeat: no-repeat;
            background-size: cover;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            position: relative;
            z-index: 10;
            overflow: hidden;
        }

        .user_favs_item::before {
            display: block;
            content: '';
            width: 120%;
            height: 120%;
            border-radius: 60px;
            mix-blend-mode: multiply;
            background: #95d0dd;
            position: absolute;
            z-index: -1;
            top: -10px;
            left: -10px;
        }

        .user_favs_item_details {
            width: 100%;
            display: flex;
            align-items:center;
            
        }

        play-button {
            margin-right: 20px;
        }

        .playlist_detail {
            text-shadow: 1px 1px 10px black;
            font-size: 16px;
        }

        .title {
            font-size: 18px;
            font-weight: 500;
            
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
        }

        .description {
            font-size: 15px;
            color: var(--font-color-shaded);
            
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
        }
    </style>

    <div class="user_favs_item">
        <span class="playlist_detail"></span>
        <div class="user_favs_item_details">
            <!-- <play-button color="spotify-green" state="paused"> </play-button> is going to be inserted here via JS -->
            <a target="_blank" href="#">
                <p class="title"></p>
                <p class="description"></p>
            </a>
        </div>
    </div>
`
// user_favs_item background-image
// playlist_detail
// title
// description

class UserFavsCard extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({mode: 'open'})
        this.shadowRoot.appendChild(template.content.cloneNode(true))
        this.btn = null;
        this.insertButton();
    }

    insertButton() {
        const container =  this.shadowRoot.querySelector('.user_favs_item_details');
        const containerFirstChild = container.firstChild;
        const btn = document.createElement('play-button');
        btn.setAttribute('color', 'spotify-green');
        btn.setState(false);
        container.insertBefore(btn, containerFirstChild);
        this.btn = btn;
    }

    addBackgroundImage(img) {
        this.shadowRoot.querySelector('.user_favs_item').style.backgroundImage = `url('${img}')`;
    }

    addPlaylistDetail(detail) { // detail can be the number of tracks in a playlist, or the number of followers on a playlist, radio or genre.
        this.shadowRoot.querySelector('.playlist_detail').textContent = detail;
    }

    strip(html){
        let doc = new DOMParser().parseFromString(html, 'text/html');
        return doc.body.textContent || "";
    
    }
    addTitle(title) {
        const newTitle = this.strip(title);
        this.shadowRoot.querySelector('.title').textContent = newTitle;
        this.shadowRoot.querySelector('.title').setAttribute('title', newTitle);
    }

    addDescription(description) {
        const newDescription = this.strip(description)
        this.shadowRoot.querySelector('.description').textContent = newDescription;
        this.shadowRoot.querySelector('.description').setAttribute('title', newDescription);
    }

    addLinkToPlaylist(link) {
        this.shadowRoot.querySelector('a').setAttribute('href', link);
    }

    addButtonPlaylistID(playlistURI) {
        this.btn.playPlaylist(playlistURI)
    }

    addButtonTrackURI(trackURI) {
        this.btn.playTrack(trackURI)
    }

}

window.customElements.define('user-favs-card', UserFavsCard);