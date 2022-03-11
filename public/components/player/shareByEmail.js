import '../main/trackArtist.js'
const template = document.createElement('template')

template.innerHTML = `
    <style>
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        :host(share-by-email) {
            display: none;
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            z-index: 999999;
            background: var(--shade-background);
        }

        #wrap {
            width: 100%;
            height:100%;
        }

        #trackWrap {
            position: absolute;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
            z-index: 3;
            background: #212121;
            padding: 35px;
            border-radius: 22px;
        }

        #form-email > * {
            display: block;
            width: 100%;
            padding: 12px;
            border-radius: 12px;
            border: 2px solid #333333;
            margin-top: 15px;
            background: #white;
            transition: 0.1s background;
        }

        #submitEmail {
            background: white;
            color: black;
        }

        #submitEmail:hover {
            color: white;
            background: #1D1D1D;
        }

    </style>
    
    <div id="wrap"></div>
    <div id="trackWrap">
        <div id="track"></div>
        <div id="form-email">
            <input id="recipient_mail" type="email" placeholder="mail til email@outlook.dk">
            <textarea id="contact_comment" rows="8" placeholder="Tilføj en kommentar til mailen"></textarea>
            <button id="submitEmail" type="submit">Send email</button>
        </div>
    </div>
`

class ShareByEmail extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({mode: 'open'});
        this.shadowRoot.appendChild(template.content.cloneNode(true));
        this.playback = null;
        this.trackArtist = document.createElement('track-artist');
        this.shadowRoot.querySelector('#track').appendChild(this.trackArtist)

        this.showing = false;
        this.shadowRoot.querySelector('#wrap').addEventListener('click', ()=>{
            this.hide();
        })

        this.shadowRoot.querySelector('#submitEmail').addEventListener('click', ()=> {
            this.share();
            this.hide();
        })
    }

    display() {
        this.style.display = 'block';
        this.showing = true;
    }

    hide() {
        this.style.display = 'none';
        this.showing = false;
    }

    updatePlayback(playback) {
        this.playback = playback;
        this.updateTrack();
    }

    updatePlaybackLater(playback) {
        this.shadowRoot.querySelector('#wrap').addEventListener('click', ()=>{
            this.updatePlayback(playback);
        })

        this.shadowRoot.querySelector('#submitEmail').addEventListener('click', ()=> {
            this.updatePlayback(playback);
        })
    }

    //to do --> santize the share() function => the input taken from the user

    updateTrack() {
        this.trackArtist.addImgSrc(this.playback.albumImage);
        this.trackArtist.addAlbumLink(this.playback.albumURL);
        this.trackArtist.addTrackName(this.playback.trackName);
        this.trackArtist.addArtistName(this.playback.artistName);
        this.trackArtist.addTrackLink(this.playback.trackURL);
        this.trackArtist.addArtistLink(this.playback.artistURL);
    }

    share() {

        const recipient = this.shadowRoot.querySelector('#recipient_mail').value;
        const comment = this.shadowRoot.querySelector('#contact_comment').value;

        const html = `
            <a href="${this.playback.albumURL}"><img src="${this.playback.albumImage}"></a>
            <div>
                <a href="${this.playback.trackURL}">${this.playback.trackName}</a> -
                <a href="${this.playback.artistURL}">${this.playback.artistName}</a>
            </div>
            <p>${comment}</p>
        `
        const xhttp = new XMLHttpRequest();
        xhttp.open('GET', `http://localhost:3000/share_track_by_email?html=${html}&recipient=${recipient}`);
        xhttp.send();
    }

}

window.customElements.define('share-by-email', ShareByEmail);
