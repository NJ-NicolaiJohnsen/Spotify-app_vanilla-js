
const template = document.createElement('template')

template.innerHTML = `
    <style>
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }
        
        #skip {
            cursor: pointer;
        }

        #skip img {
            filter: brightness(0) invert(1);
            width: 25px;
        }

    </style>

    <span id="skip"><img src="logos/skip-button-next.png"/></span>
`

// TO-DO -- Implement the skip function

class SkipToNext extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({mode: 'open'})
        this.shadowRoot.appendChild(template.content.cloneNode(true))
    }

    next() {
        return new Promise((resolve, reject) => {
            const xhttp = new XMLHttpRequest();
            xhttp.onload = function() {
                if (this.status === 204) {
                    resolve('done');
                }
                else reject(null);
            }
            xhttp.open('GET', 'http://localhost:3000/next');
            xhttp.send();
        })
    }
}

window.customElements.define('skip-to-next', SkipToNext);