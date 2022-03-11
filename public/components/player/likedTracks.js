
const template = document.createElement('template')

template.innerHTML = `
    <style>
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        #liked_tracks {
            width: 20px;
            cursor: pointer;
        }

        img {
            width: 100%;
            filter: brightness(0);
        }

        .isLiked {
            filter: brightness(0) invert(1);
        }

        .isNotLiked {
            filter: brightness(0) invert(0.7);
        }

    </style>

    <div id="liked_tracks">
        <img src="logos/heart-2.png" alt="Like Song">
    </div>
`


// this component has to be connected to a track/song. This componenent cannot exist without a track.
// If this element is used in the player component, then the currently playing song will be passed into this element. If it is used in the recently-played songs component, then it will be the specifically displayed track that is passed into this element.
class LikedTrack extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({mode: 'open'});
        this.shadowRoot.appendChild(template.content.cloneNode(true));
        this.trackID = null; // a string ID of the track. There is no need for a whole spotify URI, because this can only be of the URI type TRACK;
        this.trackIsLiked = null;
    }

    connectedCallback() {
        this.addEventListener('click', () => {
            if (this.trackIsLiked) this.removeLikeFromTrack();
            else this.likeTrack();
        })
    }

    setTrack(trackID) {
        this.trackID = trackID;
        this.likedTracksContains();
    }

    likedTracksContains() {
        const trackIsLiked = new Promise((resolve, reject) => {
            const xhttp = new XMLHttpRequest();
            xhttp.onload = function() {
                resolve(JSON.parse(this.responseText))                
            }
            xhttp.open("GET", 'http://localhost:3000/liked_tracks_contains?id=' + this.trackID)
            xhttp.send();
        })
        trackIsLiked.then(isLiked => {
            isLiked = isLiked[0] // isLiked is an array with only one item.
            
            if(isLiked) {
                this.shadowRoot.querySelector('img').className = 'isLiked';
                this.trackIsLiked = true;
            }
            else {
                this.shadowRoot.querySelector('img').className = 'isNotLiked';
                this.trackIsLiked = false;
            }
        })
    }
    
    likeTrack() { // add song to liked tracks
        const xhttp = new XMLHttpRequest();
        xhttp.open("GET", 'http://localhost:3000/like_track?id=' + this.trackID)
        xhttp.send();
        this.trackIsLiked = true;
        this.shadowRoot.querySelector('img').className = 'isLiked';
    }

    removeLikeFromTrack() {
        const xhttp = new XMLHttpRequest();
        xhttp.open("GET", 'http://localhost:3000/remove_like_from_track?id=' + this.trackID)
        xhttp.send();
        this.trackIsLiked = false;
        this.shadowRoot.querySelector('img').className = 'isNotLiked';
    }

}

window.customElements.define('liked-track', LikedTrack);