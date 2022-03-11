import './searchbar.js'
import './user-favs.js'
import './genres.js';
import './tracksOfWeek.js'
import './recent-artists.js'
const main = document.createElement('main');
const searchbar = document.createElement('search-bar')
const userfavs = document.createElement('user-favs')
const genresTracksRecents = document.createElement('div');
const genres = document.createElement('genres-elem')
const tracksOfWeek = document.createElement('tracks-of-week');
const recentArtists = document.createElement('recent-artists')


genresTracksRecents.append(genres, tracksOfWeek, recentArtists);
genresTracksRecents.style.cssText = `
    margin-top: 50px;
    width: 100%;
    display: flex;
    gap: 30px;
`
main.style.cssText = `
    width: 100%;
    overflow-y: scroll;
    background: black;
    padding-top: 40px;
    padding-bottom: 40px;
    margin-bottom: 108px
`

main.append(searchbar, userfavs, genresTracksRecents);
export default main;