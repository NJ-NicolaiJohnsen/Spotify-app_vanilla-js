const template = document.createElement('template');

template.innerHTML = `
    <style>
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }
        :host(play-button) {
            border-radius: 50%;
        }

        .btn {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            display: flex;
            justify-content: center;
            align-items: center;
            transition: background 0.1s;
            cursor: pointer;
        }

        img {
            pointer-events: none;
        }

        .spotify-green {
            background: var(--spotify-green);
        }

        .spotify-green:hover {
            background: #72C928;
        }

        .dark {
            background: #0D0D0D;
            border: 2px solid #6E6E6E;
        }

        .dark:hover {
            background: #1D1D1D;
        }

        .no_border {
            border: none;
        }

    </style>

    <span class="btn"><img width="15"></span>
`
// TO-DO -- Implement a way for all buttons to check if they are playing or not.

class PlayButton extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({mode: 'open'})
        this.shadowRoot.appendChild(template.content.cloneNode(true))
        this.btn = this.shadowRoot.querySelector('.btn');
        this.img = this.shadowRoot.querySelector('img')
        this.state = null;
    }

    checkBorder() {
        if (this.getAttribute('border') === 'none') {
            this.shadowRoot.querySelector('.btn').classList.add('no_border');
        }
    }

    getState() {
        return this.state;
    }

    setState(isPlaying) {
        this.state = isPlaying;
        this.setImgSrc();
    }

    connectedCallback() {
        this.btn.classList.add(this.getAttribute('color'))
        this.switchTheme = this.getAttribute('switchTheme')
        
        this.setImgSrc();
        this.themeSwitch();

        this.checkBorder();
    }

    setImgSrc() {
        if (!this.state) {
            this.img.setAttribute('src', 'logos/play-white.png')
            this.img.setAttribute('alt', 'Play')
        }
        else {
            this.img.setAttribute('src', 'logos/pause.svg')
            this.img.setAttribute('alt', 'Pause')
        }
    }

    pause() { // changes the display on the button, DOES NOT PAUSE THE TRACK
        this.state = false;
        this.setImgSrc();
    }

    play() { // changes the display on the button, DOES NOT PLAY THE TRACK
        this.state = true;
        this.setImgSrc();
    }

    themeSwitchPause() { // set to paused from playing
        this.pause();
        this.btn.classList.add('dark');
        this.btn.classList.remove('spotify-green');
    }

    themeSwitchPlay(){ // set to playing from paused
        this.play();
        this.btn.classList.add('spotify-green');
        this.btn.classList.remove('dark');
    }

    themeSwitch() {
        this.btn.addEventListener('click', () => {
            if (!this.state) {
                if (this.switchTheme) this.themeSwitchPlay();
                // else this.play();
            }
            else {
                if (this.switchTheme) this.themeSwitchPause();
                // else this.pause(); 
            }
        })
    }
//----------------------------------------------------------
    playPlaylist(uri) {
        this.btn.addEventListener('click', () => {
            const queryString = `uri=${uri}&uriType=playlist`
            const xhttp = new XMLHttpRequest();
            xhttp.open("POST", 'http://localhost:3000/play')
            xhttp.send(queryString);
        })
    }

    playTrack(uri) {
        this.btn.addEventListener('click', () => {
            const queryString = `uri=${uri}&uriType=track`
            const xhttp = new XMLHttpRequest();
            xhttp.open("POST", 'http://localhost:3000/play')
            xhttp.send(queryString);
        })
    }
//----------------------------------------------------------------
    playback() { // starts the play pause click-event
        this.addEventListener('click', this.resumeOrPause);
    }

    resumeOrPause() { // change
        // const promise = new Promise((resolve, reject) => {
            const xhttp = new XMLHttpRequest();
            // xhttp.onload = function() {
            //     resolve('done');
            // }
            xhttp.open("GET", 'http://localhost:3000/resume_or_pause')
            xhttp.send();
        // })
        if(this.state) {
            this.pause();
        }
        else {this.play();}
        
    }
}

window.customElements.define('play-button', PlayButton);