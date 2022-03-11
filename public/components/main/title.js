const template = document.createElement('template');

template.innerHTML = `
    <style>
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        .title {
            margin-bottom: 30px;
            font-weight: medium;
            font-size: 24px;
        }

    </style>

    <h2 class="title"></h2>
`


class Title extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({mode: 'open'})
        this.shadowRoot.appendChild(template.content.cloneNode(true))
        
    }

    connectedCallback() {
        this.shadowRoot.querySelector('h2').textContent = 
            this.getAttribute('text')
    }
}

window.customElements.define('title-elem', Title);