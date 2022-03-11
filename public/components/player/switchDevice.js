
const template = document.createElement('template')

template.innerHTML = `
    <style>
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        :host(switch-device) {
            position: relative;
            display: block;
            z-index: 1;
        }

        #switch_device {
            width: 25px;
            height: 25px;
            cursor: pointer;
        }

        .switch_device-img {
            width: 100%;
            filter: invert(0.7) brightness(1);
            transition: filter 0.2s;
        }

        .switch_device-img:hover {
            filter: invert(1) brightness(1);
        }

        .showing_devices {
            filter: invert(1) brightness(1);
        }

        #devices_wrap {
            position: absolute;
            padding-top: 35px;
            border-radius: 10px;
            bottom: calc(100% + 15px);
            left: 100%;
            margin-left: -50%;
            transform: translateX(-50%);
            background: #383838;

            display: none;
            z-index: 10;
        }

        #devices_wrap::after {
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

        #devices_title {
            font-size: 20px;
            font-weight: 600;
            white-space: nowrap;
            padding: 0 20px 20px 20px;
            user-select: none;
        }

        .device {
            display: flex;
            padding: 20px 20px;
        }

        .device:hover {
            background: #fff1;
        }

        .type_img {
            flex: 0 0 36px;
            margin-right: 20px;
            filter: invert(1);
        }

        .device_details {
        }

        .device_name {
            white-space: nowrap;
        }

        .is_active {
            color: var(--spotify-green);
        }
        .img-is_active {
            filter: invert(100%) sepia(44%) saturate(3633%) hue-rotate(31deg) brightness(95%) contrast(78%);
        }

        .loading {
            width: 100%;
            filter: invert(100%) sepia(44%) saturate(3633%) hue-rotate(31deg) brightness(95%) contrast(78%) !important;

            animation: loading;
            animation-duration: 1s;
            animation-iteration-count: 3;
            animation-fill-mode: forwards;
            animation-play-state: running;
            animation-timing-function: linear;
        }

        @keyframes loading {
            0% {
                transform: rotate(0deg);
            }
            100% {
                transform: rotate(360deg);
            }
        }


    </style>

    <div id="switch_device">
        <img class="switch_device-img" src="logos/cast.png" alt="Switch Device">
    </div>

    <div id="devices_wrap">
        <p id="devices_title">Connect to a device</p>
    </div>



`


class SwitchDevice extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({mode: 'open'});
        this.shadowRoot.appendChild(template.content.cloneNode(true));
        this.devices = null;
        this.isShowingDevices = false;

        window.addEventListener('click', ()=>{
            if (this.isShowingDevices) {
                this.toggleDevices()
            }
        })
        this.addEventListener('click', (e)=>{
            const sibling = document.querySelector('player-elem').shadowRoot.querySelector('share-track');
            // Targeting other click-popup functionality in this very convoluted way. In this way i can make sure that two popups are not showing at the same time.
            // Because i am using stopPropagration() on all the click-popup events, the corresponding window-click-event that is supposed to hide the popup doesn't fire, when clicking another popup event.
            const socialsElem = document.querySelector('socials-elem');
            if (socialsElem.showingProfileOptions) {
                socialsElem.hideProfile();
            }
            if (sibling.showing) {
                sibling.hideShareOptions();
            }

            this.toggleDevices()
            e.stopPropagation();
        })

    }

    /* 
        Toggle between hiding and showing the devices box.
        When the box is being switched to showing, a call is made to the server, to ask for the connected devices. The devices returned will then be mapped to elements that are then appended to the popup box ("#devices_wrap").

        When a device is chosen, an animation will start that simulates loading. This is purely for User Experience. 
        
        There is a delay between when spotify tells you your action is approved, and when it is going to be performed. If you request an action from the spotify API, wait for the OK Response before proceeding, then you request information from the API. The information will still be that of the old version, before you requested for it to be changed. But if you wait 500 ms before requesting information from the API, you will then get the right information.
        This is presumably because the Spotify API only recieves your request, and lets you know you if the action is approved, not that it is actually fully performed. In other words, it only lets you know if it will be done, not when.
        
    */
    toggleDevices() {
        if (this.isShowingDevices) {
            this.shadowRoot.querySelectorAll('.device').forEach(device => {
                device.remove();
            })
            this.shadowRoot.querySelector('#switch_device img').classList.remove('showing_devices');
            this.shadowRoot.querySelector('#devices_wrap').style.display = 'none';
            this.isShowingDevices = false;
        }
        else {
            this.getDevices()
        }
    }

    getDevices() {
        const devices = new Promise((resolve, reject) => {
            const xhttp = new XMLHttpRequest();
            xhttp.onload = function() {
                resolve(JSON.parse(this.responseText));
            }
            xhttp.open('GET', 'http://localhost:3000/devices');
            xhttp.send();
        })
        devices.then(data => {
            this.devices = data.devices;
            this.addDevices()
        }).then(()=> {
            this.shadowRoot.querySelector('#switch_device img').classList.add('showing_devices');
            this.shadowRoot.querySelector('#devices_wrap').style.display = 'block';
            this.isShowingDevices = true;
        })
    }

    addDevices() {
        this.devices.forEach(device => {
            const temp = document.createElement('template')
            let imgsrc;
            let type = device.type;
            let name = device.name;
            let id = device.id;
            let isActive = device.is_active;
            switch(type) {
                case 'Computer':
                    imgsrc = "logos/laptop.png";
                    break;
                case "Smartphone":
                    imgsrc = "logos/device.png";
                    break;
                default: 
                    imgsrc = 'logos/laptop.png';
            }
            temp.innerHTML = `
                <div class="device">
                    <img class="type_img" src="${imgsrc}">
                    <div class="device_details">
                        <p class="device_name">${name}</p>
                        <small class="device_type">${type}</small>
                    </div>
                </div>
            `
            if (isActive) {
                temp.content.querySelector('.device_name').classList.add('is_active');
                temp.content.querySelector('.device_type').classList.add('is_active');
                temp.content.querySelector('.type_img').classList.add('img-is_active');
            }
            temp.content.querySelector('.device').addEventListener('click', ()=>{
                this.transferPlayback(id)
                this.showLoad()
            })
            this.shadowRoot.querySelector('#devices_wrap').appendChild(temp.content)
        })
    }

    transferPlayback(id) {
        const body = `device_id=${id}`
        const xhttp = new XMLHttpRequest();

        xhttp.open('POST', 'http://localhost:3000/transfer_playback');
        xhttp.send(body);
    }

    showLoad() {
        const elem = this.shadowRoot.querySelector('#switch_device img');
        elem.setAttribute('src', 'logos/redo.png');
        elem.className = 'loading';
        this.style.pointerEvents = 'none';
        setTimeout(()=>{
            elem.className = 'switch_device-img';
            elem.setAttribute('src', 'logos/cast.png');
            this.style.pointerEvents = 'auto';
        }, 1000)
    }

}

window.customElements.define('switch-device', SwitchDevice);
