
const template = document.createElement('template');
template.innerHTML = `
  <style>
  .searchbar {
    display: flex;
    align-items: center;
    background-color: #1A1A1A;
    border: 2px solid #333333;
    padding: 25px 25px;
    border-radius: 50px;
    position: relative;
}

.search_icon {
    width: 22px;
    min-width: 22px;
    height: 22px;
    min-height: 22px;
    border: 2px solid white;
    border-radius: 50%;
    margin-right: 16px;
}

#search_box {
    width: 50%;
    min-width: 50%;
    background: transparent;
    border: none;
    color: var(--font-color);
    margin-right: auto;
}

#search_box:focus {
    outline: none;
}

#search_filter_wrap {
    display: flex;
    align-items: center;
}

#chosen_filters {
    position: absolute;
    right: 145px;
    display: flex;
}

.filter_item {
    font-family: 'Roboto Condensed', sans-serif;
    font-weight: 700;
    margin-right: 10px;
    padding: 12px;
    border: 1px solid #484848;
    border-radius: 13px;
    background: #282828;
    cursor: pointer;
    user-select: none;
    transition: background 0.1s;
    flex: 0 0 auto;
}

.filter_item:hover {
  background: #202020;
}

#search_filter {
    display: flex;
    align-items: center;
    position: relative;
    cursor: pointer;
    user-select: none;
}

#search_filter::before {
    display: block;
    content: '';
    height: 180%;
    width: 1px;
    position: absolute;
    top: -40%;
    left: -25px;
    border-left: 2px dotted #bbb;
    pointer-events: none;
}

#search_filter img {
    width: 27px;
    margin-right: 1em;
}

#chooseFilter_wrap {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  overflow-x:hidden;
  padding: 210px 0;
  padding-left: 10px;
  margin-left: -10px;
  margin-top: -100px;
}

#chooseFilter {
  padding: 60px;
  background-color: #1A1A1A;
  border: 2px solid #333333;
  width: 60%;
  border-radius: 20px;
  z-index: 1000;
  position: relative;
  top: 50%;
  left: 50%;
  margin-right: -50%;
  transform: translate(-50%, 0);
}

#exitFilter {
  position: absolute;
  right: 20px;
  top: 20px;
  cursor: pointer;
  font-size: 40px;
  line-height: 1em;
  user-select: none;
}

#filters_wrap {
  display: flex;
  flex-wrap: wrap;
}

#filters_wrap span {
  flex: 1 0 15%;
  text-align: center;
  margin: 5px;
}

#exitFilter_wrap {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1000;
  background: #000000aa;
}
      
  </style>

    <section class="searchbar">
      <div class="search_icon"></div>
      <input type="text" id="search_box" placeholder="Search...">
      <div id="search_filter_wrap">
          <div id="chosen_filters">

          </div>
          <span id="search_filter">
            <img src="logos/filter.svg">
            Filters
          </span>
      </div>
    </section>
`

class SearchBar extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({mode: 'open'})
    this.shadowRoot.appendChild(template.content.cloneNode(true))

  }

  // checks for equality between an item and a list. If the list contains an item that is equal to the given item, it returns false, else returns true.
  checkDuplicates(item, list) {
    let noDuplicate = true;
      list.forEach(listItem => {
        if (item.textContent === listItem.textContent) {
          noDuplicate = false;
        }
      })
      return noDuplicate;
  }

  // adds event listener to remove a chosen filter item.
  removeFilter(filterItem) {
    filterItem.firstElementChild.addEventListener('click', (e) => {
      e.target.remove();
    })
  }

  // Adds a chosen filter item to the list of Filter items. Also calls this.removeFilter. Up to 5 filters are allowed, and no duplicates are allowed.
  addFilter = e => {
    const chosenFilters = this.shadowRoot.querySelector('#chosen_filters');

    let noDuplicates = this.checkDuplicates(e.target, this.shadowRoot.querySelectorAll('#chosen_filters .filter_item'))
    
    if (chosenFilters.childElementCount < 5 && noDuplicates) {
      const span = document.createElement('template')
      span.innerHTML = `
        <span class="filter_item" data-filter="">${e.target.textContent}</span>
      `
      // const spanClone = span.content.cloneNode(true)
      this.removeFilter(span.content);
      chosenFilters.appendChild(span.content)
    }
  }

  // Appends to the document at .searchbar the interface to choose a filter. also adds the events to choose a filter or to exit the interface by calling this.exitChooseFilter and this.addFilterEvent
  chooseFilter() {
    const genres = new Promise((resolve, reject) => {
      const xhttp = new XMLHttpRequest();
      xhttp.onload = function() {
          resolve(JSON.parse(this.responseText).genres)
      }
      xhttp.open("GET", 'http://localhost:3000/genres')
      xhttp.send();
    })
    genres.then(data=>{
      this.makeFilters(data)
    })
  }

  makeFilters(genreFilters) {

    const container = document.createElement('div')
    container.id = "filters_wrap";
    genreFilters.forEach((item) => {
        const itemElem = document.createElement("span");
        itemElem.textContent = item;
        itemElem.classList.add('filter_item');
        container.appendChild(itemElem);
      }
    )
    
    const template = document.createElement('template')
    template.innerHTML = `
        <div id="chooseFilter_wrap">
          <div id="exitFilter_wrap"></div>
            <div id="chooseFilter">
                <span id="exitFilter">&#10005;</span>
                ${container.outerHTML}
            </div>
        </div>
    `
    this.shadowRoot.querySelector('.searchbar').append(template.content)
    this.exitChooseFilter();
    this.addFilterEvent();
  }

  addFilterEvent() {
    this.shadowRoot.querySelectorAll('#filters_wrap .filter_item')
        .forEach(filter => {
            filter.addEventListener('click', this.addFilter)
        })
  }

  exitChooseFilter() {
    this.shadowRoot.querySelector('#exitFilter').addEventListener('click', () => {
      this.shadowRoot.querySelector('#chooseFilter_wrap').remove()
    })
    this.shadowRoot.querySelector('#exitFilter_wrap').addEventListener('click', () => {
      this.shadowRoot.querySelector('#chooseFilter_wrap').remove()
    })
  }

  connectedCallback() {
    this.shadowRoot.querySelector('#search_filter')
      .addEventListener('click', () => this.chooseFilter());
  }

}

window.customElements.define('search-bar', SearchBar);