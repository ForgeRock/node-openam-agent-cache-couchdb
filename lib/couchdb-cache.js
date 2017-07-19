var Promise = require('bluebird'),
    util = require('util'),
    nano = require('nano'),
    Cache = require('@forgerock/openam-agent-cache').Cache;

/**
 * Cache implementation for CouchDB
 *
 * @extends Cache
 *
 * @param {object} [options] Options
 * @param {string} [options.url] CouchDB base URL (or use protocol + host + port)
 * @param {string} [options.protocol=http] CouchDB protocol (http|https)
 * @param {string} [options.host=http://localhost] CouchDB host
 * @param {string} [options.port=5984] CouchDB port
 * @param {string} [options.db=openamagent] CouchDB database name
 * @param {object} [options.auth] CouchDB auth credentials
 * @param {string} [options.auth.username] CouchDB user name
 * @param {string} [options.auth.password] CouchDB password
 * @param {number} [options.expireAfterSeconds=60] Expiration time in seconds
 *
 * @example
 * var couchDBCache = new CouchDBCache({
 *   host: 'db.example.com',
 *   port: 5984,
 *   auth: {
 *     username: 'admin',
 *     password: 'secret123'
 *   },
 *   expireAfterSeconds: 600
 * });
 *
 * @constructor
 */
function CouchDBCache(options) {
    var self = this;
    options = options || {};

    this.expireAfterSeconds = options.expireAfterSeconds || 60;

    this.connection = Promise.resolve()
        .then(function () {
            return options.auth ? this.auth(options.auth.username, options.auth.password) : null;
        })
        .then(function (cookie) {
            return nano({
                url: options.url || (options.protocol + '://' + options.host + ':' + options.port),
                cookie: cookie
            });
        });

    // create database if it doesn't exist
    this.db = this.connection.then(function (connection) {
        var dbName = options.db || 'openamagent';
        return Promise.promisify(connection.db.create.bind(connection.db))(dbName)
            .catch(function () {
                // ignore
            })
            .then(function () {
                return connection.use(dbName);
            });
    });
}

util.inherits(CouchDBCache, Cache);

/**
 * Performs authentication against CouchDB and returns the session cookie
 * 
 * @param {string} username
 * @param {string} password
 * @returns {Promise<string>} Session cookie string
 */
CouchDBCache.prototype.auth = function (username, password) {
    return new Promise(function (resolve, reject) {
        nano.auth(username, userpass, function (err, body, headers) {
            if (err) {
                return reject(err);
            }

            if (headers && headers['set-cookie']) {
                return resolve(headers['set-cookie']);
            }

            reject('No cookies in response');
        });
    })
}



/**
 * Get a single cached item
 * If the entry is not found, reject
 *
 * @param {string} key
 *
 * @return {Promise}
 *
 * @example
 * couchDBCache.get('foo').then(function (cached) {
 *   console.log(cached);
 * }).catch(function (err) {
 *   console.error(err);
 * });
 */
CouchDBCache.prototype.get = function (key) {
    var self = this;

    return this.db
        .then(function (db) {
            return Promise.promisify(db.get)(key);
        })
        .then(function (res) {
            if (!res) {
                throw new Error('CouchDBCache: entry ' + key + ' not found in cache');
            }

            var expires = new Date(res.timestamp);

            if (self.expireAfterSeconds && Date.now() > expires.getTime() + (self.expireAfterSeconds * 1000)) {
                self.remove(key);
                throw new Error('CouchDBCache: entry ' + key + ' expired');
            }

            return res.data;
        });
};

/**
 * Store a single cached item (overwrites existing)
 *
 * @param {string} key
 *
 * @param {*} value
 *
 * @return {Promise}
 *
 * @example
 * couchDBCache.put('foo', {bar: 'baz'}).then(function () {
 *   console.log('foo saved to cache');
 * }).catch(function (err) {
 *   console.error(err);
 * });
 */
CouchDBCache.prototype.put = function (key, value) {
    return this.db.then(function (db) {
        return Promise.promisify(db.insert)({ data: value, timestamp: new Date() }, key);
    });
};

/**
 * Remove a single cached item
 *
 * @param {string} key
 *
 * @return {Promise}
 *
 * @example
 * couchDBCache.remove('foo').then(function () {
 *   console.log('foo removed from cache');
 * }).catch(function (err) {
 *   console.error(err);
 * });
 */
CouchDBCache.prototype.remove = function (key) {
    var self = this
    _db;
    return this.db
        .then(function (db) {
            _db = db;
            return this.get(key);
        })
        .then(function (res) {
            return Promise.promisify(_db.destroy)(key, res._rev);
        });
};

/**
 * Replaces the database and connection objects with a rejected Promise to prevent further operations
 *
 * @return {Promise}
 */
CouchDBCache.prototype.quit = function () {
    this.connection = this.db = Promise.reject('Connection closed');
    return Promise.resolve();
};

module.exports.CouchDBCache = CouchDBCache;
