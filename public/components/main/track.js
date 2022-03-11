import './playButton.js';
import '../player/likedTracks.js';
import './trackArtist.js';
const template = document.createElement('template')

template.innerHTML = `
    <style>
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        .tracks_of_the_week_item {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 40px;
            border-radius: 30px;
        }

        .tracks_of_the_week_item:hover {
            background: #1a1a1a;
        }

        .tracks_of_the_week_item > div {
            display: flex;
            align-items: center;
        }

        .play_like_wrap {
            display: flex;
            align-items: center;
            background: #0D0D0D;
            border: 1px solid #313131;
            border-radius: 30px;
        }

        .like_track {
            width: 60px;
            height: 60px;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .tracks_of_the_week_item .play_song {
            cursor: pointer;
            background: transparent;
            border: 1px solid #6E6E6E;
        }

        .pause_song {
            background: var(--spotify-green);
            border: none;
        }

        .no_of_plays {
            margin-right: 15px;
        }

        .last-track {
            margin-bottom: 0;
        }

    </style>

    <div class="tracks_of_the_week_item">
        <div id="track_artist"></div>
        <div>
            <span class="no_of_plays"><slot name='no_of_plays'></slot></span>
            <div class="play_like_wrap">
                <span class="like_track">
                    
                </span>
                
            </div>
        </div>
    </div>
`
// TO-DO -- Number of plays in the element needs to be implemented.
class Track extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({mode: 'open'})
        this.shadowRoot.appendChild(template.content.cloneNode(true))
    }

    isLastTrack(){
        if (this.getAttribute('lasttrack')) {
            this.shadowRoot.querySelector('.tracks_of_the_week_item').classList.add('last-track');
        }
        else {
            this.shadowRoot.querySelector('.tracks_of_the_week_item').classList.remove('last-track');
        }
    }

    addPlayButton() {
        const container = this.shadowRoot.querySelector('.play_like_wrap')
        const trackID = this.getAttribute('trackURI');
        const btn = document.createElement('play-button')
        btn.setAttribute('color', 'dark');
        btn.setState(false);
        btn.setAttribute('switchTheme', true)
        btn.playTrack(trackID);
        container.appendChild(btn);
    }

    addLikeTrackButton() {
        const likeBtn = document.createElement('liked-track');
        likeBtn.setTrack(this.getAttribute('trackID'));
        this.shadowRoot.querySelector('.like_track').appendChild(likeBtn);
    }

    connectedCallback() {
        const trackArtist = document.createElement('track-artist');
        trackArtist.addImgSrc(this.getAttribute('imgsrc'));
        trackArtist.addAlbumLink(this.getAttribute('albumURL'));
        trackArtist.addTrackName(this.getAttribute('trackName'));
        trackArtist.addArtistName(this.getAttribute('artistName'));
        trackArtist.addTrackLink(this.getAttribute('trackURL'));
        trackArtist.addArtistLink(this.getAttribute('artistURL'));
        this.isLastTrack();
        this.shadowRoot.querySelector('#track_artist').appendChild(trackArtist);
        this.addPlayButton()
        this.addLikeTrackButton();
    }
}

window.customElements.define('track-elem', Track);