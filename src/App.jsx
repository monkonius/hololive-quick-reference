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

  return (
    <>
      <header>
        <a href="https://en.hololive.tv/" target="_blank" rel="external">
          <img src={holoLogo} alt="Hololive Production logo" />
        </a>
      </header>
      <main className="content">
        <form>
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
