const enterBtn = document.getElementById("enter-btn");
const apiKey = "AIzaSyCwiKmSsvqbVPSyefRslevTLqZPKVcMy30";

enterBtn.addEventListener("click", ()=>{
    let urlInput = document.getElementById("playlist-url").value;

    let url = new URL(urlInput)
    let playlistId = url.searchParams.get("list")
    console.log("Youtube Playlist Id ===> ", playlistId)

    fetch(`https://www.googleapis.com/youtube/v3/playlistItems?part=contentDetails&playlistId=${playlistId}&maxResults=50&key=${apiKey}`)
        .then((res) => res.json())
        .then((data)=>{
            console.log("result ===>", data);
            
        })
        .catch((error)=>{
            console.log("error ===>", error);
            
        })
});

