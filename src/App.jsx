import holoLogo from './assets/Hololive Production Logo.svg'

function App() {
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
