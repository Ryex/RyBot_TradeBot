// get app envierment setup
var rek = require('rekuire');

var app_env = rek('env')

// get the function we need to set up
var startup = rek('startup.js');


startup.setupScribe();

var app = startup.buildApp();

startup.run(app, function(err, result) {
    console.log("[Startup] All services running.")
});
