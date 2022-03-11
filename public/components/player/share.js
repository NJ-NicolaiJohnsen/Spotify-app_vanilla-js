import './shareIframe.js';
import './shareByEmail.js';
const template = document.createElement('template')

template.innerHTML = `
    <style>
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        :host(share-track) {
            position: relative;
            display: block;
            width: 20px;
            height: 20px;
            z-index: 1;
        }

        #share_wrap {
            position: relative;
        }

        #share_logo  {
            width: 100%;
            height: 100%;
            cursor: pointer;
            user-select: none;
        }

        .not_showing {
            transition: filter 0.2s;
            filter: invert(0.7) brightness(1);
        }

        .not_showing:hover {
            filter: invert(1) brightness(1);
        }

        .showing {
            filter: invert(1) brightness(1);
        }

        #share_options {
            display: none;
            position: absolute;
            bottom: calc(100% + 15px);
            left: 100%;
            margin-left: -50%;
            transform: translateX(-50%);
            background: #383838;
            border-radius: 10px;
        }

        #share_options::after {
            display: block;
            position: absolute;
            top: 100%;
            left: 50%;
            transform: translateX(-50%);
            content: '';
            width: 0;
            height: 0;
            border-left: 10px solid transparent;
            border-right: 10px solid transparent;
            border-top: 10px solid #383838;
        }

        #share_options li {
            list-style-type: none;
            white-space: nowrap;
            display: block;
            padding: 20px;
            user-select: none;
        }

        #share_options li:hover {
            background: #fff1;
        }

    </style>
    
    <div id="share_wrap">
        <img id="share_logo" class="not_showing" src="logos/send.png">
        <ul id="share_options">
            <li id="copy_link">Copy song link</li>
            <li id="embed_track">Embed track</li>
            <li id="mail_song">Send by email</li>
        </ul>
    </div>
`

// :not(:checked)

// append iframe to document.body instead of this.shadowroot; This will make positioning it inside the page much easier, because you don't have to navigate around the whole DOM.

class ShareTrack extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({mode: 'open'});
        this.shadowRoot.appendChild(template.content.cloneNode(true));
        this.playback = null;
        this.emailElemUpdated = true;
        this.iframeUpdated = true;
        this.showing = false;

        this.shadowRoot.querySelector('#copy_link').addEventListener('click', ()=>{this.copySongLink()})

        this.shadowRoot.querySelector('#embed_track').addEventListener('click', ()=>{
            this.displayIframe();
        })

        this.shadowRoot.querySelector('#mail_song').addEventListener('click', ()=>{
            this.displayEmailElem();
        })

        // A custom elements field variables and methods can be accessed through the DOM.
        this.addEventListener('click', (e)=>{
            const sibling = document.querySelector('player-elem').shadowRoot.querySelector('switch-device')
            const socialsElem = document.querySelector('socials-elem');
            if (socialsElem.showingProfileOptions) {
                socialsElem.hideProfile();
            }

            if (sibling.isShowingDevices) {
                sibling.toggleDevices();
            }

            if (this.showing) {
                this.hideShareOptions();
            }
            else {
                this.showShareOptions();
            }
            e.stopPropagation();
        })

        window.addEventListener('click', ()=>{
            if (this.showing) {
                this.hideShareOptions();
            }
        })

    }

    showShareOptions() {
        this.showing = true;
        this.shadowRoot.querySelector('#share_logo').className = 'showing'
        this.shadowRoot.querySelector('#share_options').style.display = 'block';
    }

    hideShareOptions() {
        this.showing = false;
        this.shadowRoot.querySelector('#share_logo').className = 'not_showing';
        this.shadowRoot.querySelector('#share_options').style.display = 'none';
    }

    setPlayback(playback) {
        this.playback = playback;
        if (this.iframeUpdated) {
            this.updateIframe();
        }
        if (this.emailElemUpdated) {
            this.updateEmailElem();
        }
    }

    updateIframe() {
        if (this.iframeElem) {
            if (this.iframeElem.showing) {
                this.iframeUpdated = false;
                setTimeout(()=> {
                    console.log('hello ')
                    this.updateIframe();
                },2000)
            }
            else {
                this.iframeUpdated = true;
                this.iframeElem.remove();
            }
        }
        this.iframeElem = document.createElement('share-track-iframe');
        this.iframeElem.setSrc(this.playback.trackID)
        document.body.querySelector('#app').appendChild(this.iframeElem);
    }

    displayIframe() {
        this.iframeElem.display();
    }
    
    copySongLink() {
        const link = this.playback.trackURL;
        navigator.clipboard.writeText(link);

        this.linkCopied();
    }

    linkCopied() {
        const elem = document.createElement('div');
        elem.id = 'link_copied';
        elem.innerHTML = `
            <style>
                #link_copied {
                    position: absolute;
                    bottom: 140px;
                    left: 50%;
                    transform: translateX(-50%);
                    background: #2E77D0;
                    padding: 15px 30px;
                    border-radius: 10px;

                    animation: link_copied;
                    animation-duration: 2s;
                    animation-iteration-count: 1;
                    animation-fill-mode: forwards;
                    animation-play-state: running;
                    animation-timing-function: linear;
                }

                @keyframes link_copied {
                    0% {
                        opacity: 100%;
                    }
                    100% {
                        opacity: 0%;
                        display: none;
                    }
                }
            </style>

            <span>Link copied to clipboard</span>
        `
        document.body.appendChild(elem);
        setTimeout(()=> {
            elem.remove();
        }, 2000)
    }

    updateEmailElem() {
        if (this.emailElem) {
            if (this.emailElem.showing) {
                setTimeout(()=>{
                    console.log('hello wold')
                    this.emailElemUpdated = false;
                    this.updateEmailElem();
                }, 2000)
            }
            else {
                this.emailElemUpdated = true;
                this.emailElem.updatePlayback(this.playback);
            }
        }
        else {
            this.emailElemUpdated = true;
            this.emailElem = document.createElement('share-by-email');
            this.emailElem.updatePlayback(this.playback);
            document.body.querySelector('#app').appendChild(this.emailElem);
        }
    }

    displayEmailElem() {
        this.emailElem.display();
    }
}

window.customElements.define('share-track', ShareTrack);
