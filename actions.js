const { Artist, Album, NeteaseSong, KugouSong, sleep } = require("./providers");
const netease_crypto = require("./utils/netease/crypto");
const requests = require("./requests");
async function search_music(type, keywords, limit = 30, offset = 0) {
    let req, res, l;
    switch (type) {
        case "netease":
            req = await requests.post(
                "https://music.163.com/weapi/search/get",
                netease_crypto.weapi({
                    "s": keywords,
                    "type": 1,
                    "limit": limit,
                    "offset": offset
                })
            );
            res = req.data.result.songs;
            l = [];
            res.forEach((i) => { l.push(new NeteaseSong(i)) });
            return l;
        case "kugou":
            req = await requests.get(
                `http://mobilecdn.kugou.com/api/v3/search/song?format=json&keyword=${keywords}&page=${Math.floor(offset/limit)+1}&pagesize=${limit}&showtype=1`,
            )
            res = req.data.data.info
            l = [];
            res.forEach((i) => { l.push(new KugouSong(i)) });
            return l;
        default:
            console.error("no such type", type);
    }
}
module.exports = {
    search_music
}