import '../main/playButton.js';
import './skipToNext.js';
import './skipToPrevious.js';
const template = document.createElement('template')

template.innerHTML = `
    <style>
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }
        
        #controls {
            display: flex;
            align-items: center;
        }

        #play_button {
            margin: 0 30px;
        }

    </style>

    <div id="controls">
        <div id="previous"></div>
        <div id="play_button"></div>
        <div id="next"></div>
    </div>
`

class Controls extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({mode: 'open'});
        this.shadowRoot.appendChild(template.content.cloneNode(true));
        this.playbtn = null;
        this.prev = null;
        this.next = null;
        this.addSkipToPrevious();
        this.addSkipToNext();
    }

    setState(isPlaying) {
        this.playbtn.setState(isPlaying)
    }

    getState() {
        return this.playbtn.getState();
    }

    addSkipToPrevious() {
        this.prev = document.createElement('skip-to-previous');
        this.shadowRoot.querySelector('#previous').appendChild(this.prev);
    }

    addPlayButton(isPlaying) {
        this.playbtn = document.createElement('play-button');
        this.playbtn.setAttribute('color', 'dark');
        this.playbtn.setAttribute('border', 'none');
        this.setState(isPlaying);
        this.playbtn.playback();
        this.shadowRoot.querySelector('#play_button').appendChild(this.playbtn);
    }

    addSkipToNext() {
        this.next = document.createElement('skip-to-next');
        this.shadowRoot.querySelector('#next').appendChild(this.next);
    }
    
}

window.customElements.define('controls-elem', Controls);