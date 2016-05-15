// interesting - look into this basic auth doc
// http://blog.modulus.io/nodejs-and-express-basic-authentication

var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var bodyParser = require('body-parser');
var moment = require('moment');

var Mongo = require('mongodb').MongoClient;
var assert = require('assert');

var url = 'mongodb://localhost:27017/teachcode';

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/static', express.static(__dirname + '/static'));
app.use('/', express.static(__dirname + '/site'));

var superadmins = ['jwclark@rockhursths.edu'];
var domains = ['rockhursths.edu','amdg.rockhursths.edu'];

var tokenSet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

// http://stackoverflow.com/questions/4816099/chrome-sendrequest-error-typeerror-converting-circular-structure-to-json
function simpleStringify (object){
    var simpleObject = {};
    for (var prop in object ){
        if (!object.hasOwnProperty(prop)){
            continue;
        }
        if (typeof(object[prop]) == 'object'){
            continue;
        }
        if (typeof(object[prop]) == 'function'){
            continue;
        }
        simpleObject[prop] = object[prop];
    }
    return JSON.stringify(simpleObject); // returns cleaned up JSON
};


var removeDocument = function(db, callback) {
    var collection = db.collection('bike');
    collection.deleteOne({a : 3}, function(err, result) {
        assert.equal(err, null);
        assert.equal(1, result.result.n);
        console.log('removed the doc');
        callback(result);
    });
};

//updates a:2 by adding b:1 in addition to a:2
var updateDocument = function(db, callback) {
    var collection = db.collection('bike');
    collection.updateOne(
        { a : 2 }
        , { $set : { b : 1 } }
        , function (err, result) {
            assert.equal(err, null);
            assert.equal(1, result.result.n);
            console.log('updated the document');
            callback(result);
        }
    );
};

var insertDocuments = function(db, callback) {
    var collection = db.collection('bike');
    collection.insertMany([
        {a:1},{a:2},{a:3}
    ], function(err, result) {
        assert.equal(err, null);
        assert.equal(3, result.result.n);
        assert.equal(3, result.ops.length);
        console.log('inserted 3 documents into the collection');
        callback(result);
    });
};

var findDocuments = function(db, callback) {
    var collection = db.collection('bike');
    collection.find({}).toArray(function(err,docs) {
        assert.equal(err,null);
        console.log('found records:');
        console.log(docs);
        callback(docs);
    });
};

var findWithFilter = function(db, callback) {
    var collection = db.collection('bike');
    collection.find({'a':3}).toArray(function(err, docs) {
        assert.equal(err,null);
        console.log('found filtered records:');
        console.log(docs);
        callback(docs);
    });
};

Mongo.connect(url, function(err, db) {
    assert.equal(null, err);
    console.log('connected successfully');
    
    
    Mongo.ops = {};
    Mongo.ops.insertJson = function(collection, json) {
        var c = db.collection(collection);
        c.insert(json, function(err, result) {
            assert.equal(err, null);
            console.log('inserted: ' + JSON.stringify(json));
        });
    };
    
    /*
    insertDocuments(db, function() {
        updateDocument(db, function() {
            removeDocument(db, function() {
                db.close();
            });
        });
    });
    */
});



io.on('connection', function(socket) {
    
    console.log('user connected');    
    
    socket.on('disconnect', function() {
        console.log('user disconnected');
    });
});


var generateJoinToken = function(length) {
    var token = '';
    for(var i = 0; i < length; i++) {
        var random = Math.floor(Math.random() * tokenSet.length);
        token += tokenSet[random];
    }
    return token;
};


app.post('/signinchanged', function(req, res) {
    console.log(req.body.email + ' has logged in');
    Mongo.ops.insertJson('logins', req.body);
    var options = {
        createCourse : superadmins.indexOf(req.body.email) === -1 ? false : true,
        joinCourse : domains.indexOf(req.body.domain) === -1 ? false : true
    };
    res.status(201).send(options);
});

app.post('/savecourse', function(req, res) {
    var joinToken = generateJoinToken(10);
    var course = req.body;
    course.joinToken = joinToken;
    course.timestamp = moment().format();
    
    console.log('creating a course with name = ' + req.body.name + ', and joinToken = ' + joinToken);
    Mongo.ops.insertJson('courses', course);
    res.status(201).send(joinToken);
});







http.listen(process.env.PORT || 80, function() {
    console.log('hosting from ' + __dirname);
    console.log('listening on 1898');
});
