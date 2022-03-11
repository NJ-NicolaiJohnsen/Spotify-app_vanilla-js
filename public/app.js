import leftSidebar from './components/left-sidebar/left-sidebar.js';
import main from './components/main/main.js';
import './components/right-sidebar/right-sidebar.js';
import './components/player/player.js';
const player = document.createElement('player-elem');
const rightSidebar = document.createElement('socials-elem');
const app = document.querySelector('#app');

const css = `
    display: flex;
    height: 100vh;
    width: 100vw;
`
app.style.cssText = css;

app.append(leftSidebar, main, rightSidebar, player);