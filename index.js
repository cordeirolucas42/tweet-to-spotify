var Twit = require("twit");
var EnvVar = require("dotenv");
EnvVar.config();
var SpotifyWebApi = require("spotify-web-api-node");
const playlist = process.env.PLAYLIST;
var followers = [];

var spotifyApi = new SpotifyWebApi({
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    redirectUri: 'https://example.com/callback'
});

var T = new Twit({
    consumer_key: process.env.CONSUMER_KEY,
    consumer_secret: process.env.CONSUMER_SECRET,
    access_token: process.env.ACCESS_TOKEN,
    access_token_secret: process.env.ACCESS_TOKEN_SECRET,
});


spotifyApi.authorizationCodeGrant(process.env.SPOTIFY_CODE)
.then(
    function(data) {
      console.log('The token expires in ' + data.body['expires_in']);
      console.log('The access token is ' + data.body['access_token']);
      console.log('The refresh token is ' + data.body['refresh_token']);
  
      // Set the access token on the API object to use it in later calls
      spotifyApi.setAccessToken(data.body['access_token']);
      spotifyApi.setRefreshToken(data.body['refresh_token']);
      return spotifyApi.addTracksToPlaylist(playlist, ["spotify:track:463CkQjx2Zk1yXoBuierM9"])
    }
)
// spotifyApi.setAccessToken(process.env.SPOTIFY_TOKEN)
// spotifyApi.addTracksToPlaylist(playlist, ["spotify:track:463CkQjx2Zk1yXoBuierM9"])
.then(data => {
    console.log("Added tweeted track to playlist!")
    return T.get('followers/ids', { screen_name: 'erosinbetween' })
})
.then(result => {
    console.log(result.data.ids.length)
    followers = result.data.ids
    return T.get('friends/ids', { screen_name: 'erosinbetween' })
})
.then(result => {
    console.log(result.data.ids.length)
    var mutuals = result.data.ids.filter(id => followers.includes(id))
    mutuals.push("721774492620582912") //morg twitter id
    mutuals = mutuals.map(mutual => mutual.toString())
    mutuals.foreach(mutual => console.log(typeof mutual))
    var stream = T.stream("statuses/filter", {follow: mutuals})
    stream.on("tweet", (tweet) => {
        // console.log(tweet.entities.urls)
        // console.log(tweet.entities.urls[0].expanded_url)
        // console.log(tweet.text)
        if (tweet.entities.urls[0]){
            console.log(tweet.entities.urls[0].expanded_url)
            let songID = /open\.spotify\.com\/track\/([^\n\r?]*)/.exec(tweet.entities.urls[0].expanded_url);
            if (songID) {
                console.log(tweet.user.name)
                console.log(songID[1])
                spotifyApi.refreshAccessToken().then(
                    function(data) {
                      console.log('The access token has been refreshed!')               
                      // Save the access token so that it's used in future calls
                      spotifyApi.setAccessToken(data.body['access_token'])
                      return spotifyApi.addTracksToPlaylist(playlist, ["spotify:track:" + songID[1]])
                    },
                    function(err) {
                      console.log('Could not refresh access token', err);
                    }
                )
                .then(
                    function (data) {
                        console.log(data)
                        console.log("Added tweeted track to playlist!");
                    },
                    function (err) {
                        console.log("Something went wrong!", err);
                    }
                )
            }
        }
    })
})
.catch(err => console.log('caught error', err))

// ,
//     function(err) {
//       console.log('Something went wrong!', err);
//     }

// spotifyApi.setAccessToken(process.env.SPOTIFY_TOKEN);

// spotifyApi.addTracksToPlaylist(playlist, ["spotify:track:463CkQjx2Zk1yXoBuierM9"]).then(
//     function (data) {
//         console.log("Added tweeted track to playlist!");
//     },
//     function (err) {
//         console.log("Something went wrong!", err);
//     }
// )



// T.get('followers/ids', { screen_name: 'erosinbetween' },  function (err, data, response) {
//     console.log(data.ids.length)
//     followers = data.ids
//     T.get('friends/ids', { screen_name: 'erosinbetween' },  function (err, following, response) {
//         console.log(following.ids.length)
//         var mutuals = following.ids.filter(id => followers.includes(id))
//         var stream = T.stream("statuses/filter", {follow: mutuals});
//         stream.on("tweet", (tweet) => {
//             // console.log(tweet.entities.urls)
//             // console.log(tweet.entities.urls[0].expanded_url)
//             // console.log(tweet.text)
//             if (tweet.entities.urls[0]){
//                 let songID = /open\.spotify\.com\/track\/([^\n\r?]*)/.exec(tweet.entities.urls[0].expanded_url);
//                 if (songID) {
//                     console.log(songID[1])
//                     spotifyApi.addTracksToPlaylist(playlist, ["spotify:track:" + songID[1]])
//                     .then(
//                         function (data) {
//                             console.log("Added tweeted track to playlist!");
//                         },
//                         function (err) {
//                             console.log("Something went wrong!", err);
//                         }
//                     )
//                 }
//             }
//         })
//     })
// })

//["45470413", "721774492620582912", "1291743094195585024","48832816"]
