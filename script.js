const enterBtn = document.getElementById("enter-btn");
const apiKey = "AIzaSyDNIXwgFQ8hIxv28a-Tdx14Cf1OmjmcPQA";

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
                        console.log("video durataion ===>", duration);
                        
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

