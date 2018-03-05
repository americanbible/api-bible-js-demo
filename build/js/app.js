const breadcrumbs = document.querySelector(`#breadcrumbs`);
const viewingLabel = document.querySelector(`#viewing-label`);
const title = document.querySelector(`#viewing`);
const list = document.querySelector(`#list`);
const textContent = document.querySelector(`#content`);
const searchInput = document.querySelector(`#search-input`);
const searchContainer = document.querySelector(`#search-container`);
const searchNavTop = document.querySelector(`#search-nav-top`);
const searchNavBottom = document.querySelector(`#search-nav-bottom`);
const searchResults = document.querySelector(`#results-list`);
const selectPrompt = document.querySelector(`#select-prompt span`);
window.addEventListener(`popstate`, function(e) {
  if (e.state) {
    updatePage(e.state.params, false);
    e.preventDefault();
  }
});

updatePage();

/**
 * Updates page pased on parameters.
 * @param {object} param contianing query parameters
 */
function updatePage(params, updateParams = true) {
  if (params && updateParams) {
    updateParamsInURL(params);
  }

  const abbreviation = getParameterByName(`abbr`);
  const bibleVersionID = getParameterByName(`version`);
  const bibleBookID = getParameterByName(`book`);
  const bibleChapterID = getParameterByName(`chapter`);
  const bibleVerseID = getParameterByName(`verse`);
  const query = getParameterByName(`query`);

  loadBreadcrumbs(abbreviation, bibleVersionID, bibleBookID, bibleChapterID, bibleVerseID);
  textContent.innerHTML = ``;
  searchNavTop.innerHTML = ``;
  searchNavBottom.innerHTML = ``;
  list.innerHTML = ``;

  if (!bibleVersionID || !abbreviation) {
    searchContainer.classList.add(`hidden`);
  }
  else {
    searchContainer.classList.remove(`hidden`);
  }

  selectPrompt.classList.remove(`hidden`);

  if (!bibleVersionID || ! abbreviation) {
    window.history.replaceState({params:``},``,`index.html`);
    viewingLabel.innerHTML = `Select a:`;
    title.innerHTML = `Bible`;
    list.className = `list-container bible-list`;
    selectPrompt.classList.add(`hidden`);
    loadBibleVersions();
  } else if (query) {
    list.innerHTML = ``;
    viewingLabel.innerHTML = `Search results for:`;
    selectPrompt.classList.add(`hidden`);
    title.innerHTML = query;
    list.className = `list-container search-results-list`;
    search(query, 0, bibleVersionID, abbreviation);
  } else if (bibleVersionID && !bibleBookID && !bibleChapterID && !bibleVerseID) {
    viewingLabel.innerHTML = `Viewing:`;
    selectPrompt.innerHTML = `Select a Book`;
    list.className = `list-container`;
    loadBooks(bibleVersionID, abbreviation);
  } else if (bibleVersionID && bibleBookID) {
    viewingLabel.innerHTML = `Viewing:`;
    selectPrompt.innerHTML = `Select a Chapter`;
    list.className = `list-container numeric-list`;
    loadChapters(bibleVersionID, abbreviation, bibleBookID);
  } else if (bibleVersionID && bibleChapterID) {
    viewingLabel.innerHTML = `Viewing:`;
    selectPrompt.innerHTML = `Select a Verse`;
    list.className = `list-container numeric-list`;
    loadVerses(bibleVersionID, abbreviation, bibleChapterID);
  } else if (bibleVersionID && bibleVerseID) {
    viewingLabel.innerHTML = `Selected verse:`;
    list.className = `list-container`;
    selectPrompt.classList.add(`hidden`);
    loadSelectedVerse(bibleVersionID, abbreviation, bibleVerseID);
  }
}

/**
 * Fills in list on page with Bible versions.
 * @returns {object} containing list of Bible versions
 */
function loadBibleVersions() {
  let versionHTML = ``;
  return getBibleVersions().then((bibleVersionList) => {
    const sortedVersions = sortVersionsByLanguage(bibleVersionList);

    for (let languageGroup in sortedVersions) {
      const language = languageGroup;
      versionHTML += `<h4 class="list-heading"><span>${language}</span></h4><ul>`;
      const versions = sortedVersions[languageGroup];
      for (let version of versions) {
        versionHTML += `<li class="bible">
          <a href="javascript:void(0);" onclick="updatePage('version=${version.id}&abbr=${version.abbreviation}')">
            <abbr class="bible-version-abbr" title="${version.name}">${version.abbreviation}</abbr>
            <span>
              <span class="bible-version-name">${version.name}</span>
              ${version.description ? '<span class="bible-version-desc">' + version.description + "</span>" : ''}
            </span>
          </a>
        </li>`;
      }
      versionHTML += `</ul>`;
    }
    list.innerHTML = versionHTML;
    return bibleVersionList;
  });


}

/**
 * Gets Bible versions from API.Bible
 * @returns {Promise} containing list of Bible versions
 */
function getBibleVersions() {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.withCredentials = false;

    xhr.addEventListener(`readystatechange`, function() {
      if (this.readyState === this.DONE) {
        const {data} = JSON.parse(this.responseText);
        const versions = data.map( (data) => {
          return {
            name: data.name,
            id: data.id,
            abbreviation: data.abbreviation,
            description: data.description,
            language: data.language.name
          };
        });
        resolve(versions);
      }
    });

    xhr.open(`GET`, `https://api.scripture.api.bible/v1/bibles`);
    xhr.setRequestHeader(`api-key`, API_KEY);

    xhr.onerror = () => reject(xhr.statusText);

    xhr.send();
  });
}

/**
 * Fills in list on page with books from selected version of the Bible (version specified in query params).
 * @returns {object} containing list of books of the Bible
 */
function loadBooks(bibleVersionID, abbreviation) {

  title.innerHTML = abbreviation;

  let bookHTML = ``;

  return getBooks(bibleVersionID).then((bookList) => {
    bookHTML += `<ul>`;
    for (let book of bookList) {
      bookHTML += `<li><a href="javascript:void(0);" onclick="updatePage('version=${bibleVersionID}&abbr=${abbreviation}&book=${book.id}')"> ${book.name} </a></li>`;
    }
    bookHTML += `</ul>`;
    list.innerHTML = bookHTML;
    return bookList;
  });
}

/**
 * Gets books of the Bible from API.Bible
 * @param {string} bibleVersionID to get books from
 * @returns {Promise} containing list of books of the Bible
 */
function getBooks(bibleVersionID) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.withCredentials = false;

    xhr.addEventListener(`readystatechange`, function() {
      if (this.readyState === this.DONE) {
        const {data} = JSON.parse(this.responseText);
        const books = data.map( ({name, id}) => { return {name, id}; } );

        resolve(books);
      }
    });

    xhr.open(`GET`, `https://api.scripture.api.bible/v1/bibles/${bibleVersionID}/books`);
    xhr.setRequestHeader(`api-key`, API_KEY);

    xhr.onerror = () => reject(xhr.statusText);

    xhr.send();
  });
}

/**
 * Fills in list on page with chapters from selected book of the Bible (version and book specified in query params).
 * @returns {object} containing list of chapters from selected book
 */
function loadChapters(bibleVersionID, abbreviation, bibleBookID) {

  title.innerHTML = bibleBookID;

  let chapterHTML = ``;

  return getChapters(bibleVersionID, bibleBookID).then((chapterList) => {
    chapterHTML += `<ol>`;
    for (let chapter of chapterList) {
      chapterHTML += `<li class="grid"><a class="grid-link" href="javascript:void(0);" onclick="updatePage('version=${bibleVersionID}&abbr=${abbreviation}&chapter=${chapter.id}')"> ${chapter.number} </a></li>`;
    }
    chapterHTML += `</ol>`;
    list.innerHTML = chapterHTML;
    return chapterList;
  });
}

/**
 * Gets chapters from API.Bible
 * @param {string} bibleVersionID to get chapters from
 * @param {string} bibleBookID to get chapters from
 * @returns {Promise} containing list of chapters from selected book
 */
function getChapters(bibleVersionID, bibleBookID) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.withCredentials = false;

    xhr.addEventListener(`readystatechange`, function() {
      if (this.readyState === this.DONE) {
        const {data} = JSON.parse(this.responseText);
        const chapters = data.map( ({number, id}) => { return {number, id}; } );

        resolve(chapters);
      }
    });

    xhr.open(`GET`, `https://api.scripture.api.bible/v1/bibles/${bibleVersionID}/books/${bibleBookID}/chapters`);
    xhr.setRequestHeader(`api-key`, API_KEY);

    xhr.onerror = () => reject(xhr.statusText);

    xhr.send();
  });
}

/**
 * Fills in list on page with verses from selected chapter (version and chapter specified in query params).
 * @returns {object} containing list of verses from selected book
 */
function loadVerses(bibleVersionID, abbreviation, bibleChapterID) {

  title.innerHTML = bibleChapterID;

  let verseHTML = ``;
  getChapterText(bibleVersionID, bibleChapterID).then((content) => {
    textContent.innerHTML = content;
  });

  return getVerses(bibleVersionID, bibleChapterID).then((verseList) => {
    verseHTML += `<ol>`;
    for (let verse of verseList) {
      const verseNumber = getVerseNumber(verse.id);
      verseHTML += `<li class="grid"><a class="grid-link" href="javascript:void(0);" onclick="updatePage('version=${bibleVersionID}&abbr=${abbreviation}&verse=${verse.id}')"> ${verseNumber} </a></li>`;
    }
    verseHTML += `</ol>`;
    list.innerHTML = verseHTML;
    return verseList;
  });
}

/**
 * Gets verses from API.Bible
 * @param {string} bibleVersionID to get verses from
 * @param {string} bibleChapterID to get verses from
 * @returns {Promise} containing list of verses from selected book
 */
function getVerses(bibleVersionID, bibleChapterID) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.withCredentials = false;

    xhr.addEventListener(`readystatechange`, function() {
      if (this.readyState === this.DONE) {
        const {data} = JSON.parse(this.responseText);
        const verses = data.map( ({id}) => { return {id};} );

        resolve(verses);
      }
    });

    xhr.open(`GET`, `https://api.scripture.api.bible/v1/bibles/${bibleVersionID}/chapters/${bibleChapterID}/verses`);
    xhr.setRequestHeader(`api-key`, API_KEY);

    xhr.onerror = () => reject(xhr.statusText);

    xhr.send();
  });
}

/**
 * Gets chapter text from API.Bible
 * @param {string} bibleChapterID to get chapter text from
 * @returns {Promise} containing text from selected chapter
 */
function getChapterText(bibleVersionID, bibleChapterID) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.withCredentials = false;

    xhr.addEventListener(`readystatechange`, function() {
      if (this.readyState === this.DONE) {
        const {data, meta} = JSON.parse(this.responseText);

        _BAPI.t(meta.fumsId);
        resolve(data.content);
      }
    });

    xhr.open(`GET`, `https://api.scripture.api.bible/v1/bibles/${bibleVersionID}/chapters/${bibleChapterID}`);
    xhr.setRequestHeader(`api-key`, API_KEY);

    xhr.onerror = () => reject(xhr.statusText);

    xhr.send();
  });
}

/**
 * Fills in the selected verse (version and verse specified in query params).
 * @returns {Object} containing selected verse
 */
function loadSelectedVerse(bibleVersionID, abbreviation, bibleVerseID) {

  return getSelectedVerse(bibleVersionID, bibleVerseID).then(({ content, bookId, bibleId }) => {
    getBookNameFromID(bibleId, bookId).then((book) => {
      list.innerHTML = ``;
      viewing.innerHTML = `<span><i>${book} ${bibleVerseID.slice(4)}</i></span>`;
      textContent.innerHTML = `${content}`;
    });
    return content;
  });
}

/**
 * Gets selected verse from API.Bible
 * @param {string} bibleVersionID to get verse from
 * @param {string} bibleVerseID of selected verse
 * @returns {Promise} containing selected verse
 */
function getSelectedVerse(bibleVersionID, bibleVerseID) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.withCredentials = false;

    xhr.addEventListener(`readystatechange`, function() {
      if (this.readyState === this.DONE) {
        const response = JSON.parse(this.responseText);
        const fumsId = response.meta.fumsId;
        const {content, bookId, bibleId} = response.data;
        const verse = {content, bookId, bibleId};

        _BAPI.t(fumsId);
        resolve(verse);
      }
    });

    xhr.open(`GET`, `https://api.scripture.api.bible/v1/bibles/${bibleVersionID}/verses/${bibleVerseID}?include-chapter-numbers=false&include-verse-numbers=false`);
    xhr.setRequestHeader(`api-key`, API_KEY);

    xhr.onerror = () => reject(xhr.statusText);

    xhr.send();
  });
}

function searchButton() {
  const abbreviation = getParameterByName(`abbr`);
  const bibleVersionID = getParameterByName(`version`);
  updatePage(`version=${bibleVersionID}&abbr=${abbreviation}&query=${searchInput.value}`);
}

/**
 * Loads search results into page
 * @returns {string} containing HTML of results
 */
function search(searchText, offset = 0, bibleVersionID, abbreviation) {
  searchInput.value = searchText;
  return getResults(searchText, offset, bibleVersionID).then((data) => {
    let resultsHTML = `<ul>`;

    if (data.verses) {
      if (!data.verses[0]) {
        textContent.innerHTML = ``;
        resultsHTML = `<div class="no-results">☹️ No results. Try <a href="index.html">changing versions?</a></div>`;
      } else {

        const [topSearchNavHTML, searchNavHTML] = buildNav(offset, data.total, searchText, bibleVersionID, abbreviation);
        searchNavTop.innerHTML = topSearchNavHTML;
        searchNavBottom.innerHTML = searchNavHTML;

        for (let verse of data.verses) {
          resultsHTML += `<li>
            <h5>${verse.reference}</h5>
            <div class="text not-eb-container">${verse.text}</div>
            <a href="javascript:void(0);" onclick="updatePage('verse.html?version=${bibleVersionID}&abbr=${abbreviation}&chapter=${verse.chapterId}')">view chapter</a>
          </li>`;
        }
      }
    }

    if (data.passages) {
      textContent.innerHTML = ``;
      if (!data.passages[0]) {
        resultsHTML = `<div class="no-results">☹️ No results. Try <a href="index.html">changing versions?</a></div>`;
      } else {
        for (let passage of data.passages) {
          resultsHTML += `<li>
            <h5>${passage.reference}</h5>
            <div class="text not-eb-container">${passage.content}</div>
            <a href="verse.html?version=${bibleVersionID}&abbr=${abbreviation}&chapter=${passage.chapterIds[0]}">view chapter</a>
          </li>`;
        }
      }
    }
    if (data.error) {
      textContent.innerHTML = ``;
      resultsHTML = `❗️ The server responded with an error for that Bible version. Try <a href="index.html">changing versions?</a>`;
    }
    resultsHTML += `</ul>`;

    searchResults.innerHTML = resultsHTML;
    return resultsHTML;
  });
}

/**
 * Builds navigation for search results
 * @returns {string} HTML to include for navigation
 */
function buildNav(offset, total, searchText, bibleVersionID, abbreviation) {
  const topSearchNavHTML = `<span class="results-count">Showing <b>${offset*10+1}-${offset*10+10 > total ? total : offset*10+10}</b> of <b>${total}</b> results.</span>`
  let searchNavHTML = `<span class="results-current-page"> Current page: <b>${offset+1}</b></span>`;

  if (offset > 0 || total / 10 > offset+1) {
    searchNavHTML += `<span class="results-nav">`;
  }

  if (offset > 0) {
    searchNavHTML += `<button onclick="search('${searchText}', ${offset-1}, '${bibleVersionID}', '${abbreviation}')">Previous Page</button>`;
  }

  if (total / 10 > offset+1) {
    searchNavHTML += `<button onclick="search('${searchText}', ${offset+1}, '${bibleVersionID}', '${abbreviation}')">Next Page</button>`;
  }

  if (offset > 0 || total / 10 > offset+1) {
    searchNavHTML += `</span>`;
  }

  return [topSearchNavHTML, searchNavHTML];
}

/**
 * Gets verses that match search term from API.Bible
 * @returns {Promise} containing list of verses
 */
function getResults(searchText, offset = 0, bibleVersionID) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.withCredentials = false;

    xhr.addEventListener(`readystatechange`, function() {
      if (this.readyState === this.DONE) {
        let data, meta;
        if (this.status == 500) {
          data = {error: this.statusText};
        } else {
          ({data, meta} = JSON.parse(this.responseText));
          _BAPI.t(meta.fumsId);
        }
        resolve(data);
      }
    });

    xhr.open(`GET`, `https://api.scripture.api.bible/v1/bibles/${bibleVersionID}/search?query=${searchText}&offset=${offset}`);
    xhr.setRequestHeader(`api-key`, API_KEY);

    xhr.onerror = () => reject(xhr.statusText);

    xhr.send();
  });
}

/**
 * Gets book name from book ID
 * @param {string} bibleVersionID Bible ID
 * @param {string} bibleBookID book ID
 * @returns {string} name of book
 */
function getBookNameFromID(bibleVersionID, bibleBookID) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.withCredentials = false;

    xhr.addEventListener(`readystatechange`, function() {
      if (this.readyState === this.DONE) {
        const {name} = JSON.parse(this.responseText).data;
        resolve(name);
      }
    });

    xhr.open(`GET`, `https://api.scripture.api.bible/v1/bibles/${bibleVersionID}/books/${bibleBookID}`);
    xhr.setRequestHeader(`api-key`, API_KEY);

    xhr.onerror = () => reject(xhr.statusText);

    xhr.send();
  });
}

/**
 * Parses verse number from verseID
 * @param {string} verseID verse ID
 * @returns {string} verse number or numbers
 */
function getVerseNumber(verseID) {
  let verseNumber;
  if (verseID.includes(`-`)) {
    verseNumber = verseID.split(`-`).shift().split(`.`).pop() + `-` + verseID.split(`-`).pop().split(`.`).pop();
  } else {
    verseNumber = verseID.split(`.`).pop();
  }
  return verseNumber;
}

/**
 * Sorts Bible versions by language and alphabetically by abbreviation
 * @params {Object} bibleVersionList list of Bible versions
 * @returns {Object} sorted list of Bibles
 */
function sortVersionsByLanguage(bibleVersionList) {
  let sortedVersions = {};

  for (const version of bibleVersionList) {
    if (!sortedVersions[version.language]) {
      sortedVersions[version.language] = [];
    }
    sortedVersions[version.language].push(version);
  }
  for (const version in sortedVersions) {
    sortedVersions[version].sort( (a, b) => {
      const nameA = a.abbreviation.toUpperCase();
      const nameB = b.abbreviation.toUpperCase();
      if (nameA < nameB) {
        return -1;
      }
      if (nameA > nameB) {
        return 1;
      }
      return 0;
    } );
  }
  return sortedVersions;
}

/**
 * Loads breadcrumb links on page
 */
function loadBreadcrumbs(abbreviation, bibleVersionID, bibleBookID, bibleChapterID, bibleVerseID) {
  let breadcrumbsHTML = `<ul>`;

  if (abbreviation && !bibleBookID && !bibleChapterID && !bibleVerseID) {
    breadcrumbsHTML += `<li>${abbreviation}</li>`;
  }
  if (bibleBookID) {
    breadcrumbsHTML += `<li><a href="javascript:void(0);" onclick="updatePage('version=${bibleVersionID}&abbr=${abbreviation}')">${abbreviation}</a></li>
                        <li>${bibleBookID}</li>`;
  }
  if (bibleChapterID) {
    const [bibleBookID, chapNum] = bibleChapterID.split(`.`);
    breadcrumbsHTML += `<li><a href="javascript:void(0);" onclick="updatePage('version=${bibleVersionID}&abbr=${abbreviation}')">${abbreviation}</a></li>
                        <li><a href="javascript:void(0);" onclick="updatePage('version=${bibleVersionID}&abbr=${abbreviation}&book=${bibleBookID}')">${bibleBookID}</a></li>
                        <li>${chapNum}</li>`;
  }
  if (bibleVerseID) {
    let [bibleBookID, chapNum, verseNum] = bibleVerseID.split(`.`);
    if (bibleVerseID.includes(`-`)) {
      verseNum = getVerseNumber(bibleVerseID);
    }
    breadcrumbsHTML += `<li><a href="javascript:void(0);" onclick="updatePage('version=${bibleVersionID}&abbr=${abbreviation}')">${abbreviation}</a></li>
                        <li><a href="javascript:void(0);" onclick="updatePage('version=${bibleVersionID}&abbr=${abbreviation}&book=${bibleBookID}')">${bibleBookID}</a></li>
                        <li><a href="javascript:void(0);" onclick="updatePage('version=${bibleVersionID}&abbr=${abbreviation}&chapter=${bibleBookID}.${chapNum}')">${chapNum}</a></li>
                        <li>${verseNum}</li>`;
  }

  breadcrumbs.innerHTML = breadcrumbsHTML;
  return breadcrumbsHTML;
}

/**
 * Updates URL with provided parameters
 * @param {string} params to update url with
 */
function updateParamsInURL(params) {
  if (history.pushState) {
    const newurl = `index.html` + `?` + params;
    window.history.pushState({params:params},``,newurl);
  }
}

/**
 * Gets query parameter from URL based on name
 * @param {string} name of query parameter
 * @returns {string} value of query parameter
 */
function getParameterByName(name) {
  const url = window.location.href;
  name = name.replace(/[\[\]]/g, `\\$&`);
  const regex = new RegExp(`[?&]` + name + `(=([^&#]*)|&|#|$)`),
    results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return ``;
  return decodeURIComponent(results[2].replace(/\+/g, ` `));
}
;
