const enterBtn = document.getElementById("enter-btn");
const informationBox = document.getElementById("result");
const errorMsg = document.getElementById("error-msg")
const apiKey = "AIzaSyDSEADxFNhw3jn6jvUjAi1oxQ_wbKZMGOI";

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

enterBtn.addEventListener("click", ()=>{
    let urlInput = document.getElementById("playlist-url").value.trim();

    errorMsg.style.display = "none";
    informationBox.innerHTML = "";

    if (urlInput === "") {
        errorMsg.textContent = "Please enter YouTube playlist URL.";
        errorMsg.style.display = "block";
        return;
    }

    let playlistId;
    try {
        let url = new URL(urlInput)
        playlistId = url.searchParams.get("list")
        
        if (!playlistId) {
            errorMsg.textContent = "Invalid Playlist URL";
            errorMsg.style.display = "block";
            return;
        }
    } catch {
        errorMsg.textContent = "Enter a valid URL";
        errorMsg.style.display = "block";
        return
    }
    // console.log("Youtube Playlist Id ===> ", playlistId)

    fetch(`https://www.googleapis.com/youtube/v3/playlists?part=snippet,contentDetails&id=${playlistId}&key=${apiKey}`)
        .then((res) => res.json())
        .then(playlistData =>{
            console.log("playlist data result ===>",playlistData);

            if (!playlistData.items || playlistData.items.length === 0) {
                errorMsg.textContent = "Playlist not found";
                errorMsg.style.display = "block";
                return;
            }

            const playlistName = playlistData.items[0].snippet.title;
            const creatorName= playlistData.items[0].snippet.channelTitle;
            const totalVideos = playlistData.items[0].contentDetails.itemCount;
            
            let videoIds = []
            let nxtPageTkn = "";

            fetchAllPlaylistVideos();

            function fetchAllPlaylistVideos() {
            
                fetch(`https://www.googleapis.com/youtube/v3/playlistItems?part=contentDetails&playlistId=${playlistId}&maxResults=50&pageToken=${nxtPageTkn}&key=${apiKey}`)
                    .then((res) => res.json())
                    .then((data)=>{
                        // console.log("result ===>", data.items);
            
                        for (let i = 0; i < data.items.length; i++) {
            
                            let videoId = data.items[i].contentDetails.videoId
                            videoIds.push(videoId)
                        }
                        // console.log("all video ids ===>", videoIds);

                        if (data.nextPageToken) {
                            
                            nxtPageTkn =  data.nextPageToken;
                            fetchAllPlaylistVideos();

                        }else{
                            let totalSec = 0;

                            async function calculatePlaylistDuration() {

                                for (let i = 0; i < videoIds.length; i += 50) {

                                    let videoGroup = videoIds.slice(i, i + 50);
                                    
                                    let res = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${videoGroup.join(",")}&key=${apiKey}`)
                                    let videoData = await res.json()
                                    
                                    console.log("result ===>",videoData.items);
                                    for (let j = 0; j < videoData.items.length; j++) {
                    
                                        let duration = videoData.items[j].contentDetails.duration;
                                        let seconds = isoConvert(duration);
                                        // console.log("video durataion ===>", duration);
                                        
                                        totalSec += seconds;
                                        // console.log("seconds ===>",seconds);
                    
                                    }
                                    
                                }   
                                    
                                    // console.log("total seconds ===> ",totalSec);
                                    // console.log("hrs mins sec === >", readableTime(totalSec));
                                    
                                    let speed125x = readableTime(Math.floor(totalSec / 1.25));
                                    let speed150x = readableTime(Math.floor(totalSec / 1.5));
                                    let speed2x = readableTime(Math.floor(totalSec / 2));
                                    
                                    informationBox.innerHTML = `
                                    <div class="result-card">
                                        <div class="result-head">
                                            <div>
                                                <h2 class="playlist-name">${playlistName}</h2>
                                                <p class="creator-name">${creatorName}</p>
                                            </div>
                                            <p class="total-videos">${totalVideos} Videos</p>
                                        </div>
                                        <div class="duration">
                                            <div class="duration-grid main">
                                                <p class="grid-label">Total Duration</p>
                                                <p class="grid-time">${readableTime(totalSec)}</p>
                                            </div>
                                            <div class="duration-grid">
                                                <p class="grid-label">At 1.25x Speed</p>
                                                <p class="grid-time">${speed125x}</p>
                                            </div>
                                            <div class="duration-grid">
                                                <p class="grid-label">At 1.5x Speed</p>
                                                <p class="grid-time">${speed150x}</p>
                                            </div>
                                            <div class="duration-grid end">
                                                <p class="grid-label">At 2x Speed</p>
                                                <p class="grid-time">${speed2x}</p>
                                            </div>
                                        </div>
                                    </div>
                                    `;
                            }

                            calculatePlaylistDuration();

                        }    

                    })
                    .catch((error)=>{
                        console.log("error ===>", error);
                        
                    })
            }

        })  
        .catch((error) =>{
                    console.log("error ===>", error);
                    errorMsg.textContent = "Something went wrong";
                    errorMsg.style.display = "block";
        })          
                    
                            
});

