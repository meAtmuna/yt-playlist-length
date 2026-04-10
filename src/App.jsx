import { useState } from 'react';
import './App.css'
import youtubeLogo from './assets/youtube.png';

const apiKey = import.meta.env.VITE_API_KEY;

function App() {
  const [playlistUrl, setPlaylistUrl] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [playlistInfo, setPlaylistInfo] = useState(null);
  const [durationInfo, setDurationInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  function isoConvert(time) {
    const result = time.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);

    const hrs = parseInt(result[1] || 0)
    const mins = parseInt(result[2] || 0)
    const sec = parseInt(result[3] || 0)

    return hrs * 3600 + mins * 60 + sec;
  }

  function readableTime(totalSec) {
      
    let hrs = Math.floor(totalSec / 3600);
    let mins = Math.floor(totalSec  % 3600 / 60);
    let sec = Math.floor(totalSec % 60);

    return `${hrs.toString().padStart(2,"0")}H ${mins.toString().padStart(2,"0")}M ${sec.toString().padStart(2,"0")}S`;
  }

  const getPlaylistData = async () => {
    try {
      setErrorMsg("");
      setPlaylistInfo(null);
      setDurationInfo(null);

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

      setLoading(true);

      console.log("Youtube Playlist Id ===> ", playlistId);

      const res = await fetch(`https://www.googleapis.com/youtube/v3/playlists?part=snippet,contentDetails&id=${playlistId}&key=${apiKey}`)
      const playlistData = await res.json();

              console.log("playlist data result ===>",playlistData);

              if (!playlistData.items || playlistData.items.length === 0) {
                  setErrorMsg("! Playlist not found");
                  setLoading(false);
                  return;
              }

              const playlistName = playlistData.items[0].snippet.title;
              const creatorName= playlistData.items[0].snippet.channelTitle;
              const totalVideos = playlistData.items[0].contentDetails.itemCount;

              setPlaylistInfo({
                name: playlistName,
                creator: creatorName,
                videos: totalVideos,
              });

              let videoIds = [];
              let nxtPageTkn = "";

              while (true) {
                const res = await fetch(`https://www.googleapis.com/youtube/v3/playlistItems?part=contentDetails&playlistId=${playlistId}&maxResults=50&pageToken=${nxtPageTkn}&key=${apiKey}`);
                const data = await res.json();

                data.items.forEach(item => {
                  videoIds.push(item.contentDetails.videoId)

                });

                if (!data.nextPageToken) break;
                nxtPageTkn = data.nextPageToken;

              }

              let totalSec = 0;

              for (let i = 0; i < videoIds.length; i += 50) {
                const videoGroup = videoIds.slice(i, i + 50);
                const res = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${videoGroup.join(",")}&key=${apiKey}`)
                const videoData = await res.json();

                videoData.items.forEach(video => {
                  totalSec += isoConvert(video.contentDetails.duration);
                })
                
              }

              setDurationInfo({
                total: readableTime(totalSec),
                speed125x: readableTime(Math.floor(totalSec / 1.25)),
                speed150x: readableTime(Math.floor(totalSec / 1.5)),
                speed2x: readableTime(Math.floor(totalSec / 2))
              });

              setLoading(false);
              console.log("name ===>", playlistName, "creator-name ===>",creatorName,  "videos ===>", totalVideos);
    }
    catch(error) {
      setErrorMsg("! something went wrong");
      setLoading(false);
    };
  }
  return (
    <>
      <div className="w-full max-w-[800px] animate-[fadeDown_0.6s_ease]">
        <header className="flex gap-4  mb-12">
            <div className="logo-icon">
              <img src={youtubeLogo} alt="logo" className="w-[60px] h-[60px]"/>
            </div>
            <div className="head-text">
                <h1 className="font-bebas text-[50px] tracking-[2px]">Youtube Playlist length</h1>
                <p className="text-[15px] text-muted mt-[3px] font-normal ml-1">Calculate total time duration of any YouTube playlist</p>
            </div>
        </header>

        <div className="input-section animate-[fadeUp_0.6s_0.1s_ease]">
            <label className="input-label text-[13px] tracking-[2px] uppercase text-muted mb-[10px] block" htmlFor="playlist-url">Playlist URL</label>    
            <div className="input-row flex gap-[10px]">    
                <input
                  id="playlist-url"
                  type="url" 
                  className="playlist-url flex-1 bg-card border border-border rounded-[10px] px-[18px] py-[14px] font-dm text-[14px] text-text outline-none placeholder:text-[#918e8e] focus:border-red focus:ring-4 focus:ring-red/10" 
                  placeholder="https://www.youtube.com/playlist?list=..."
                  value={playlistUrl}
                  onChange={(e) => setPlaylistUrl(e.target.value)}
                />
                <button 
                  className={`enter-btn bg-red text-white rounded-[10px] py-[14px] px-[22px] text-[16px] cursor-pointer tracking-[1.5px] font-bebas border-none
                    hover:bg-[#e6002e] hover:translate-y-[1px] hover:shadow-[0_6px_20px_rgba(255,0,51,0.35)] active:translate-y-0
                    ${loading ? "loading pointer-events-none bg-[#333] text-[#666]" : ""}`}
                  onClick={getPlaylistData} 
                  disabled={loading}
                >
                  {loading ? (
                    <span className="dots flex gap-[4px]">
                      <span className="w-[5px] h-[5px] rounded-full bg-[#666] animate-bounce [animation-delay:0s]"></span>
                      <span className="w-[5px] h-[5px] rounded-full bg-[#666] animate-bounce [animation-delay:0.15s]"></span>
                      <span className="w-[5px] h-[5px] rounded-full bg-[#666] animate-bounce [animation-delay:0.3s]"></span>
                    </span>
                  ) : (
                    "Get Playlist length"
                  )}
                </button>
            </div>
            {errorMsg && <p className="error-msg">{errorMsg}</p>}
        </div>
        {playlistInfo && durationInfo && (
          <div className="result">
            <div className="result-card">
              <div className="result-head">
                <div>
                  <h2 className="playlist-name">{playlistInfo.name}</h2>
                  <p className="creator-name">{playlistInfo.creator}</p>
                </div>
                  <p className="total-videos">{playlistInfo.videos} Videos</p>
              </div>
              {durationInfo && (
                <div className="duration">
                    <div className="duration-grid main">
                        <p className="grid-label">Total Duration</p>
                        <p className="grid-time">{durationInfo.total}</p>
                    </div>
                    <div className="duration-grid">
                        <p className="speed-badge">1.25x</p>
                        <p className="grid-label">At 1.25x Speed</p>
                        <p className="grid-time">{durationInfo.speed125x}</p>
                    </div>
                    <div className="duration-grid">
                        <p className="speed-badge">1.5x</p>
                        <p className="grid-label">At 1.5x Speed</p>
                        <p className="grid-time">{durationInfo.speed150x}</p>
                    </div>
                    <div className="duration-grid end">
                        <p className="speed-badge">2x</p>
                        <p className="grid-label">At 2x Speed</p>
                        <p className="grid-time">{durationInfo.speed2x}</p>
                    </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default App
