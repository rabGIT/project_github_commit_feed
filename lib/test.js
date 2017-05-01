var githubAPI = require('./githubAPI');


var p = githubAPI.commits('rabGIT', 'assignment_building_the_express_router');
p.then(function(res) { console.log( res) }  );
