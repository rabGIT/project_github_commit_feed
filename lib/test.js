var githubAPI = require('./githubAPI');


var p = githubAPI.commits('rabGIT', 'assignment_building_the_express_router');
p.then(function(res) {
  console.log(res);
   scrubbed = res.commits.data.map(function(commitItem) {
      return {author: commitItem.commit.author.name,
              message: commitItem.commit.message,
              html_url: commitItem.html_url,
              sha: commitItem.sha}
    });
   console.log( scrubbed );
  }  );
