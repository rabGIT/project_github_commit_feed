const http = require('http');
const url = require('url');
const fs = require('fs');
const githubAPI = require('./lib/githubAPI');

// load commitFeed data
const commitFeed = require('./data/commits.json');
var commits = JSON.stringify(commitFeed, null, 2);

const hostname = '127.0.0.1';
const port = 3000;

const server = http.createServer((req, res) => {

  // process form request
  var request = url.parse(req.url, true);
  console.log(`Username: ${request.query.user} \nRepo: ${request.query.repo} `);
  var p = githubAPI.commits(request.query.user, request.query.repo);
  p.then(function(res) { console.log( res) }, function(err) {console.error(err);}  );

  // build response
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/html');
  var html = fs.readFileSync('./public/index.html');
  html = html.toString().replace('{{ commitFeed }}' , commits)
  res.end(html);
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
