var team_logins = ['bgalek', 'bartoszwalacik', 'pawelszymczyk', 'mwesolowski'];

var github = new Github({
    token: "2e71e2e2d92110c943fe135749d986b8401c64cb",
    auth: "oauth"
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

function find_contributors(people) {
    return people.filter(function (it) {
        return team_logins.indexOf(it.author.login) < 0;
    });
}
