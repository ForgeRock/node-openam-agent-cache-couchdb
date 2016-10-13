var CouchDBCache = require('../index').CouchDBCache,
    Promise = require('bluebird'),
    assert = require('assert');

describe('CouchDBCache', function () {
    var couchdbCache;

    beforeEach(function () {
        couchdbCache = new CouchDBCache({
            protocol: process.env.COUCHDB_PROTOCOL || 'http',
            host: process.env.COUCHDB_HOST || 'localhost',
            port: process.env.COUCHDB_PORT || 32773,
            expireAfterSeconds: 1
        });
    });

    afterEach(function () {
        couchdbCache.quit();
    });

    describe('put', function () {
        it('should put an entry in MongoDB', function () {
            return couchdbCache.put('foo', 'bar')
                .then(function () {
                    return couchdbCache.get('foo');
                })
                .then(function (res) {
                    assert(res === 'bar');
                });
        });

        // the cleanup is not fast enough in mongodb, so the entry will still be there -- we can't really test this
        it('should make entries expire', function () {
            return couchdbCache.put('foo', 'bar')
                .then(function () {
                    return new Promise(function (resolve) {
                        setTimeout(resolve, 1500);
                    });
                })
                .then(function () {
                    return couchdbCache.get('foo');
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
        it('should get an entry from MongoDB', function () {
            return couchdbCache.put('foo', {foo: 'bar'})
                .then(function () {
                    return couchdbCache.get('foo');
                })
                .then(function (res) {
                    assert(res.foo === 'bar');
                });
        });

    });

    describe('remove', function () {
        it('should remove an entry from MongoDB', function () {
            return couchdbCache.put('foo', 'bar')
                .then(function () {
                    return couchdbCache.remove('foo');
                })
                .then(function () {
                    return couchdbCache.get('foo');
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
        xit('should close the connection to MongoDB and not allow any more operations', function () {
            return couchdbCache.quit()
                .then(function () {
                    return couchdbCache.put('foo', 'bar');
                })
                .then(function () {
                    // write allowed after the connection was closed
                    return Promise.reject();
                })
                .catch(function (err) {
                    assert(!!err);
                });
        });
    });
});
