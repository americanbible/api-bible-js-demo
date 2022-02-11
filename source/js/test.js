/* globals chai */
const should = chai.should();
const expect = chai.expect;
const assert = chai.assert;
mocha.setup(`bdd`);

// Set up query parameters
var myURL = document.location;
if (myURL.toString().indexOf(`version`) === -1) {
  document.location = myURL + `?version=61fd76eafa1577c2-03&book=MAT&chapter=MAT.1&verse=MAT.1.1`;
}
const abbreviation = `GNTNT`;
const bibleVersionID = `61fd76eafa1577c2-03`;
const bibleBookID = `MAT`;
const bibleChapterID = `MAT.1`;
const bibleVerseID = `MAT.1.1`;

describe(`Load a bible version`, () => {
  it(`should have an API KEY set`, function(done) {
    if(API_KEY.length === 0) {
      throw Error(`Your api key is not set, please get one from https://scripture.api.bible/`);
    }
    done();
  });
  it(`should have a function named loadBibleVersions`, function(done) {
    loadBibleVersions.should.be.a(`function`);
    done();
  });
  it(`should have a function named getBibleVersions`, function(done) {
    getBibleVersions.should.be.a(`function`);
    done();
  });
  it(`should return a bible version list`, (done) => {
    loadBibleVersions().then(([{name, id}]) => {
      expect(name).to.be.a(`string`);
      expect(id).to.be.a(`string`);
      done();
    });
  });
});

describe(`Load a book`, () => {
  it(`should have a function named loadBooks`, function(done) {
    loadBooks.should.be.a(`function`);
    done();
  });
  it(`should have a function named getBooks`, function(done) {
    getBooks.should.be.a(`function`);
    done();
  });
  it(`should return a book list`, (done) => {
    loadBooks(bibleVersionID, abbreviation).then(([{name, id}]) => {
      expect(name).to.be.a(`string`);
      expect(id).to.be.a(`string`);
      done();
    });
  });
});

describe(`Load a chapter`, () => {
  it(`should have a function named loadChapters`, function(done) {
    loadChapters.should.be.a(`function`);
    done();
  });
  it(`should have a function named getChapters`, function(done) {
    getChapters.should.be.a(`function`);
    done();
  });
  it(`should return a chapter list`, (done) => {
    console.log('chapters', bibleVersionID)
    loadChapters(bibleVersionID, abbreviation, bibleBookID).then(([{id}]) => {
      expect(id).to.be.a(`string`);
      done();
    });
  });
});

describe(`Load a verse`, () => {
  it(`should have a function named loadVerses`, function(done) {
    loadVerses.should.be.a(`function`);
    done();
  });
  it(`should have a function named getVerses`, function(done) {
    getVerses.should.be.a(`function`);
    done();
  });
  it(`should return a verses list`, (done) => {
    loadVerses(bibleVersionID, abbreviation, bibleChapterID).then(([{id}]) => {
      expect(id).to.be.a(`string`);
      done();
    });
  });
});

describe(`Load a selected verse`, () => {
  it(`should have a function named loadSelectedVerse`, function(done) {
    loadSelectedVerse.should.be.a(`function`);
    done();
  });
  it(`should have a function named getSelectedVerse`, function(done) {
    getSelectedVerse.should.be.a(`function`);
    done();
  });
  it(`should return a selected verse`, (done) => {
    loadSelectedVerse(bibleVersionID, abbreviation, bibleVerseID).then((content) => {
      expect(content).to.be.a(`string`);
      done();
    });
  });
});

describe(`Load search results`, () => {
  it(`should have a function named search`, function(done) {
    search.should.be.a(`function`);
    done();
  });
  it(`should have a function named buildNav`, function(done) {
    buildNav.should.be.a(`function`);
    done();
  });
  it(`should have a function named getResults`, function(done) {
    getResults.should.be.a(`function`);
    done();
  });
  it(`should return results as a string`, (done) => {
    search(`cow`, 0, bibleVersionID, abbreviation).then((content) => {
      expect(content).to.be.a(`string`);
      done();
    });
  });
});

describe(`Load breadcrumbs`, () => {
  it(`should have a function named loadBreadcrumbs`, function(done) {
    loadBreadcrumbs.should.be.a(`function`);
    done();
  });
  it(`should return breadcrumbs`, (done) => {
    const content = loadBreadcrumbs(abbreviation, bibleVersionID, bibleBookID, bibleChapterID, bibleVerseID);
    expect(content).to.be.a(`string`);
    done();
  });
});

mocha.run();