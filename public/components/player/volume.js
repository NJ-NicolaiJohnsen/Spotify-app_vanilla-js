const template = document.createElement('template')

template.innerHTML = `
    <style>
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }
        
        #volumeWrapper {
            display: flex;
            align-items: center;
        }

        img {
            width: 25px;
            margin-right: 10px;
            filter: brightness(0) invert(1);
        }

        input[type=range] {
            width: 100%;
            margin: 5px 0;
            background-color: transparent;
            -webkit-appearance: none;
        }
        input[type=range]:focus {
            outline: none;
        }
        input[type=range]::-webkit-slider-runnable-track {
            background: rgba(77, 77, 77, 0.9);
            border: 0px solid rgba(1, 1, 1, 0);
            border: 0;
            border-radius: 5px;
            width: 100%;
            height: 5px;
            cursor: pointer;
        }
        input[type=range]::-webkit-slider-thumb {
            margin-top: -5px;
            width: 15px;
            height: 15px;
            background: #ffffff;
            border: 0;
            border-radius: 50px;
            cursor: pointer;
            -webkit-appearance: none;
        }
        input[type=range]:focus::-webkit-slider-runnable-track {
            background: #5a5a5a;
        }
        input[type=range]::-moz-range-track {
            background: rgba(77, 77, 77, 0.9);
            border: 0px solid rgba(1, 1, 1, 0);
            border: 0;
            border-radius: 5px;
            width: 100%;
            height: 5px;
            cursor: pointer;
        }
        input[type=range]::-moz-range-thumb {
            width: 15px;
            height: 15px;
            background: #ffffff;
            border: 0;
            border-radius: 50px;
            cursor: pointer;
        }
        input[type="range"]::-moz-range-progress {
            border: none;
            height: 5px;
            border-radius: 5px;
            background-color: white; 
        }
        input[type=range]::-ms-track {
            background: transparent;
            border-color: transparent;
            border-width: 5px 0;
            color: transparent;
            width: 100%;
            height: 5px;
            cursor: pointer;
        }
        input[type=range]::-ms-fill-lower {
            background: #404040;
            border: 0px solid rgba(1, 1, 1, 0);
            border: 0;
            border-radius: 10px;
        }
        input[type=range]::-ms-fill-upper {
            background: rgba(77, 77, 77, 0.9);
            border: 0px solid rgba(1, 1, 1, 0);
            border: 0;
            border-radius: 10px;
        }
        input[type=range]::-ms-thumb {
            width: 15px;
            height: 15px;
            background: #ffffff;
            border: 0;
            border-radius: 50px;
            cursor: pointer;
            margin-top: 0px;
            /*Needed to keep the Edge thumb centred*/
        }
        input[type=range]:focus::-ms-fill-lower {
            background: rgba(77, 77, 77, 0.9);
        }
        input[type=range]:focus::-ms-fill-upper {
            background: #5a5a5a;
        }
            /*TODO: Use one of the selectors from https://stackoverflow.com/a/20541859/7077589 and figure out
            how to remove the virtical space around the range input in IE*/
            @supports (-ms-ime-align:auto) {
            /* Pre-Chromium Edge only styles, selector taken from hhttps://stackoverflow.com/a/32202953/7077589 */
            input[type=range] {
                margin: 0;
                /*Edge starts the margin from the thumb, not the track as other browsers do*/
            }
            }


    </style>

    <div id="volumeWrapper">
        <img src="logos/speaker-interface-audio-symbol.png"/ alt="volume">
        <input id="volume" type="range" min="0" max="100" value="34">
    </div>
`

class Volume extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({mode: 'open'});
        this.shadowRoot.appendChild(template.content.cloneNode(true));
        this.slider = this.shadowRoot.querySelector('#volume')
        this.slider.addEventListener('input', (volume)=>{this.setVolume(volume)})
        setInterval(()=>{ // an attempt to limit the number of times the app requests from the spotify api. Make one call every 50 milliseconds.
        // I want the smooth experience without crashing the app.
            this.ready = true;
        },50)

    }

    currentVolume(volume) {
        this.slider.value = volume;
    }

    setVolume(volume) {
        console.log(this.ready)
        if (this.ready) {
            
            const xhttp = new XMLHttpRequest();
            xhttp.open('POST', 'http://localhost:3000/setVolume');
            xhttp.send(`volume=${volume.target.value}`);
            this.ready = false;
        }
    }
    
}

window.customElements.define('volume-elem', Volume);