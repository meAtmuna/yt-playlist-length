const enterBtn = document.getElementById("enter-btn");
const apiKey = "";

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
    let sec = totalSec % 60;

    return `${hrs.toString().padStart(2,"0")}:${mins.toString().padStart(2,"0")}:${sec.toString().padStart(2,"0")}`;
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

                    let totalSec = 0;
                    
                    for (let i = 0; i < videoData.items.length; i++) {

                        let duration = videoData.items[i].contentDetails.duration;
                        let seconds = isoConvert(duration);
                        // console.log("video durataion ===>", duration);
                        
                        totalSec += seconds;
                        console.log("seconds ===>",seconds);

                    }
                    console.log("total seconds ===> ",totalSec);
                    console.log("hrs mins sec === >", readableTime(totalSec));
                    
                    
                })
                .catch((error)=>{
                    console.log("erro ===>", error);
                    
                })
            
        })
        .catch((error)=>{
            console.log("error ===>", error);
            
        })
});

