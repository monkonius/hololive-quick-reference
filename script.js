const BASE_URL = 'https://virtualyoutuber.fandom.com/api.php';

const NONMEMBERS = ['Hololive', 'Language of Hololive Talents'];

function createQuery(params) {
    let query = BASE_URL;
    query += '?origin=*';
    Object.keys(params).forEach(key => {
        query += '&' + key + '=' + params[key];
    });
    query += '&format=json';

    return query;
}

const memberQuery = createQuery({
    action: 'query',
    list: 'categorymembers',
    cmtitle: 'Category:Hololive',
    cmtype: 'page',
    cmlimit: '500',
});

fetch(memberQuery)
    .then(response => response.json())
    .then(data => {
        const members = data.query.categorymembers.filter(member => {
            return !NONMEMBERS.includes(member.title);
        });

        for (let member of members) {
            const option = document.createElement('option');
            option.innerHTML = member.title;
            option.setAttribute('value', member.title);
            document.getElementById('members').append(option);
        }
    })

    .catch(err => {
        console.log('Error: ', err);
    });