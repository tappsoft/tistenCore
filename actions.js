const { Artist, Album, NeteaseSong, KugouSong, sleep } = require("./providers");
const netease_crypto = require("./utils/netease/crypto");
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
        case "kugou":
            let req2 = await requests.get(
                `http://mobilecdn.kugou.com/api/v3/search/song?format=json&keyword=${keywords}&page=${Math.floor(offset/limit)+1}&pagesize=${limit}&showtype=1`,
            )
            let res2 = req2.data.data.info
            let l2 = [];
            res2.forEach((i) => { l2.push(new KugouSong(i)) });
            return l2;
        default:
            console.error("no such type", type);
    }
}
search_music("kugou", "never gonna give you up").then(async(value) => {
    let e = value[0];
    await e.waitForOk();
    // fs.writeFileSync("a.json", JSON.stringify(e.lyrics));
    console.log(e.name(), e.id(), await e.get_music_url());
    console.log(e.artists(), e.album(), e.author_name());
})