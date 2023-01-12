function createQuery(parameters) {
    let query = 'https://virtualyoutuber.fandom.com/api.php';
    query += '?origin=*';
    Object.keys(parameters).forEach(key => {
        query += '&' + key + '=' + parameters[key];
    });
    query += '&format=json';

    return query;
}

async function getMembers() {
    const memberQuery = createQuery({
        action: 'query',
        list: 'categorymembers',
        cmtitle: 'Category:Hololive',
        cmtype: 'page',
        cmlimit: '500',
    });
    
    const response = await fetch(memberQuery);
    const data = await response.json();

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

    async function categorize() {
        const response = await fetch(retiredQuery);
        const data = await response.json();

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
    }

    categorize().catch(error => console.error(error));
}

getMembers().catch(error => console.error(error));

document.querySelector('form').onsubmit = () => {
    const select = document.getElementById('members');
    let memberValue = select.value;
    memberValue = memberValue.replace(/\+ /, '%2B_');   // Special case for La+ Darkness

    const pageQuery = createQuery({
        action: 'parse',
        page: memberValue,
    })

    async function getPage() {
        const response = await fetch(pageQuery);
        const data = await response.json()

        const parser = new DOMParser();
        const page = parser.parseFromString(data.parse.text['*'], 'text/html');
    
        const infoboxElements = page.querySelectorAll('.portable-infobox *');
        const infobox = page.querySelector('.portable-infobox');
    
        const REMOVE = ['FIGURE', 'SUP', 'UL'];
    
        for (let element of infoboxElements) {
            if (REMOVE.includes(element.tagName) || element.dataset.source === 'title1') {
                element.remove();
            // Replace hyperlinks with relative paths from source
            } else if (element.tagName === 'A' && element.title) {
                const span = document.createElement('span');
                span.innerHTML = element.innerHTML;
                element.replaceWith(span);
            } else if (element.tagName === 'A') {
                continue;
            }
            
            // Unneeded attributes from source
            while (element.attributes.length > 0) {
                element.removeAttribute(element.attributes[0].name);
            }
        }
    
        document.getElementById('result').innerHTML = infobox.innerHTML;
    }

    getPage().catch(error => console.error(error));

    return false;
}