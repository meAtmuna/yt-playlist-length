import './App.css'

function App() {

  return (
    <>
      <div className="main-container">
        <header>
            <div className="logo-icon">
                <img src="images/youtube.png" alt="logo"/>
            </div>
            <div className="head-text">
                <h1>Youtube Playlist length</h1>
                <p>Calculate total time duration of any YouTube playlist</p>
            </div>
        </header>

        <div className="input-section">
            <label className="input-label" htmlFor="Playlist-url">Playlist URL</label>    
            <div className="input-row">    
                <input type="url" id="playlist-url" placeholder="https://www.youtube.com/playlist?list=..."/>
                <button id="enter-btn">Get Playlist length</button>
            </div>
            <p id="error-msg"></p>
        </div>

        <div id="result"></div>
      </div>
    </>
  )
}

export default App
