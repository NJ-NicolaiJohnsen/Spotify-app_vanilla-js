const template = document.createElement('template')

template.innerHTML = `
    <style>
        a {
            text-decoration: none;
            color: white;
            display: inline-block;
            padding: 12px 16px;
            background: #101010;
            border: 1px solid #343434;
            border-radius: 15px;
            transition: background 0.1s;
            font-size: 16px;
        }

        a:hover {
            background: #151515;
        }

    </style>

    <a target="_blank" href="#"></a>
`

class GenreButton extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({mode: 'open'})
        this.shadowRoot.appendChild(template.content.cloneNode(true))
    }

    setGenreName(genreName) {
        this.shadowRoot.querySelector('a').innerText = genreName;
    }

    addLinkToGenre(url) {
        this.shadowRoot.querySelector('a').setAttribute('href', url)
    }
}

window.customElements.define('genre-button', GenreButton);