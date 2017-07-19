# openam-agent-cache-couchdb
Cache using CouchDB for the OpenAM Policy Agent for NodeJS

Installation: `npm install openam-agent-cache-couchdb`

# API Docs

<a name="CouchDBCache"></a>

## CouchDBCache ⇐ <code>Cache</code>
**Kind**: global class  
**Extends:** <code>Cache</code>  

* [CouchDBCache](#CouchDBCache) ⇐ <code>Cache</code>
    * [new CouchDBCache([options])](#new_CouchDBCache_new)
    * [.get(key)](#CouchDBCache+get) ⇒ <code>Promise</code>
    * [.put(key, value)](#CouchDBCache+put) ⇒ <code>Promise</code>
    * [.remove(key)](#CouchDBCache+remove) ⇒ <code>Promise</code>
    * [.quit()](#CouchDBCache+quit) ⇒ <code>Promise</code>

<a name="new_CouchDBCache_new"></a>

### new CouchDBCache([options])
Cache implementation for CouchDB


| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [options] | <code>object</code> |  | Options |
| [options.protocol] | <code>string</code> | <code>&quot;http&quot;</code> | CouchDB protocol (http|https) |
| [options.host] | <code>string</code> | <code>&quot;http://localhost&quot;</code> | CouchDB host |
| [options.port] | <code>string</code> | <code>5984</code> | CouchDB port |
| [options.db] | <code>string</code> | <code>&quot;openamagent&quot;</code> | CouchDB database name |
| [options.auth] | <code>object</code> |  | CouchDB auth credentials |
| [options.auth.username] | <code>string</code> |  | CouchDB user name |
| [options.auth.password] | <code>string</code> |  | CouchDB password |
| [options.expireAfterSeconds] | <code>number</code> | <code>60</code> | Expiration time in seconds |

**Example**  
```js
var couchDBCache = new CouchDBCache({
  host: 'db.example.com',
  port: 5984,
  auth: {
    username: 'admin',
    password: 'secret123'
  },
  expireAfterSeconds: 600
});
```
<a name="CouchDBCache+get"></a>

### couchDBCache.get(key) ⇒ <code>Promise</code>
Get a single cached item
If the entry is not found, reject

**Kind**: instance method of <code>[CouchDBCache](#CouchDBCache)</code>  

| Param | Type |
| --- | --- |
| key | <code>string</code> | 

**Example**  
```js
couchDBCache.get('foo').then(function (cached) {
  console.log(cached);
}).catch(function (err) {
  console.error(err);
});
```
<a name="CouchDBCache+put"></a>

### couchDBCache.put(key, value) ⇒ <code>Promise</code>
Store a single cached item (overwrites existing)

**Kind**: instance method of <code>[CouchDBCache](#CouchDBCache)</code>  

| Param | Type |
| --- | --- |
| key | <code>string</code> | 
| value | <code>\*</code> | 

**Example**  
```js
couchDBCache.put('foo', {bar: 'baz'}).then(function () {
  console.log('foo saved to cache');
}).catch(function (err) {
  console.error(err);
});
```
<a name="CouchDBCache+remove"></a>

### couchDBCache.remove(key) ⇒ <code>Promise</code>
Remove a single cached item

**Kind**: instance method of <code>[CouchDBCache](#CouchDBCache)</code>  

| Param | Type |
| --- | --- |
| key | <code>string</code> | 

**Example**  
```js
couchDBCache.remove('foo').then(function () {
  console.log('foo removed from cache');
}).catch(function (err) {
  console.error(err);
});
```
<a name="CouchDBCache+quit"></a>

### couchDBCache.quit() ⇒ <code>Promise</code>
This should close the database connection but it doesn't do anything because connection.close() is broken...

**Kind**: instance method of <code>[CouchDBCache](#CouchDBCache)</code>  

## DISCLAIMER

The sample code described herein is provided on an "as is" basis, without warranty of any kind, to the fullest extent permitted by law. ForgeRock does not warrant or guarantee the individual success developers may have in implementing the sample code on their development platforms or in production configurations.

ForgeRock does not warrant, guarantee or make any representations regarding the use, results of use, accuracy, timeliness or completeness of any data or information relating to the sample code. ForgeRock disclaims all warranties, expressed or implied, and in particular, disclaims all warranties of merchantability, and warranties related to the code, or any service or software related thereto.

ForgeRock shall not be liable for any direct, indirect or consequential damages or costs of any type arising out of any action taken by you or others related to the sample code.
