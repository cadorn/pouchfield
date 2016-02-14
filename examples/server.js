
const PATH = require("path");
const EXPRESS = require('express');
const POUCHFIELD = require("..");
const BROWSERIFY = require("browserify");

const PORT = process.env.PORT || 8080;


var app = EXPRESS();

app.use('/pouchfield', POUCHFIELD.app({
    redis: {
        url: process.env.SERVICE_REDIS_URL
    }
}));

// TODO: Move these into gunshow lib/plugins.
app.get('/app.js', function (req, res, next) {
	var browserify = BROWSERIFY({
		basedir: __dirname,
		entries: [
		    'app.js'
	    ]
	});
	return browserify.bundle(function (err, data) {
		if (err) return next(err);
        res.writeHead(200, {
            "Content-type": "application/javascript"
        });
		return res.end(data.toString());
	});
});

app.use('/', EXPRESS.static(__dirname));

app.listen(PORT, function () {
    console.log('Examples server running at: http://127.0.0.1:' + PORT + "/");
});

