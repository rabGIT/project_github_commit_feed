const http = require('http');
const url = require('url');
const fs = require('fs');
const githubAPI = require('./lib/githubAPI');

const hostname = '127.0.0.1';
const port = 3000;

var _headers = {
  "Content-Type": "text/html",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE"
};

var _extractBodyData = (req, done) => {
  var body = '';
  req.on('data', (data) => {
    body += data;
  });
  req.on('end', () => {
    req.body = body;
    done();
  });
};

const server = http.createServer((req, res) => {

  // process form request
  var request = url.parse(req.url, true);
  console.log(req);

  if (request.pathname === '/github/webhooks') {
    console.log('got a live one coming in');
    var p = new Promise((resolve) => {

      _extractBodyData(req, resolve);

    });

    // Respond with the correct handler
    // for the HTTP method and path
    p.then(function() {
      var payload = JSON.parse(decodeURIComponent(req.body).slice(8));
            res.writeHead(200, _headers);
            res.end('200 OK');
            processRequest(payload.pusher.name, payload.repository.name, (err,data) => {
              if (err) {
                console.error(err);
              } else {
                console.log(data);
              }
            })
      console.log(payload);
    });
  } else {


    var promise = new Promise(function(resolve, reject) {
      processRequest(request, (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
    // build response
    // load commitFeed data, but only when we know the request is processed
    promise.then(function(data) {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/html');

      res.end(createResponse());
    });
    promise.catch(function(err) {
      console.error(err)
    });

  }

});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});

function processRequest(request, callback) {
  console.log(`Username: ${request.query.user} \nRepo: ${request.query.repo} `);
  if (request.query.user == undefined) {
    callback(null, 'No user');
  };
  if (request.query.user.length == 0) {
    callback(null, 'No user');
  };
  handleGithubData(request.query.user, request.query.repo);

}

function handleGithubData(user, repo, callback) {
  var p = githubAPI.commits(user, repo);
  p.then(function(res) {
    var scrubbed = res.commits.data.map(function(commitItem) {
      return {
        author: commitItem.commit.author.name,
        message: commitItem.commit.message,
        html_url: commitItem.html_url,
        sha: commitItem.sha
      }
    });
    var request = {
      username: res.username,
      repo: res.repo,
      commits: scrubbed
    };
    console.log(JSON.stringify(request));
    fs.writeFileSync('./data/commits.json', JSON.stringify(request));
    callback(null, 'Success');
  });
  p.catch(function(err) {
    console.log(err);
  });
}

function createResponse() {
  var commitFeed = JSON.parse(fs.readFileSync('./data/commits.json'));
  var commits = JSON.stringify(commitFeed, null, 2);

  var html = fs.readFileSync('./public/index.html');
  return html.toString().replace('{{ commitFeed }}', commits)

}
