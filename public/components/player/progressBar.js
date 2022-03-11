const template = document.createElement('template')

template.innerHTML = `
    <style>
        * {
            box-sizing: border-box;
            padding: 0;
            margin: 0;
        }

        :host(progress-bar) {
            width: 100%;
            position: relative;
        }

        #wrap {
            display: flex;
            align-items: center;
        }
        
        #progression {
            position: absolute;
            left: -50px;
        }

        #duration {
            position: absolute;
            right: -50px;
        }

        .progressbar {
            width: 100%;
            height: 5px;
            background: #4D4D4D;
            border-radius: 5px;
        }

        .no_animation {
            height: 100%;
            border-radius: 5px;
            background: white;
            display: flex;
            align-items: center;
            justify-content: flex-end;
            max-width: 100%;
            position: relative;
        }

        .progressbar .inner {
            height: 100%;
            border-radius: 5px;
            background: white;
            display: flex;
            align-items: center;
            justify-content: flex-end;
            animation: progressbar-countdown;
            position: relative;

            /* Placeholder, this will be updated using javascript */
            animation-duration: 40s;
            /* We stop in the end */
            animation-iteration-count: 1;
            /* Stay on pause when the animation is finished finished */
            animation-fill-mode: forwards;
            /* We start paused, we start the animation using javascript */
            animation-play-state: paused;
            /* We want a linear animation, ease-out is standard */
            animation-timing-function: linear;
            /* A negative animation-delay value shifts the progress forwards. */
            animation-delay: 0s;
        }

        @keyframes progressbar-countdown {
            0% {
                width: 0%;
            }
            100% {
                width: 100%;
            }
        }

        .progressbar:hover .position {
            display: inline-block;
        }

        .progressbar:hover .inner {
            background: var(--spotify-green);
        }

        .position {
            display: none;
            width: 15px;
            height: 15px;
            border-radius: 50%;
            background: white;
            margin-right: -7.5px;
            flex-grow: 0;
            flex-shrink: 0;
        }

        .position_move {
            display: inline-block;
            width: 15px;
            height: 15px;
            border-radius: 50%;
            background: white;
            margin-right: -7.5px;
            flex-grow: 0;
            flex-shrink: 0;
        }


    </style>

    <div id="wrap">
        <span id="progression">1:22</span>
        <div id='progressbar'></div>
        <span id="duration">3:43</span>
    </div>
`

// TO-DO -- onanimationend event to detect when the song is over.

class ProgressBar extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({mode: 'open'})
        this.shadowRoot.appendChild(template.content.cloneNode(true))
        this.timeout = null;
        this.progressbar = null;
        this.state = null;
        this.progression = this.shadowRoot.querySelector('#progression');
        this.progressionInSeconds = 0;
        this.durationInSeconds = null;
    }

    setState(state) {
        this.state = state;
        this.playOrPause();
    }

    calcWidthToSec(widthElem, mousePos) {
        const maxWidth = widthElem.getBoundingClientRect().width;
        const offset = widthElem.getBoundingClientRect().left;
        if (mousePos < offset) {mousePos = offset}
        else if (mousePos > offset + maxWidth) {mousePos=maxWidth + offset}
        const newWidth = mousePos - offset;
        const ratio = newWidth/maxWidth;
        return this.durationInSeconds*ratio;
    }

    calcCurrentProgressToSec() {
        const maxWidth = this.shadowRoot.querySelector('#progressbar').getBoundingClientRect().width;
        const progress = this.progressbar.getBoundingClientRect().width;
        const ratio = progress/maxWidth;
        return this.durationInSeconds*ratio;
    }

    updatePosition(newPos) {
        this.progressbar.style.animationDelay = `-${newPos}s`;
        this.skipToPositionInSpotify(newPos);
    }

    skipToPositionInSpotify(position) {
        const posInMilliseconds = position*1000;
        const xhttp = new XMLHttpRequest();
        xhttp.open('POST', 'http://localhost:3000/seek_to_position');
        xhttp.send(`position=${posInMilliseconds}`);
    }

    adjustPosition() {
        const position = this.shadowRoot.querySelector('.position');
        const progressbarWrapper = this.shadowRoot.querySelector('.progressbar');
        progressbarWrapper.addEventListener('mousedown', () => {
            const offset = progressbarWrapper.getBoundingClientRect().left
            const moveMouse = (mouse) => {
                this.progressbar.style.width = `${mouse.clientX - offset}px`;
            }
            const releaseMouse = (mouse) => {
                window.removeEventListener('mousemove', moveMouse);
                this.progressbar.className = 'inner';
                this.progressbar.style.width = `${mouse.clientX - offset}px`;
                position.className = 'position';
                const newPos = this.calcWidthToSec(progressbarWrapper, mouse.clientX)
                this.updatePosition(newPos)
                window.removeEventListener('mouseup', releaseMouse)
            }
    
            position.className = 'position_move';
            this.progressbar.className = 'no_animation';

            window.addEventListener('mousemove', moveMouse)
            window.addEventListener('mouseup', releaseMouse)
        } )
    }

    playOrPause() {
        if (this.state) { // isPlaying
            this.setProgression(this.progressionInSeconds)
            this.progressbar.style.animationPlayState = 'running';
        }
        else {
            this.progressbar.style.animationPlayState = 'paused'
        }
    }

    addProgressBar(playback) {
        this.state = playback.isPlaying;
        const duration = playback.trackDuration;
        const progression = playback.trackProgress;
        this.durationInSeconds = duration/1000;
        this.progressionInSeconds = progression/1000;
        this.createProgressBar('progressbar');
        this.setDuration();
        this.setProgression();
        this.adjustPosition();
        this.playOrPause();
    }

    formatSeconds(seconds) {
        const min = Math.floor(seconds/60);
        let sec = Math.floor(seconds%60);
        if (sec < 10) {sec = '0'+sec;}
        return min + ":" + sec;
    }

    setProgression() { // in seconds
        this.progressionInSeconds = this.calcCurrentProgressToSec();
        const formatted = this.formatSeconds(this.progressionInSeconds)
        this.progression.textContent = formatted;
        this.timeout = setTimeout(()=> {
            this.setProgression();
        }, 998);
    }

    setDuration() { // in seconds
        const formatted = this.formatSeconds(this.durationInSeconds)
        this.shadowRoot.querySelector('#duration').textContent = formatted;
    }

    /**
     * Removes the progressbar and adds a new one.
     * This is used when a new track is started.
     */
    resetProgressBar(playback) {
        this.shadowRoot.querySelector('.inner').remove();
        this.addProgressBar(playback);
    }

    
    /**
    *  Creates a progressbar.
    *  @param id the id of the div we want to transform in a progressbar
    *  @param duration the duration of the timer example: '10s'
    *  @param callback, optional function which is called when the progressbar  reaches 0.
    */
    createProgressBar() {
        // We select the div that we want to turn into a progressbar
        var progressbar = this.shadowRoot.getElementById('progressbar');
        progressbar.className = 'progressbar';

        // We create the div that changes width to show progress
        var progressbarinner = document.createElement('div');
        progressbarinner.className = 'inner';
        this.progressbar = progressbarinner;

        var progressPosition = document.createElement('span');
        progressPosition.className = 'position';
        progressbarinner.appendChild(progressPosition);

        // Now we set the animation parameters
        progressbarinner.style.animationDuration = this.durationInSeconds+'s';
        
        progressbarinner.style.animationDelay = "-"+this.progressionInSeconds+'s';

        // Append the progressbar to the main progressbardiv
        progressbar.appendChild(progressbarinner);
    }

    
}

window.customElements.define('progress-bar', ProgressBar);