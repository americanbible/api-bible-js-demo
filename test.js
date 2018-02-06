/* globals chai, */
const should = chai.should();
const expect = chai.expect;
mocha.setup(`bdd`);

describe(`Load a bible version`, () => {
  it(`should have a function named loadBibleVersions`, function(done) {
    loadBibleVersions.should.be.a(`function`);
    done();
  });

  it(`should return a bible version list`, (done) => {
    loadBibleVersions().then((result) => {
      expect(result).to.exist;
    });
  })
});

mocha.run();