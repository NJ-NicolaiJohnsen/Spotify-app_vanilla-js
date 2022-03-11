const template = document.createElement('template')

template.innerHTML = `
    <style>
        :host(share-track-iframe) {
            display: none;
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            z-index: 999999;
            background: var(--shade-background);
        }

       #share_track_iframe {
            position: absolute;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
            z-index: 1;
            height: 50%;
            width: 50%;
       }

       #share_track_iframe > iframe {
           z-index: 3;
       }

       </style>
       
       <div id="share_track_iframe">
           <iframe style="border-radius:12px" width="100%" height="380" frameBorder="0">
           allowfullscreen=""  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy">
           </iframe>
       </div>
       `
    //    <div id="share_track_iframe">
    //        <iframe style="border-radius:12px" width="100%" height="380" frameBorder="0" allowfullscreen=""  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"></iframe>
    //    </div>

// EMBED ==> src="https://open.spotify.com/embed/track/2OlI72jbsX6tvDhPTNhIbE?utm_source=generator"

// LINK TO SPOTIFY ==> https://open.spotify.com/track/2OlI72jbsX6tvDhPTNhIbE

class ShareTrackIframe extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({mode: 'open'});
        this.shadowRoot.appendChild(template.content.cloneNode(true));
        this.showing = false;
        this.addEventListener('click', ()=>{
            this.style.display = 'none';
            this.showing = false;
        })
    }

    /*
        This method is being put on hold.
        Changing the src attribute on the iframe with javascript, and updating it every 15 seconds completely kills the app. Maybe it is making ALOT of external requests from the iframe.
    */
   
    setSrc(trackID) { 
        this.shadowRoot.querySelector('#share_track_iframe iframe').setAttribute('src',`https://open.spotify.com/embed/track/${trackID}?utm_source=generator`)
    }
        
    display() {
        this.style.display = 'block';
        this.showing = true;
    }

}

window.customElements.define('share-track-iframe', ShareTrackIframe);
