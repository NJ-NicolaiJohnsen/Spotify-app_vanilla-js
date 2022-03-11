const template = document.createElement('template');
template.innerHTML = `
    <style>
        * {
            padding: 0;
            margin: 0;
            box-sizing: border-box;
        }

        :host(artist-elem) {
            width: 100%;
            aspect-ratio: 1/1;
            
        }

        #artist {
            width: 100%;
            height: 100%;
            display: block;
        }

        img {
            width: 100%;
            height: 100%;
            display: block;
            border-radius: 6px;
        }
    </style>

    <a href="#" id="artist" target="_blank">
        <img>
    </a>
    
`


class Artist extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({mode: 'open'})
        this.shadowRoot.appendChild(template.content.cloneNode(true))

    }

    connectedCallback() {
        const imgSrc = this.getAttribute('imgsrc')
        const spotifyURL = this.getAttribute('spotifyURL')
        this.shadowRoot.querySelector('#artist img').setAttribute('src', imgSrc)
        this.shadowRoot.querySelector('#artist').setAttribute('href', spotifyURL)
    }
}



window.customElements.define('artist-elem', Artist);