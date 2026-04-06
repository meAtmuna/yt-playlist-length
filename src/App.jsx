import { useState } from 'react';
import './App.css'
import youtubeLogo from './assets/youtube.png';

const apiKey = import.meta.env.VITE_API_KEY;

function App() {
  const [playlistUrl, setPlaylistUrl] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const getPlaylistData = () => {
    setErrorMsg("");

    if (playlistUrl.trim() === "") {
      setErrorMsg("! Please enter YouTube playlist URL.");
      return;
    }

    let playlistId;

    try {
      const url = new URL(playlistUrl);
      playlistId = url.searchParams.get("list");

      if (!playlistId) {
        setErrorMsg("! Invalid playlist URL");
        return;
      } 
    } catch {

      setErrorMsg("! Enter a valid URL");
      return;
    }

    console.log("Youtube Playlist Id ===> ", playlistId);

    fetch(`https://www.googleapis.com/youtube/v3/playlists?part=snippet,contentDetails&id=${playlistId}&key=${apiKey}`)
        .then((res) => res.json())
        .then(playlistData =>{
            console.log("playlist data result ===>",playlistData);

            if (!playlistData.items || playlistData.items.length === 0) {
                setErrorMsg("! Playlist not found");
                return;
            }

            const playlistName = playlistData.items[0].snippet.title;
            const creatorName= playlistData.items[0].snippet.channelTitle;
            const totalVideos = playlistData.items[0].contentDetails.itemCount;

            console.log("name ===>", playlistName, "creator-name ===>",creatorName,  "videos ===>", totalVideos);

        })
        .catch(() => {
          setErrorMsg("! something went wrong");
        });
  }
  return (
    <>
      <div className="main-container">
        <header>
            <div className="logo-icon">
                <img src={youtubeLogo} alt="logo"/>
            </div>
            <div className="head-text">
                <h1>Youtube Playlist length</h1>
                <p>Calculate total time duration of any YouTube playlist</p>
            </div>
        </header>

        <div className="input-section">
            <label className="input-label" htmlFor="Playlist-url">Playlist URL</label>    
            <div className="input-row">    
                <input
                  type="url" 
                  id="playlist-url" 
                  placeholder="https://www.youtube.com/playlist?list=..."
                  value={playlistUrl}
                  onChange={(e) => setPlaylistUrl(e.target.value)}
                />
                <button id="enter-btn" onClick={getPlaylistData}>
                  Get Playlist length
                </button>
            </div>
            {errorMsg && <p id="error-msg">{errorMsg}</p>}
        </div>

        <div id="result"></div>
      </div>
    </>
  )
}

export default App
