// Place your server entry point code here
// Require Express.js and minimist
const express = require("express")
const args = require('minimist')(process.argv.slice(2));
const port = args["port"] || args.p || 5000
const app = express()
console.log(args)

// Require db
const db = require('./database.js')
// Require fs
const fs = require('fs');
// Require morgan
const morgan = require('morgan')

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// functions
function coinFlip() {
    return (Math.floor(Math.random() * 2) == 0) ? "heads" : "tails";
}

function coinFlips(flips) {
    let results = [];
    let i = 0;
    while(i < flips) {
      results[i] = coinFlip();
      i ++;
    }
    return results;
}

function countFlips(array) {
    let heads = 0;
    let tails = 0;
    for(var i = 0; i < array.length; i ++) {
      if(array[i] == "heads") {
        heads ++;
      } else {
        tails ++;
      }
    }
    return {"heads": heads, "tails": tails};
}

function flipACoin(call) {
    let flip = coinFlip();
    let result = "";
    if(flip == call){
      result = "win";
    } else {
      result = "lose";
    }
    return {"call": call, "flip": flip, "result": result};
}
// Start an app server
const server = app.listen(port, () => {
    console.log('App listening on port %PORT%'.replace('%PORT%',port))
});

app.get('/app/', (req, res, next) => { // checkpoint
  res.json({"message":"working API(200)"});
  res.status(200);
});

if (args.log == 'false') {
  console.log("Not creating file access.log")
} else {
  const accessLog = fs.createWriteStream('access.log', { flags: 'a'})
  app.use(morgan('combined', {stream: accessLog }))
}

// Help text
const help = (`
server.js [options]
--port, -p	Set the port number for the server to listen on. Must be an integer
            between 1 and 65535.
--debug, -d If set to true, creates endlpoints /app/log/access/ which returns
            a JSON access log from the database and /app/error which throws 
            an error with the message "Error test successful." Defaults to 
            false.
--log		If set to false, no log files are written. Defaults to true.
            Logs are always written to database.
--help, -h	Return this message and exit.
`)

// If --help
if (args.help || args.h) {
  console.log(help)
  process.exit(0)
}

// Middleware
app.use((req, res, next) => {
  let logData = {
      remoteaddr: req.ip,
      remoteuser: req.user,
      time: Date.now(),
      method: req.method,
      url: req.url,
      protocol: req.protocol,
      httpversion: req.httpVersion,
      status: res.statusCode,
      referrer: req.headers['referer'],
      useragent: req.headers['user-agent']
  };
  console.log(logData)
  const stmt = db.prepare('INSERT INTO accesslog (remoteaddr, remoteuser, time, method, url, protocol, httpversion, status, referrer, useragent) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
  const info = stmt.run(logData.remoteaddr, logData.remoteuser, logData.time, logData.method, logData.url, logData.protocol, logData.httpversion, logData.status, logData.referrer, logData.useragent)
  next();
})

// Endpoints if --debug is true
if(args.debug === true) {
  // /app/log/access endpoint
  app.get('/app/log/access/', (req, res) => {
    const stmt = db.prepare("SELECT * FROM accesslog").all()
    res.status(200).json(stmt)
  });

  // /app/log/access endpoint
  app.get('/app/error', (req, res) => {
    throw new Error('Error, test successful')
  });
}

// checkpoints and endpoints
app.get('/app/', (req, res) => { 
  // Respond with status 200
      res.statusCode = 200;
  // Respond with status message "OK"
      res.statusMessage = 'OK';
      res.writeHead( res.statusCode, { 'Content-Type' : 'text/plain' });
      res.end(res.statusCode+ ' ' +res.statusMessage)
});

// Flip one coin endpoint
app.get('/app/flip/', (req, res) => {
      res.statusCode = 200;
      res.statusMessage = 'OK';
      // Flip coin
      const result = coinFlip();
      // Result
      res.json({"flip": result});
  });

// Flip multiple
app.get('/app/flips/:number', (req, res) => {
  // Status code and message
      res.statusCode = 200;
      res.statusMessage = 'OK';
      // Flip multiple coins
      const flips = coinFlips(req.params.number);
      // Result
      res.json({"raw": flips, "summary": countFlips(flips)});
  });

// Call heads
app.get('/app/flip/call/heads', (req, res) => {
  // Respond with status and message
      res.statusCode = 200;
      res.statusMessage = 'OK';
      // Flip coin and return result as given by function
      const result = flipACoin("heads");
      res.json(result);
  });

// Call tails
app.get('/app/flip/call/tails', (req, res) => {
  // Respond with status and message
      res.statusCode = 200;
      res.statusMessage = 'OK';
      // Flip coin and return result as given by function
      const result = flipACoin("tails");
      res.json(result);
  });

  // Default response for any other request
app.use(function(req, res){
  res.status(404).send('404 NOT FOUND')
});