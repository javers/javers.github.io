var team_logins = ['bgalek', 'bartoszwalacik', 'pawelszymczyk'];

var github = new Github({
    token: "2e71e2e2d92110c943fe135749d986b8401c64cb",
    auth: "oauth"
});

var repo = github.getRepo('javers', 'javers');

repo.contributors(function (err, data) {
    if (err) {
        console.log(err)
    } else {
        render_people(find_team(data), "#github-team");
        render_people(find_contributors(data), "#github-contributors");
    }
});

function render_people(people, selector) {
    function render_author(author) {
        return $("<div/>").append([
            $('<img />', {"src": author.avatar_url}),
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
