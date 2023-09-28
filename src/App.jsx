import { useEffect, useState } from 'react';
import { createQuery } from './query.js';
import holoLogo from './assets/Hololive Production Logo.svg';

function App() {
  const [activeMembers, setActiveMembers] = useState([]);
  const [retiredMembers, setRetiredMembers] = useState([]);

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

    async function categorize() {
      const retiredQuery = createQuery({
        action: 'query',
        list: 'categorymembers',
        cmtitle: 'Category:Retired',
        cmtype: 'page',
        cmlimit: '500'
      });
  
      const response = await fetch(retiredQuery);
      const data = await response.json();

      const retired = data.query.categorymembers
        .filter(retiree => members.includes(retiree.title))
        .map(retiree => retiree.title);

      const active = members.filter(member => !retired.includes(member));

      setActiveMembers(active);
      setRetiredMembers(retired);
    }
    
    categorize();
  }

  useEffect(() => {
    getMembers();
  }, [])

  function handleSubmit(e) {
    e.preventDefault();

    let member = e.target[0].value;
    member = member.replace(/\+ /, '%2B_');

    const pageQuery = createQuery({
      action: 'parse',
      page: member,
    });

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

    getPage();
  }

  return (
    <>
      <header>
        <a href="https://en.hololive.tv/" target="_blank" rel="external">
          <img src={holoLogo} alt="Hololive Production logo" />
        </a>
      </header>
      <main className="content">
        <form onSubmit={handleSubmit}>
          <h1>Quick Reference</h1>
          <select defaultValue={"choose"} name="members" id="members" required>
            <option disabled value="choose">Choose a member</option>
            <optgroup label="Active">
              {activeMembers.map(member => {
                return <option key={member} value={member}>{member}</option>
              })}
            </optgroup>
            <optgroup label="Retired">
              {retiredMembers.map(member => {
                return <option key={member} value={member}>{member}</option>
              })}
            </optgroup>
          </select>
          <input type="submit" value="Submit" />
        </form>
        <div id="result"></div>
      </main>
      <footer>
        <span>
          Source: <a href="https://virtualyoutuber.fandom.com/wiki/Virtual_YouTuber_Wiki" target="_blank" rel="external">Virtual YouTuber Fandom Wiki</a>
        </span>
      </footer>
    </>
  )
}

export default App
