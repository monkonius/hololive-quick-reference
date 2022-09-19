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

document.querySelector('form').onsubmit = () => {
    const select = document.getElementById('members');
    let memberValue = select.value;
    memberValue = memberValue.replace(/\+ /, '%2B_');   // Special case for La+ Darkness

    const pageQuery = createQuery({
        action: 'parse',
        page: memberValue,
    })

    fetch(pageQuery)
        .then(response => response.json())
        .then(data => {
            const parser = new DOMParser();
            const page = parser.parseFromString(data.parse.text['*'], 'text/html');

            const infoboxElems = page.querySelectorAll('.portable-infobox *');
            const infobox = page.querySelector('.portable-infobox');

            for (let elem of infoboxElems) {
                if (elem.tagName === 'FIGURE' || elem.tagName === 'SUP' || elem.tagName === 'UL') {
                    elem.remove();
                } else if (elem.tagName === 'H2' && elem.dataset.source === "title1") {
                    elem.remove();
                } else if (elem.tagName === 'A' && elem.title !== 'Hololive') {
                    continue;
                }
                while (elem.attributes.length > 0) {
                    elem.removeAttribute(elem.attributes[0].name);
                }
            }

            document.getElementById('result').innerHTML = infobox.innerHTML;
        })

        .catch(err => {
            console.log('Error: ', err);
        })

    return false;
}