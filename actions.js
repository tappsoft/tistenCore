const { Artist, Album, NeteaseSong, sleep } = require("./classes");
const netease_crypto = require("./netease-crypto");
const fs = require("fs")
const requests = require("./requests");
async function search_music(type, keywords, limit = 30, offset = 0) {
    switch (type) {
        case "netease":
            let req = await requests.post(
                "https://music.163.com/weapi/search/get",
                netease_crypto.weapi({
                    "s": keywords,
                    "type": 1,
                    "limit": limit,
                    "offset": offset
                })
            )
            let res = req.data.result.songs;
            let l = [];
            res.forEach((i) => { l.push(new NeteaseSong(i)) });
            return l;
        default:
            console.error("no such type", type);
    }
}
// search_music("netease", "never gonna give you up").then(async(value) => {
//     let e = value[0];
//     await e.waitForOk();
//     // fs.writeFileSync("a.json", JSON.stringify(e.lyrics));
//     console.log(e.name(), e.id(), await e.get_music_url());
//     console.log(e.artists(), e.album(), e.author_name());
// })