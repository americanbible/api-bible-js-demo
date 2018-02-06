/* globals chai, */
const should = chai.should();
const expect = chai.expect;
const assert = chai.assert;
mocha.setup(`bdd`);

// Set up query parameters
var myURL = document.location;
if (myURL.toString().indexOf(`version`) === -1) {
  document.location = myURL + `?version=61fd76eafa1577c2-03&book=MAT&chapter=MAT.1&verse=MAT.1.1`;
}

describe(`Load a bible version`, () => {
  it(`should have an API key`, (done) => {
    assert.isAbove(API_KEY.length, 0, 'API KEY length is more than 0');
    done();
  })
  it(`should have a function named loadBibleVersions`, function(done) {
    loadBibleVersions.should.be.a(`function`);
    done();
  });
  it(`should have a function named getBibleVersions`, function(done) {
    getBibleVersions.should.be.a(`function`);
    done();
  });
  it(`should return a bible version list`, (done) => {
    loadBibleVersions().then((result) => {
      expect(result).to.exist;
      done();
    });
  })
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
    loadBooks().then((result) => {
      expect(result).to.exist;
      done();
    });
  })
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
    loadChapters().then((result) => {
      expect(result).to.exist;
      done();
    });
  })
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
    loadVerses().then((result) => {
      expect(result).to.exist;
      done();
    });
  })
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
    loadSelectedVerse().then((result) => {
      expect(result).to.exist;
      done();
    });
  })
});

mocha.run();