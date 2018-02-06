const API_KEY = `81f316c5f31960d155555818b8d0a59c` // Fill this in with your own API key from https://scripture.api.bible/

/**
 * Fills in list on page with Bible versions.
 * @returns {object} containing list of Bible versions
 */
function loadBibleVersions() {
  const versionList = document.querySelector(`#bible-version-list`);
  let versionHTML = ``;
  return getBibleVersions().then((bibleVersionList) => {
    for (let version of bibleVersionList) {
      versionHTML += `<li><a href="book.html?version=${version['id']}"> ${version['name']} </a></li>`
    }
    versionList.innerHTML = versionHTML;
    return bibleVersionList;
  })
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
        const response = JSON.parse(this.responseText)
        versions = response.data.map( version => { return {name: version[`name`], id: version[`id`] } } )
        resolve(versions);
      }
    });

    xhr.open(`GET`, `https://api.scripture.api.bible/v1/bibles`);
    xhr.setRequestHeader(`api-key`, API_KEY);

    xhr.onerror = () => reject(xhr.statusText)

    xhr.send();
  })
}

/**
 * Fills in list on page with books from selected version of the Bible (version specified in query params).
 * @returns {object} containing list of books of the Bible
 */
function loadBooks() {
  const bibleBookList = document.querySelector(`#book-list`);
  const bibleVersionID = getParameterByName(`version`);
  let bookHTML = ``;

  if (!bibleVersionID) {
    window.location.href = `./index.html`
  }

  return getBooks(bibleVersionID).then((bookList) => {
    for (let book of bookList) {
      bookHTML += `<li><a href="chapter.html?version=${bibleVersionID}&book=${book['id']}"> ${book['name']} </a></li>`
    }
    bibleBookList.innerHTML = bookHTML;
    return bookList;
  })
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
        const response = JSON.parse(this.responseText)
        books = response.data.map( book => { return {name: book[`name`], id: book[`id`] } } )

        resolve(books);
      }
    });

    xhr.open(`GET`, `https://api.scripture.api.bible/v1/bibles/${bibleVersionID}/books`);
    xhr.setRequestHeader(`api-key`, API_KEY);

    xhr.onerror = () => reject(xhr.statusText)

    xhr.send();
  })
}

/**
 * Fills in list on page with chapters from selected book of the Bible (version and book specified in query params).
 * @returns {object} containing list of chapters from selected book
 */
function loadChapters() {
  let bibleChapterList = document.querySelector(`#chapter-list`);
  const bibleVersionID = getParameterByName(`version`);
  const bibleBookID = getParameterByName(`book`);
  let chapterHTML = ``;

  if (!bibleVersionID || !bibleBookID) {
    window.location.href = `./index.html`;
  }

  return getChapters(bibleVersionID, bibleBookID).then((chapterList) => {
    for (let chapter of chapterList) {
      chapterHTML += `<li><a href="verse.html?version=${bibleVersionID}&chapter=${chapter['id']}"> ${chapter['number']} </a></li>`
    }
    bibleChapterList.innerHTML = chapterHTML;
    return chapterList;
  })
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
        const response = JSON.parse(this.responseText);
        chapters = response.data.map( chapter => { return {number: chapter[`number`], id: chapter[`id`] } } );

        resolve(chapters);
      }
    });

    xhr.open(`GET`, `https://api.scripture.api.bible/v1/bibles/${bibleVersionID}/books/${bibleBookID}/chapters`);
    xhr.setRequestHeader(`api-key`, API_KEY);

    xhr.onerror = () => reject(xhr.statusText);

    xhr.send();
  })
}


/**
 * Fills in list on page with verses from selected chapter (version and chapter specified in query params).
 * @returns {object} containing list of verses from selected book
 */
function loadVerses() {
  let bibleVerseList = document.querySelector(`#verse-list`);
  const bibleVersionID = getParameterByName(`version`);
  const bibleChapterID = getParameterByName(`chapter`);
  let verseHTML = ``

  if (!bibleVersionID || !bibleChapterID) {
    window.location.href = `./index.html`;
  }

  return getVerses(bibleVersionID, bibleChapterID).then((verseList) => {
    for (let verse of verseList) {
      verseHTML += `<li><a href="verse-selected.html?version=${bibleVersionID}&verse=${verse['id']}"> ${verse['id']} </a></li>`
    }
    bibleVerseList.innerHTML = verseHTML;
    return verseList;
  })
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
        const response = JSON.parse(this.responseText);
        verses = response.data.map( verse => { return { id: verse[`id`] } } );

        resolve(verses);
      }
    });

    xhr.open(`GET`, `https://api.scripture.api.bible/v1/bibles/${bibleVersionID}/chapters/${bibleChapterID}/verses`);
    xhr.setRequestHeader(`api-key`, API_KEY);

    xhr.onerror = () => reject(xhr.statusText);

    xhr.send();
  })
}

/**
 * Fills in the selected verse (version and verse specified in query params).
 * @returns {Object} containing selected verse
 */
function loadSelectedVerse() {
  let bibleVerseList = document.querySelector(`#verse`);
  const bibleVersionID = getParameterByName(`version`);
  const bibleVerseID = getParameterByName(`verse`);

  if (!bibleVersionID || !bibleVerseID) {
    window.location.href = `./index.html`;
  }

  return getSelectedVerse(bibleVersionID, bibleVerseID).then((verse) => {
    getBookNameFromID(verse.bibleId, verse.bookId).then((book) => {
      bibleVerseList.innerHTML = `<span><i>${book} ${bibleVerseID.slice(4)}</i></span> ${verse.content}`;
    });
    return verse;
  })
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
        const response = JSON.parse(this.responseText).data;
        verse = {id: response['id'], content: response['content'], bookId: response['bookId'], bibleId: response['bibleId']}

        resolve(verse);
      }
    });

    xhr.open(`GET`, `https://api.scripture.api.bible/v1/bibles/${bibleVersionID}/verses/${bibleVerseID}?include-chapter-numbers=false&include-verse-numbers=false`);
    xhr.setRequestHeader(`api-key`, API_KEY);

    xhr.onerror = () => reject(xhr.statusText);

    xhr.send();
  })
}

function getBookNameFromID(bibleVersionID, bibleBookID) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.withCredentials = false;

    xhr.addEventListener(`readystatechange`, function() {
      if (this.readyState === this.DONE) {
        const response = JSON.parse(this.responseText).data;
        resolve(response['name']);
      }
    });

    xhr.open(`GET`, `https://api.scripture.api.bible/v1/bibles/${bibleVersionID}/books/${bibleBookID}`);
    xhr.setRequestHeader(`api-key`, API_KEY);

    xhr.onerror = () => reject(xhr.statusText);

    xhr.send();
  })
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
