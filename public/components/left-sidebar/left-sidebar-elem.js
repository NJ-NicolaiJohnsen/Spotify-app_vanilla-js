const template = document.createElement('template');
template.innerHTML = `
    <style>
        * {
            padding: 0;
            margin: 0;
            box-sizing: border-box;
        }
        
        a {
            margin: 26px 0;
            padding: 0 calc(50% - 12.5px);
            line-height: 0px;
        }

        img {
            width: 25px;
        }

        .img_not_grey {
            filter: invert(0.55) brightness(1)
        }

        a:hover img {
            filter: invert(1) brightness(2);
        }
    </style>

    <a target="_blank"><img></a>
`

class SidebarItem extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({mode: 'open'})
        this.shadowRoot.appendChild(template.content.cloneNode(true))
        
    }
    setSrc(src) {
        this.shadowRoot.querySelector('img').setAttribute('src', src)
    }

    setAlt(alt) {
        this.shadowRoot.querySelector('img').setAttribute('alt', alt)
    }

    setHref(href) {
        this.shadowRoot.querySelector('a').setAttribute('href', href)
    }

    imgNotGrey() {
        this.shadowRoot.querySelector('img').className = 'img_not_grey'
    }
    
    connectedCallback() {
        this.style.marginTop = '52px';
    }
}

window.customElements.define('sidebar-item', SidebarItem);

function elem(src, alt, href, notGrey) {
    const sidebarItem = document.createElement('sidebar-item');
    if (notGrey) {
        sidebarItem.imgNotGrey();
    }
    sidebarItem.setSrc(src);
    sidebarItem.setAlt(alt);
    sidebarItem.setHref(href)
    return sidebarItem;
}

export default elem;