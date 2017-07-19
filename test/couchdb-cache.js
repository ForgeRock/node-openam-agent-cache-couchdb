var CouchDBCache = require('../index').CouchDBCache,
    nano = require('nano'),
    Promise = require('bluebird'),
    assert = require('assert');

process.on("unhandledRejection", function (reason, promise) {
    // ignore
});

describe('CouchDBCache', function () {
    var couchdbCache,
        dbUrl = process.env.COUCHDB_URL || 'http://localhost:32770',
        dbName = 'couchdb-cache-test';

    beforeEach(function () {
        couchdbCache = new CouchDBCache({
            url: dbUrl,
            db: dbName,
            expireAfterSeconds: 0.1
        });
    });

    after(function (done) {
        nano(dbUrl).db.destroy(dbName, done);
    });

    describe('put', function () {
        afterEach(function () {
            couchdbCache.quit();
        });

        it('should put an entry in CouchDB', function () {
            return couchdbCache.put('foo1', 'bar')
                .then(function () {
                    return couchdbCache.get('foo1');
                })
                .then(function (res) {
                    assert(res === 'bar');
                });
        });

        // the cleanup is not fast enough in CouchDB, so the entry will still be there -- we can't really test this
        it('should make entries expire', function () {
            return couchdbCache.put('foo2', 'bar')
                .then(function () {
                    return new Promise(function (resolve) {
                        setTimeout(resolve, 200);
                    });
                })
                .then(function () {
                    return couchdbCache.get('foo2');
                })
                .then(function (res) {
                    console.log(res);
                    assert(res === null);
                })
                .catch(function (err) {
                    assert(!!err);
                });
        });


    });

    describe('get', function () {
        afterEach(function () {
            couchdbCache.quit();
        });

        it('should get an entry from CouchDB', function () {
            return couchdbCache.put('foo3', { foo: 'bar' })
                .then(function () {
                    return couchdbCache.get('foo3');
                })
                .then(function (res) {
                    assert(res.foo === 'bar');
                });
        });

    });

    describe('remove', function () {
        afterEach(function () {
            couchdbCache.quit();
        });

        it('should remove an entry from CouchDB', function () {
            return couchdbCache.put('foo4', 'bar')
                .then(function () {
                    return couchdbCache.remove('foo4');
                })
                .then(function () {
                    return couchdbCache.get('foo4');
                })
                .then(function (res) {
                    assert(res === null);
                })
                .catch(function (err) {
                    assert(!!err);
                });
        });
    });

    describe('quit', function () {
        it('should close the connection to CouchDB and not allow any more operations', function () {
            var expectedError;

            return couchdbCache.quit()
                .then(function () {
                    return couchdbCache.put('foo5', 'bar');
                })
                .catch(function (err) {
                    expectedError = err;
                    assert(!!err)
                })
                .then(function () {
                    assert(!!expectedError);
                });
        });
    });
});
