
const template = document.createElement('template')

template.innerHTML = `
    <style>
        * {
            padding: 0;
            margin: 0;
            box-sizing: border-box;
        }

        img {
            user-select: none;
        }

        #socials_wrap {
            padding-top: 40px;
            width: 335px;
            margin: 0px 20px;
            height: 100%;
            padding-bottom: 108px;
        }

        #profile_wrap {
            display: flex;
            gap: 10px;
            margin-bottom: 36px;
        }

        #profile_options {
            border: 2px solid #262626;
            border-radius: 50px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            height: 70px;
            flex-grow: 1;
            padding: 0 25px;
        }

        .options_item {
            flex: 0 0 auto;
            width: 22px;
            cursor: pointer;
        } 

        .options_item img {
            filter: invert(100%) brightness(0.87);
            width: 100%;
            transition: 0.1s filter;
        }

        .options_item img:hover {
            filter: invert(100%) brightness(1);
        }

        #profile {
            display: flex;
            align-items: center;
            background: #262626;
            border-radius: 50px;
            height: 70px;
            cursor: pointer;
            transition: 0.1s filter;
            position: relative;
        }

        #profile:hover #profile_settings {
            filter: invert(1) brightness(1);
        }

        #profile_settings {
            filter: invert(100%) brightness(0.5);
            width: 60px;
            display: flex;
        }
        

        #profile_settings img {
            width: 15px;
            margin: auto;
        }

        #profile_img {
            width: 70px;
            border-radius: 50%;
            overflow: hidden;
            line-height: 0;
            cursor: pointer;
        }

        #profile_img img {
            width: 100%;
        }

        #profile_settings_options {
            display: none;
            min-width: 200px;
            position: absolute;
            top: calc(100% + 15px);
            right: 0;
            background: #383838;
            z-index: 10;
            border-radius: 12px;
        }

        #profile_settings_options li {
            display: block;
            padding: 20px;
        }

        #profile_settings_options li:hover {
            background: #fff1;
        }


        li {
            list-style: none;
        }

        a {
            text-decoration: none;
            color: inherit;
            white-space: nowrap;
        }

        #friends_wrap {
            width: 100%;
            height: calc(100% - 132px);
        }

        #friends_wrap_content {
            width: 100%;
            background: #212121;
            padding: 24px 36px;
            border-radius: 24px;
        }

        #top_bar {
            display: flex;
            justify-content: space-between;
            align-items: center;
            width: 100%;
            margin-bottom: 20px;
        }        

        #other_friends {
            width: 25px;
            filter: invert(1) brightness(0.5);
            cursor: pointer;
            transition: 0.1s filter;
        }

        #other_friends:hover {
            filter: invert(1) brightness(1);
        }
        
        #other_friends img {
            width: 100%;
        }

        #title {
            font-size: 24px;
            letter-spacing: -0.24px;
        }

        #friends {
            margin-bottom: 30px;
        }

        .friend {
            width: 100%;
            display: flex;
            align-items: center;
        }

        .friend:not(:last-of-type) {
            margin-bottom: 48px;
        }

        .friend img {
            height: 60px;
            width: 60px;
            border-radius: 50%;
            flex: 0 0 auto;
            margin-right: 25px;
        }

        .friend_details {
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            height: 45px;
            max-width: 180px;
        }

        .friend_name {
            font-size: 18px;
            letter-spacing: -0.38px;
            font-weight: 500;
            max-width: 100%;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .track_name {
            color: var(--font-color-shaded);
            max-width: 100%;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        #view_all_btn {
            display: inline-block;
            width: 100%;
            padding: 22px;
            background: #383838;
            border-radius: 22px;
            text-align: center;
            transition: background 0.1s;
            user-select: none;
            cursor: pointer;
        }

        #view_all_btn:hover {
            background: #424242;
        }
    </style>

    <div id="socials_wrap">
        <div id="profile_wrap">
            <div id="profile_options">
                <span class="options_item">
                    <img src="logos/secure.png" alt="Security">
                </span>
                <span class="options_item">
                    <img src="logos/setting.png" alt="Settings">
                </span>
                <span class="options_item">
                    <img src="logos/bell-ring.png" alt="Notifications">
                </span>
            </div>
            <div id="profile">
                <span id="profile_settings">
                    <img src="logos/downward-arrow.png" alt="Profile Options">
                </span>
                <span id="profile_img">
                    <img src="jan-blomqvist.jpg" alt="Profile picture">
                </span>

                <ul id="profile_settings_options">
                    <li><a href="#" target="_blank" id="user_profile_link">Profile</a></li>
                    <li><a href="#">Options (Doesn't work)</a></li>
                    <li><a href="#">Options (Doesn't work)</a></li>
                </ul>
            </div>
            
        </div>

        <div id="friends_wrap">
            <div id="friends_wrap_content">
                <div id="top_bar">
                    <span id="title">Friends Activity</span>
                    <div id="other_friends">
                        <img src="logos/other.png" alt="Other Friends">
                    </div>
                </div>

                <div id="friends">
                    
                </div>

                <div id="view_all_btn">View All</div>
            </div>
        </div>

    </div>

`

class Socials extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({mode: 'open'})
        this.shadowRoot.appendChild(template.content.cloneNode(true))
        this.setUserProfile();
        this.linkToProfile();
        this.showingProfileOptions = false;

        this.shadowRoot.querySelector('#profile').addEventListener('click', (e)=> {
            const shareTrackPopup = document.querySelector('player-elem').shadowRoot.querySelector('share-track');
            const switchDevicePopup = document.querySelector('player-elem').shadowRoot.querySelector('switch-device');

            if (shareTrackPopup.showing) {
                shareTrackPopup.hideShareOptions();
            }
            if (switchDevicePopup.isShowingDevices) {
                switchDevicePopup.toggleDevices();
            }


            if (this.showingProfileOptions) {
                this.hideProfile();
            }
            else {
                this.showProfile();
            }
            e.stopPropagation();
        })
        window.addEventListener('click',()=>{if (this.showingProfileOptions){ this.hideProfile()}})
        
    }

    showProfile() {
        this.showingProfileOptions = true;
        this.shadowRoot.querySelector('#profile_settings_options').style.display = 'block';
        this.shadowRoot.querySelector('#profile_settings img').style.transform = 'rotate(180deg)'
    }

    hideProfile() {
        this.showingProfileOptions = false;
        this.shadowRoot.querySelector('#profile_settings_options').style.display = 'none';
        this.shadowRoot.querySelector('#profile_settings img').style.transform = 'rotate(0deg)'
    }

    setUserProfile() {
        const currentUser = new Promise((resolve, reject) => {
            const xhttp = new XMLHttpRequest();
            xhttp.onload = function() {
                resolve(JSON.parse(this.responseText));
            }
            xhttp.open('GET', 'http://localhost:3000/user')
            xhttp.send();
        })
        currentUser.then(user => {
            this.shadowRoot.querySelector('#profile_img img').setAttribute('src', user.images[0].url)
        })
    }

    connectedCallback() {
        this.fixAmountOfFriendsShown();
    }

    fixAmountOfFriendsShown() {
        const temp = document.createElement('template');
        temp.innerHTML = `
            <div class="friend">
                <img src="jan-blomqvist.jpg">
                <div class="friend_details">
                    <p class="friend_name" title="Jan Blomqvist">Jan Blomqvist</p>
                    <p class="track_name" title="Stoto - Oblivion">Stoto - Oblivion</p>
                </div>
            </div>
        `

        const containerHeight = this.shadowRoot.querySelector('#friends_wrap').clientHeight;
        const amountOfFriendsShown = Math.floor((containerHeight-160)/ 108);
        const friends = this.shadowRoot.querySelector('#friends');
        for (let i = 0; i < amountOfFriendsShown; i++) {
            const clone = temp.content.cloneNode(true);
            friends.appendChild(clone);
        }
    }

    linkToProfile() {
        const userData = new Promise((resolve, reject) => {
            const xhttp = new XMLHttpRequest();
            xhttp.onload = function() {
                resolve(JSON.parse(this.responseText))
            }
            xhttp.open('GET', "http://localhost:3000/user");
            xhttp.send();
        })
        userData.then(user => {
            console.log(user.external_urls.spotify)
            this.shadowRoot.querySelector('#user_profile_link').setAttribute('href', user.external_urls.spotify);
        })
    }
}

window.customElements.define('socials-elem', Socials);