const BASE_URL = 'https://virtualyoutuber.fandom.com/api.php';

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
        const NONMEMBERS = ['Hololive', 'Language of Hololive Talents'];
        const members = data.query.categorymembers
            .filter(member => !NONMEMBERS.includes(member.title))
            .map(member => member.title);

        const retiredQuery = createQuery({
            action: 'query',
            list: 'categorymembers',
            cmtitle: 'Category:Retired',
            cmtype: 'page',
            cmlimit: '500'
        });

        fetch(retiredQuery)
            .then(response => response.json())
            .then(data => {
                const retired = data.query.categorymembers
                    .filter(retiree => members.includes(retiree.title))
                    .map(retiree => retiree.title);

                const active = members.filter(member => !retired.includes(member));

                const select = document.getElementById('members');
                const activeGroup = document.createElement('optgroup');
                activeGroup.label = 'Active';
                select.append(activeGroup);

                for (const member of active) {
                    const option = document.createElement('option');
                    option.innerHTML = member;
                    option.setAttribute('value', member);
                    activeGroup.append(option);
                }

                const retiredGroup = document.createElement('optgroup');
                retiredGroup.label = 'Retired';
                select.append(retiredGroup);

                for (const member of retired) {
                    const option = document.createElement('option');
                    option.innerHTML = member;
                    option.setAttribute('value', member);
                    retiredGroup.append(option);
                }
            })
            
            .catch(err => {
                console.error('Error: ', err);
            })
    })

    .catch(err => {
        console.error('Error: ', err);
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

            const REMOVE = ['FIGURE', 'SUP', 'UL'];

            for (let elem of infoboxElems) {
                if (REMOVE.includes(elem.tagName) || elem.dataset.source === 'title1') {
                    elem.remove();
                } else if (elem.tagName === 'A' && elem.title) {
                    const span = document.createElement('span');
                    span.innerHTML = elem.innerHTML;
                    elem.replaceWith(span);
                } else if (elem.tagName === 'A') {
                    continue;
                }
                
                while (elem.attributes.length > 0) {
                    elem.removeAttribute(elem.attributes[0].name);
                }
            }

            document.getElementById('result').innerHTML = infobox.innerHTML;
        })

        .catch(err => {
            console.error('Error: ', err);
        });

    return false;
}