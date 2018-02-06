const API_KEY = `` // Fill this in with your own API key from https://scripture.api.bible/

/**
 * Fills in list on page with Bible versions.
 */
function loadBibleVersions() {
	const versionList = document.querySelector(`#bible-version-list`);
	let versionHTML = ``
	getBibleVersions().then((bibleVersionList) => {
		for (let version of bibleVersionList) {
			versionHTML += `<li><a href="book.html?version=${version['id']}"> ${version['name']} </a></li>`
		}
		versionList.innerHTML = versionHTML;
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

		xhr.addEventListener(`readystatechange`, () => {
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
 */
function loadBooks() {
	const bibleBookList = document.querySelector(`#book-list`);
	const bibleVersionID = getParameterByName(`version`)
	let bookHTML = ``

	if (!bibleVersionID) {
		window.location.href = `./index.html`
	}

	getBooks(bibleVersionID).then((bookList) => {
		for (let book of bookList) {
			bookHTML += `<li><a href="chapter.html?version=${bibleVersionID}&book=${book['id']}"> ${book['name']} </a></li>`
		}
		bibleBookList.innerHTML = bookHTML;
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

		xhr.addEventListener(`readystatechange`, () => {
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
 */
function loadChapters() {
	let bibleChapterList = document.querySelector(`#chapter-list`);
	const bibleVersionID = getParameterByName(`version`)
	const bibleBookID = getParameterByName(`book`)
	let chapterHTML = ``

	if (!bibleVersionID || !bibleBookID) {
		window.location.href = `./index.html`
	}

	getChapters(bibleVersionID, bibleBookID).then((chapterList) => {
		for (let chapter of chapterList) {
			chapterHTML += `<li><a href="verse.html?version=${bibleVersionID}&book=${bibleBookID}&chapter=${chapter['id']}"> ${chapter['number']} </a></li>`
		}
		bibleChapterList.innerHTML = chapterHTML;
	})
}

/**
 * Gets books of the Bible from API.Bible
 * @param {string} bibleVersionID to get chapters from
 * @param {string} bibleBookID to get chapters from
 * @returns {Promise} containing list of chapters from selected book
 */
function getChapters(bibleVersionID, bibleBookID) {
	return new Promise((resolve, reject) => {
		const xhr = new XMLHttpRequest();
		xhr.withCredentials = false;

		xhr.addEventListener(`readystatechange`, () => {
		  if (this.readyState === this.DONE) {
		    const response = JSON.parse(this.responseText)
		    chapters = response.data.map( chapter => { return {number: chapter[`number`], id: chapter[`id`] } } )

		    resolve(chapters);
		  }
		});

		xhr.open(`GET`, `https://api.scripture.api.bible/v1/bibles/${bibleVersionID}/books/${bibleBookID}/chapters`);
		xhr.setRequestHeader(`api-key`, API_KEY);

		xhr.onerror = () => reject(xhr.statusText)

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