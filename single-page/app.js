const API_KEY = `81f316c5f31960d155555818b8d0a59c`; // Fill this in with your own API key from https://scripture.api.bible/

const breadcrumbs = document.querySelector(`#breadcrumbs`);
const title = document.querySelector(`#title`);
const list = document.querySelector(`#list`);
const textContent = document.querySelector(`#content`);

updatePage();

/**
 * Updates page pased on parameters.
 * @param {object} param contianing query parameters
 */
function updatePage(params) {
  if (params) {
    updateParamsInURL(params);
  }

  const abbreviation = getParameterByName(`abbr`);
  const bibleVersionID = getParameterByName(`version`);
  const bibleBookID = getParameterByName(`book`);
  const bibleChapterID = getParameterByName(`chapter`);
  const bibleVerseID = getParameterByName(`verse`);

  loadBreadcrumbs(abbreviation, bibleVersionID, bibleBookID, bibleChapterID, bibleVerseID);
  textContent.innerHTML = ``;

  if (!bibleVersionID || ! abbreviation) {
    title.innerHTML = `Choose a Bible version:`;
    loadBibleVersions();
  }
  if (bibleVersionID && !bibleBookID && !bibleChapterID && !bibleVerseID) {
    title.innerHTML = `Choose a book of the Bible:`;
    loadBooks(bibleVersionID, abbreviation);
  }
  if (bibleVersionID && bibleBookID) {
    title.innerHTML = `Choose a chapter of the Bible:`;
    loadChapters(bibleVersionID, abbreviation, bibleBookID);
  }
  if (bibleVersionID && bibleChapterID) {
    title.innerHTML = `Choose a verse:`;
    loadVerses(bibleVersionID, abbreviation, bibleChapterID);
  }
  if (bibleVersionID && bibleVerseID) {
    title.innerHTML = `Selected verse:`;
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
    for (let version of bibleVersionList) {
      versionHTML += `<li>(<a href="#" onclick="updatePage('version=${version.id}&abbr=${version.abbreviation}')">${version.abbreviation}</a>) ${version.name} ${version.description ? '- ' + version.description : ''}</li>`;
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
        const versions = data.map( ({name, id, abbreviation, description}) => { return {name, id, abbreviation, description}; } );
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

  let bookHTML = ``;

  return getBooks(bibleVersionID).then((bookList) => {
    for (let book of bookList) {
      bookHTML += `<li><a href="#" onclick="updatePage('version=${bibleVersionID}&abbr=${abbreviation}&book=${book.id}')"> ${book.name} </a></li>`;
    }
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
  let chapterHTML = ``;

  return getChapters(bibleVersionID, bibleBookID).then((chapterList) => {
    for (let chapter of chapterList) {
      chapterHTML += `<li class="grid"><a class="grid-link" href="#" onclick="updatePage('version=${bibleVersionID}&abbr=${abbreviation}&chapter=${chapter.id}')"> ${chapter.number} </a></li>`;
    }
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
  let verseHTML = ``;
  getChapterText(bibleVersionID, bibleChapterID).then((chapterText) => {
    textContent.innerHTML = chapterText;
  });

  return getVerses(bibleVersionID, bibleChapterID).then((verseList) => {
    for (let verse of verseList) {
      const verseNumber = getVerseNumber(verse.id);
      verseHTML += `<li class="grid"><a class="grid-link" href="#" onclick="updatePage('version=${bibleVersionID}&abbr=${abbreviation}&verse=${verse.id}')"> ${verseNumber} </a></li>`;
    }
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
        const {data} = JSON.parse(this.responseText);
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
      textContent.innerHTML = `<span><i>${book} ${bibleVerseID.slice(4)}</i></span>${content}`;
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
        const {content, bookId, bibleId} = JSON.parse(this.responseText).data;
        const verse = {content, bookId, bibleId};

        resolve(verse);
      }
    });

    xhr.open(`GET`, `https://api.scripture.api.bible/v1/bibles/${bibleVersionID}/verses/${bibleVerseID}?include-chapter-numbers=false&include-verse-numbers=false`);
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
 * Loads breadcrumb links on page
 */
function loadBreadcrumbs(abbreviation, bibleVersionID, bibleBookID, bibleChapterID, bibleVerseID) {
  let breadcrumbsHTML = `<a href="index.html">home</a> `;

  if (abbreviation && !bibleBookID && !bibleChapterID && !bibleVerseID) {
    breadcrumbsHTML += ` > ${abbreviation}`;
  }
  if (bibleBookID) {
    breadcrumbsHTML += ` > <a href="#" onclick="updatePage('version=${bibleVersionID}&abbr=${abbreviation}')">${abbreviation}</a>
                         > ${bibleBookID}`;
  }
  if (bibleChapterID) {
    const [bibleBookID, chapNum] = bibleChapterID.split(`.`);
    breadcrumbsHTML += ` > <a href="#" onclick="updatePage('version=${bibleVersionID}&abbr=${abbreviation}')">${abbreviation}</a>
                         > <a href="#" onclick="updatePage('version=${bibleVersionID}&abbr=${abbreviation}&book=${bibleBookID}')">${bibleBookID}</a>
                         > ${chapNum}`;
  }
  if (bibleVerseID) {
    let [bibleBookID, chapNum, verseNum] = bibleVerseID.split(`.`);
    if (bibleVerseID.includes(`-`)) {
      verseNum = getVerseNumber(bibleVerseID);
    }
    breadcrumbsHTML += ` > <a href="#" onclick="updatePage('version=${bibleVersionID}&abbr=${abbreviation}')">${abbreviation}</a>
                         > <a href="#" onclick="updatePage('version=${bibleVersionID}&abbr=${abbreviation}&book=${bibleBookID}')">${bibleBookID}</a>
                         > <a href="#" onclick="updatePage('version=${bibleVersionID}&abbr=${abbreviation}&chapter=${bibleBookID}.${chapNum}')"> ${chapNum} </a>
                         > ${verseNum}`;
  }

  breadcrumbs.innerHTML = breadcrumbsHTML;
  return breadcrumbsHTML;
}

function updateParamsInURL(params) {
  if (history.pushState) {
    var newurl = window.location.protocol + `//` + window.location.host + window.location.pathname.split(`?`)[0] + `?` + params;
    window.history.pushState({path:newurl},``,newurl);
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
