import '../main/trackArtist.js';
import './controls.js';
import './progressBar.js';
import './volume.js';
import './likedTracks.js';
import './switchDevice.js';
import './share.js';

const template = document.createElement('template')

template.innerHTML = `
    <style>
        * {
            box-sizing: border-box;
            padding: 0;
            margin: 0;
        }

        :host(player-elem) {
            position:absolute;
            bottom: 0;
            left: 0;
            right: 0;
            height: 108px;
            background: #212121;
            border-top-right-radius: 25px;
            border-top-left-radius: 25px;

        }

        #player_wrap {
            width: 100%;
            height: 100%;
            padding: 0 35px;
        }

        #player {
            height: 108px;
            width: 100%;
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            grid-gap: 110px;
        }

        .grid_item {
            display: flex;
            align-items: center;
            justify-content: space-between;
            height: 100%;
            width: 100%;
        }

        #controls {
            margin-left: 60px;
        }

        #options {
            width: 20px;
            height: 20px;
            cursor: pointer;
        }

        #options img {
            width: 100%;
            height: 100%;
            filter: brightness(1);
            transition: filter 0.2s;
            transform: rotate(90deg) scale(1.5);
        }

        #options img:hover {
            filter: brightness(2);
        }

        #last_part {
            margin-left: 30px;
            max-width: 250px;
        }

        

    </style>


    <section id="player_wrap">
        <div id="player">
            <div class="grid_item">
                <div id="track_artist"></div>
                <div id="controls"></div>
            </div>
            <div class="grid_item" id="progress_bar"></div>
            <div class="grid_item">
                <div id="volume"></div>
                <div id="last_part" class="grid_item">
                    <div id="liked_tracks"></div>
                    <div id="switch_device"></div>
                    <div id="share_track"></div>
                    <div id="options"><img src="logos/option.png"></div>
                </div>
            </div>
        </div>
    </section>
`

// TO-DO -- Layout: How much space inbetween all elements.
// TO-DO -- trackArtist needs to fully implemented. It is only showing default information right now.

class Player extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({mode: 'open'})
        this.shadowRoot.appendChild(template.content.cloneNode(true))
        this.playback = this.getPlayback();
        this.trackArtist = null;
        this.controls = null;
        this.progressbar = null;
        this.state = null; // state = 'playing' || 'paused'
        this.playback.then(playback => {
            this.addTrackArtist(playback);
            this.addControls(playback);
            this.addProgressBar(playback);
            this.addVolume(playback)
            this.addLikedTrack(playback);
            this.addSwitchDevice(playback);
            this.addShareTrack(playback);
        })

        setInterval(()=> {
            console.log('updating at interval')
            this.updateAll();
        }, 15000)
    }
    // TO-DO -- Make field variables in all the components of all the relevant information.
    getPlayback() {
        return new Promise((resolve, reject) => {
            const xhttp = new XMLHttpRequest();
            xhttp.onload = function() {
                resolve(JSON.parse(this.responseText));
            }
            xhttp.open("GET", 'http://localhost:3000/playback');
            xhttp.send();
        })
    }

    updateAll() {
        setTimeout(()=>{ // Have to wait until the request to the api is processed
            this.getPlayback().then(playback => {
                this.updateTrackArtist(playback);
                this.updateControls(playback);
                this.updateProgressBar(playback);
                this.updateVolume(playback);
                this.updateLikedTrack(playback);
                this.updateShareTrack(playback);
            });
        }, 200)
    }

    stateChanged(state) {
        this.state = state;
        this.progressbar.setState(state)
    }

    addTrackArtist(playback) {
        const trackArtist = document.createElement('track-artist');
        trackArtist.addImgSrc(playback.albumImage);
        trackArtist.addAlbumLink(playback.albumURL);
        trackArtist.addTrackName(playback.trackName);
        trackArtist.addArtistName(playback.artistName);
        trackArtist.addTrackLink(playback.trackURL);
        trackArtist.addArtistLink(playback.artistURL);
        this.trackArtist = trackArtist;
        this.shadowRoot.querySelector('#track_artist').appendChild(trackArtist);
    }

    updateTrackArtist(playback) {
        this.trackArtist.addImgSrc(playback.albumImage);
        this.trackArtist.addAlbumLink(playback.albumURL);
        this.trackArtist.addTrackName(playback.trackName);
        this.trackArtist.addArtistName(playback.artistName);
        this.trackArtist.addTrackLink(playback.trackURL);
        this.trackArtist.addArtistLink(playback.artistURL);
    }

    addControls(playback) {
        const controls = document.createElement('controls-elem');
        this.controls = controls;
        this.controls.addPlayButton(playback.isPlaying);
        this.controls.playbtn.addEventListener('click', () => {
            this.stateChanged(this.controls.getState());
        })
        this.controls.prev.addEventListener('click', ()=> {
            this.controls.prev.prev().then(done => {
                if (done) {
                    this.updateAll();   
                }
            });
        })
        this.controls.next.addEventListener('click', ()=> {
            this.controls.next.next().then(done => {
                if (done) {
                    this.updateAll();   
                }
            });
        })

        this.shadowRoot.querySelector('#controls').appendChild(controls)
    }

    updateControls(playback) {
        this.controls.setState(playback.isPlaying)
    }

    addProgressBar(playback) {
        const progressbar = document.createElement('progress-bar');
        progressbar.addProgressBar(playback);
        this.progressbar = progressbar;
        this.shadowRoot.querySelector('#progress_bar').appendChild(progressbar);
        this.progressbar.progressbar.addEventListener('animationend', ()=> {
            this.updateAll();
        })
    }

    updateProgressBar(playback) {
        this.progressbar.resetProgressBar(playback);
        // Adding this event every time i update, because updating the progressbar actually removes the old progressbar element and adds a new one.
        this.progressbar.progressbar.addEventListener('animationend', () => {
            this.updateAll();
        })
    }
    
    addVolume(playback) {
        this.volume = document.createElement('volume-elem');
        this.volume.currentVolume(playback.volume)
        this.shadowRoot.querySelector('#volume').appendChild(this.volume);
    }

    updateVolume(playback) {
        this.volume.currentVolume(playback.volume);
    }

    addLikedTrack(playback) {
        this.likedTrack = document.createElement('liked-track');
        this.likedTrack.setTrack(playback.trackID);
        this.shadowRoot.querySelector('#liked_tracks').appendChild(this.likedTrack);
    }

    updateLikedTrack(playback) {
        this.likedTrack.setTrack(playback.trackID);
    }

    /* There is no need o update this component, because it will update automatically by itself. Every time the component is clicked, it will query the server.*/
    addSwitchDevice(playback) {
        this.switchDevice = document.createElement('switch-device');
        this.shadowRoot.querySelector('#switch_device').appendChild(this.switchDevice);
    }

    addShareTrack(playback) {
        this.shareTrack = document.createElement('share-track');
        this.shareTrack.setPlayback(playback)
        this.shadowRoot.querySelector('#share_track').appendChild(this.shareTrack);
    }

    updateShareTrack(playback) {
        this.shareTrack.setPlayback(playback)
    }
}

window.customElements.define('player-elem', Player);