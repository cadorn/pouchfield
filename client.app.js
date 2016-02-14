
exports.forSpine = function (SPINE) {
    
    const POUCHDB = require("pouchdb");

    var exports = {};
    
    exports.POUCHDB = POUCHDB;

    var Collection = exports.Collection = function (url, recordNamespace) {
        var self = this;
        
        if (typeof recordNamespace === "undefined") {
            recordNamespace = url;
            url = "";
        } else {
            url += "/";
        }
        
        recordNamespace = recordNamespace.replace(/\//g, "_");

        var db = new POUCHDB(url + recordNamespace);
    
        self.record = {
            create: function (id, data) {
                if (typeof data === "undefined") {
                    data = id;
                    id = undefined;
                }
                data._id = id || SPINE.UUID.v4();
                return db.put(data);
            },
            get: function (id) {
                return db.get(id);
            },
            set: function (id, property, value) {
                return db.get(id).then(function(doc) {
                    var data = doc;
                    if (typeof property === "string" && typeof value !== "undefined") {
                        data[property] = value;
                    } else {
                        Object.keys(property).forEach(function (name) {
                            data[name] = property[name];
                        });
                    }
                    return db.put(data);
                });
            },
            has: function (id) {
                return db.get(id).then(function (doc) {
                    return true;
                }).catch(function (err) {
                    if (err.status === 404) {
                        return false;
                    }
                    throw err;
                });
            }
        };
        self.records = {
            getAll: function () {
                return db.allDocs({
                    include_docs: true
                }).then(function (results) {
                    var records = {};
                    results.rows.forEach(function (row) {
                        records[row.id] = row.doc;
                        delete records[row.id]._id;
                        delete records[row.id]._rev;
                        records[row.id].id = row.id;
                    });
                    return records;
                });
            }
        }

        self.syncFrom = function (url, dbname) {

            dbname = dbname.replace(/\//g, "_");

console.log("sync from", url + "/" + dbname);

            var sync = SPINE.POUCHFIELD.POUCHDB.sync(
                url + "/" + dbname,
                recordNamespace,
                {
                  live: true,
                  retry: true
                }
            ).on('change', function (info) {
console.log("[rep] change", info);
              // handle change
            }).on('paused', function () {
console.log("[rep] paused");
              // replication paused (e.g. user went offline)
            }).on('active', function () {
              // replicate resumed (e.g. user went back online)
console.log("[rep] active");
            }).on('denied', function (info) {
              // a document failed to replicate (e.g. due to permissions)
console.log("[rep] denied", info);
            }).on('complete', function (info) {
              // handle complete
console.log("[rep] complete", info);
            }).on('error', function (err) {
              // handle error
console.log("[rep] error", err);
            });
        }

        self.syncTo = function (url, dbname) {

            dbname = dbname.replace(/\//g, "_");

console.log("sync to", url + "/" + dbname);
        	        
            var sync = SPINE.POUCHFIELD.POUCHDB.sync(
                recordNamespace,
                url + "/" + dbname,
                {
                  live: true,
                  retry: true
                }
            ).on('change', function (info) {
console.log("[rep] change", info);
              // handle change
            }).on('paused', function () {
console.log("[rep] paused");
              // replication paused (e.g. user went offline)
            }).on('active', function () {
              // replicate resumed (e.g. user went back online)
console.log("[rep] active");
            }).on('denied', function (info) {
              // a document failed to replicate (e.g. due to permissions)
console.log("[rep] denied", info);
            }).on('complete', function (info) {
              // handle complete
console.log("[rep] complete", info);
            }).on('error', function (err) {
              // handle error
console.log("[rep] error", err);
            });
        }
                

        function notifyChanged () {
            if (!notifyChanged.__debounced) {
                notifyChanged.__debounced = SPINE.LODASH.debounce(function () {

console.log("emit change");

                    self.emit("changed");
                }, 100);
            }
console.log("trigger change");
            notifyChanged.__debounced();
        }

        db.changes({
            since: 'now',
            live: true,
            include_docs: false
        }).on('change', function(info) {
            notifyChanged();
        });
    }
    Collection.prototype = Object.create(SPINE.EVENTS.EventEmitter.prototype);


    var collections = {};

	function getCollection (namespace) {
	    if (!collections[namespace]) {
	        collections[namespace] = new Collection(namespace);
	    }
	    return collections[namespace];
	}

    Collection.getAll = function (namespace) {
        return getCollection(namespace).records.getAll();
    },
    Collection.get = function (namespace, id) {
        return getCollection(namespace).record.get(id);
    },
    Collection.has = function (namespace, id) {
        return getCollection(namespace).record.has(id);
    },
    Collection.create = function (namespace, id, data) {
        return getCollection(namespace).record.create(id, data);
    },
    Collection.set = function (namespace, id, property, value) {
        return getCollection(namespace).record.set(id, property, value);
    },
    Collection.watch = function (namespace, onChange) {
        var collection = getCollection(namespace);
        function changed () {
            onChange();
        }
        collection.on("changed", changed);
		return function unwatch () {
            collection.off("changed", changed);
		};
    }
    return exports;   
}
