
var SPINE = {
    EVENTS: require("events"),
    UUID: require("uuid"),
    ASYNC: require("async"),
    LODASH: require("lodash"),
    Promise: require("bluebird")
};

var POUCHFIELD = require("../client.app").forSpine(SPINE);


/*
var collection = new POUCHFIELD.Collection(window.location.origin + "/pouchfield/couchdb/records");

collection.on("changed", function () {

    console.log("records changed");

    collection.records.getAll().then(function (records) {

        console.log("records", records);
    });
});
*/
/*
var id = "id7";
collection.record.has(id).then(function (has) {
    console.log("has record", id, has);
    if (!has) {
        console.log("insert record", id);
        collection.record.create(id, {
            label: "label for record " + id
        }).then(function (result) {
console.log("created", result);
        });
    }
});
*/

var LIBRARY_NS = window.location.origin + "/pouchfield/couchdb/records";


var q = SPINE.ASYNC.queue(function (task, callback) {
    
    var id = task.id;

console.log("check record", id);

    return POUCHFIELD.Collection.has(LIBRARY_NS, id).then(function (found) {
        if (found) {
console.log("found existing record", LIBRARY_NS, id);
            return callback();
        }
console.log("Insert new library record", LIBRARY_NS, id);
        return POUCHFIELD.Collection.create(LIBRARY_NS, id, task).then(function () {
            return callback();
        });
    }).catch(callback);
}, 3);

q.drain = function() {
    console.log("done insertions");
}



for (var i=0; i<50; i++) {
    q.push({
        id: "id:" + i,
        label: "Label: " + i
    }, function (err) {
        if (err) throw err;
    });
}
