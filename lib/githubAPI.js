var Github = require('github');
var gitHubToken = process.env.GITHUB_API_TOKEN;
var github = new Github();

github.authenticate({
  type: "token",
  token: gitHubToken,
});

var commitCall = function(username, repo, callback) {
  
github.repos.getCommits({
        owner: username,
        repo: repo
      }, callback);


};

module.exports =
  function() {
    return {
      commits: function(username, repo) {
        var p = new Promise(function(resolve, reject) {
          commitCall(username, repo, (err, data) => {
            if (err) {
              reject(err);
            } else {
              resolve({username: username, repo: repo, commits: data});
            }
          });

        });
        return p;
      }
    }
  }();


/*
github.repos.getCommits({
  owner: 'rabGIT',
  repo: 'assignment_building_the_express_router'
}, function(err, res) {
  console.log(JSON.stringify(res));
});
*/
