const spotifyColor = window.getComputedStyle(document.body).getPropertyValue('--spotify-green');

const anchorCSS = `
    line-height: 0px;
    position: relative;
`

const imgCSS = `
    width: 50px;
    position: relative;
`

const beforeCSS = `
    position: absolute;
    border-radius: 50%;
    top: 1px;
    left: 1px;
    width: 48px;
    height: 48px;
    background: ${spotifyColor}
`

function elem() {
    const anchor = document.createElement('a')
    const img = document.createElement('img')
    const before = document.createElement('div')

    anchor.setAttribute('href', 'https://open.spotify.com')
    anchor.setAttribute('id', 'spotify-logo')
    anchor.setAttribute('target', '_blank')
    img.setAttribute('src', './logos/spotify-logo.png')
    img.setAttribute('alt', 'Spotify logo')

    anchor.style.cssText = anchorCSS;
    img.style.cssText = imgCSS;
    before.style.cssText = beforeCSS;
    
    anchor.append(before,img)

    return anchor;
}

export default elem
// console.log(document.querySelector('a'))
// console.log(window.getComputedStyle(document.querySelector('a')))