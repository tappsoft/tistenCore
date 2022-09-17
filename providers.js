const requests = require("./requests");
const netease_crypto = require("./utils/netease/crypto");
const netease_lyric_parser = require("./utils/netease/lyric-parser");
const sleep = time => {
    return new Promise(resolve => setTimeout(resolve, time))
};
class Artist {
    constructor(id, name, alias, source) {
        Object.assign(this, {
            id: id,
            name: name,
            alias: alias,
            source: source
        });
    }
}
class Album {
    constructor(id, name, source) {
        Object.assign(this, {
            id: id,
            name: name,
            source: source
        });
    }
}
class Song {
    constructor(data) {
        this.data = data;
    }
}
class NeteaseSong extends Song {
    constructor(data) {
        super()
        this.source = "netease";
        this.data = data;
        this.fulldata = {};
        this.ok = false;
        this._setup();
    }
    waitForOk() {
        return new Promise((resolve, reject) => {
            let i = setInterval(() => {
                if (this.ok) {
                    clearInterval(i);
                    resolve();
                }
            }, 1)
        })
    }
    async _setup() {
        let req = await requests.post(
            "https://music.163.com/weapi/v3/song/detail",
            netease_crypto.weapi({
                "c": JSON.stringify([{ "id": this.id() }]),
                "ids": JSON.stringify([this.id()])
            })
        )
        this.fulldata = req.data['songs'][0];
        let req_lyric = await requests.post(
            "https://music.163.com/weapi/song/lyric",
            netease_crypto.weapi({
                os: "osx",
                id: this.id(),
                lv: -1,
                kv: -1,
                tv: -1
            })
        );
        this.lyrics = [];
        let lyric = "",
            tlyric = "";
        if (req_lyric.data.lrc) {
            lyric = (req_lyric.data)["lrc"]["lyric"]
        }
        if (req_lyric.data.tlyric) {
            tlyric = (req_lyric.data)["tlyric"]["lyric"].replace(/(|\\)/g, '').replace(/[\u2005]+/g, ' ');
        }
        this.lyrics = netease_lyric_parser.parseLyric(lyric, tlyric);
        this.ok = true;
    }
    id() { return this.data.id; }
    name() { return this.data.name; }
    artists() {
        let l = [];
        for (let i in this.data.artists) {
            let ar = this.data.artists[i];
            l.push(new Artist(ar.id, ar.name, ar.alias, "netease"));
        }
        return l;
    }
    author_name() {
        let l = [];
        let ars = this.artists();
        for (let i in ars) {
            l.push(ars[i].name)
        }
        return l.join("、")
    }
    alias() { return this.data.alias }
    album() { return new Album(this.data.album.id, this.data.album.name, "netease") };
    async get_music_url(quality = 0) {
        let rate_map = { 0: 320000, 1: 192000, 2: 128000 }
        let req = await requests.post(
            "https://music.163.com/weapi/song/enhance/player/url",
            netease_crypto.weapi({
                "ids": JSON.stringify([this.id()]),
                "br": rate_map[quality],
            })
        )
        return req.data['data'][0]['url']
    };
}
module.exports = {
    Artist,
    Album,
    Song,
    NeteaseSong,
    sleep
}