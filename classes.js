const requests = require("./requests");
const netease_crypto = require("./netease-crypto");
const sleep = time => {
    return new Promise(resolve => setTimeout(resolve, time))
};
class Artist {
    constructor(id, name, alias, source) {
        Object.assign({
            id: id,
            name: name,
            alias: alias,
            source: source
        }, this);
    }
}
class Album {
    constructor(id, name, source) {
        Object.assign({
            id: id,
            name: name,
            source: source
        }, this);
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
        this.data = data;
        this.fulldata = {};
        this.ok = false;
        this._setup();
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
        this.ok = true;
    }
    toString() {
        return `<NeteaseSong ${this.id()}`
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
    async getMusic_url(quality = 0) {
        let rate_map = { 0: 320000, 1: 192000, 2: 128000 }
        req = await requests.post(
            "https://music.163.com/weapi/song/enhance/player/url",
            netease_crypto.weapi({
                "ids": JSON.stringify([this.id()]),
                "br": rate_map[quality],
            })
        )
        return req.data['data'][0]['url']
    }
    async getLyric() {
        let req = await requests.post(
            "https://music.163.com/weapi/song/lyric",
            netease_crypto.weapi({
                os: "osx",
                id: this.id(),
                lv: -1,
                kv: -1,
                tv: -1
            })
        );
        let text = (req.data)["lrc"]["lyric"]
        let lrc = text.split("\n");
        let lyrics = [];
        for (let i in lrc) {
            let line = String(lrc[i]);
            if (line.charAt(0) == '[') {
                lyrics.push(line.trim())
            }
        }
        return lyrics
    }
}
module.exports = {
    Artist,
    Album,
    Song,
    NeteaseSong,
    sleep
}