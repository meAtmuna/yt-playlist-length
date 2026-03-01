const enterBtn = document.getElementById("enter-btn");
const apiKey = "";

function isoConvert(time) {
    const result = time.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);

    const hrs = parseInt(result[1] || 0)
    const mins = parseInt(result[2] || 0)
    const sec = parseInt(result[3] || 0)

    return hrs * 3600 + mins * 60 + sec;
}

enterBtn.addEventListener("click", ()=>{
    let urlInput = document.getElementById("playlist-url").value;

    let url = new URL(urlInput)
    let playlistId = url.searchParams.get("list")
    // console.log("Youtube Playlist Id ===> ", playlistId)

    fetch(`https://www.googleapis.com/youtube/v3/playlistItems?part=contentDetails&playlistId=${playlistId}&maxResults=50&key=${apiKey}`)
        .then((res) => res.json())
        .then((data)=>{
            // console.log("result ===>", data.items);
            let videoIds = []

            for (let i = 0; i < data.items.length; i++) {

                let videoId = data.items[i].contentDetails.videoId
                videoIds.push(videoId)
            }
            // console.log("all video ids ===>", videoIds);
            
            fetch(`https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${videoIds.join(",")}&key=${apiKey}`)
                .then((res) => res.json())
                .then((videoData) => {
                    console.log("result ===>",videoData.items);
                    
                    for (let i = 0; i < videoData.items.length; i++) {

                        let duration = videoData.items[i].contentDetails.duration;
                        let seconds = isoConvert(duration);
                        // console.log("video durataion ===>", duration);
                        
                        console.log(seconds);

                    }
                    
                })
                .catch((error)=>{
                    console.log("erro ===>", error);
                    
                })
            
        })
        .catch((error)=>{
            console.log("error ===>", error);
            
        })
});

