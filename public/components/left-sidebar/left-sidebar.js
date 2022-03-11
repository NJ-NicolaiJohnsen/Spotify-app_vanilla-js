
import sidebarElem from './left-sidebar-elem.js';
import spotifyLogo from './left-sidebar-logo.js';

const leftSidebar = document.createElement('nav');

const css = `
    width: 125px;
    height: 100%;
    padding-top: 60px;
    display: flex;
    flex-direction: column;
    justify-cotent: center;
    align-items: center;
    flex-shrink: 0;
`
leftSidebar.style.cssText = css;
leftSidebar.append(
        spotifyLogo(),
        sidebarElem('./logos/homepage.png', 'Home', "https://open.spotify.com/"),
        sidebarElem('./logos/discovery.png', 'Discovery', "https://open.spotify.com/search/"),
        sidebarElem('./logos/mic.png', 'Podcasts', "https://open.spotify.com/genre/podcasts-page"),
        sidebarElem('./logos/statistics.png', 'Charts', "https://open.spotify.com/", true),
        sidebarElem('./logos/time.png', 'History', "https://open.spotify.com/collection/playlists"),
        sidebarElem('./logos/option.png', 'Options', "https://open.spotify.com/"),
    )

export default leftSidebar;