var team_logins = ['bartoszwalacik'];

var redis_team_logins = ['IvanSimeonov', 'martindobrev', 'assen-sharlandjiev-akros-ch', 'assens'];

var github = new Github({
});

var repo = github.getRepo('javers', 'javers');

repo.contributors(function (err, data) {
    var sort_by_commit = function (a1, a2){
        return a2.total - a1.total;
    };

    if (err) {
        console.log(err)
    } else {
        render_people(find_team(data).sort(sort_by_commit), "#github-team");
        render_people(find_redis_team(data).sort(sort_by_commit), "#github-javers-redis-team");
        render_people(find_contributors(data).sort(sort_by_commit), "#github-contributors");
    }
});

function render_people(people, selector) {
    function render_author(author) {
        return $("<li/>",{"class":"github-user"}).append([
            $('<a />', {"href": author.html_url}).append($('<img />', {"src": author.avatar_url})),
            $('<a />', {"href": author.html_url}).append(author.login)
        ]);
    }

    var people_nodes = people.map(function (it) {
        return render_author(it.author);
    });
    $(selector).append(people_nodes);
}

function find_team(people) {
    return people.filter(function (it) {
        return team_logins.indexOf(it.author.login) >= 0;
    });
}

function find_redis_team(people) {
    return people.filter(function (it) {
        return redis_team_logins.indexOf(it.author.login) >= 0;
    });
}

function find_contributors(people) {
    return people.filter(function (it) {
        return team_logins.indexOf(it.author.login) < 0;
    });
}
