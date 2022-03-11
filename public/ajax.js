const baseUrl = "http://localhost:3000"

function formatPostData(element) {
    const encodedData = encodeURIComponent(element.value);
    const name = element.getAttribute('name')
    let queryString = `${name}=${encodedData}`
    return queryString;
}

document.querySelectorAll(".basicBtn")
    .forEach(btn => {
        const path = btn.dataset.path;
        btn.addEventListener('click', ()=> {
            const xhttp = new XMLHttpRequest();
            xhttp.open("GET", baseUrl+path)
            xhttp.send();
        })
    });

document.querySelectorAll('.infoBtn')
    .forEach(btn => {
        const path = btn.dataset.path;
        switch (path) {
            case '/play':
                btn.addEventListener('click', ()=>infoBtnCallback('#play_text', path))
                break;
            case '/volume':
                btn.addEventListener('input', ()=>infoBtnCallback('#volume_value', path))
                break;
            case '/seek_to_position':
                btn.addEventListener('click', ()=>infoBtnCallback('#position_value', path))
                break;
            default:
                return 'Nothing Found'
        }
    })

function infoBtnCallback(btnID, path) {
    const xhttp = new XMLHttpRequest();
    let postData = formatPostData(document.querySelector(btnID))
    xhttp.open('POST', baseUrl+path);
    xhttp.send(postData);
}

window.onload = function() {
    const xhttp = new XMLHttpRequest();
    xhttp.onload = function() {
        const volume = JSON.parse(this.responseText).volume;
        document.querySelector('#volume_value').value = volume
    }
    xhttp.open("GET", baseUrl+'/getVolume')
    xhttp.send();
}