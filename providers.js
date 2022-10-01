const requests = require("./requests");
const { sleep } = require("./requests")
const netease_crypto = require("./utils/netease/crypto");
const lyric_parser = require("./utils/lyric-parser");
class Artist {
    constructor(id, name, alias, source) {
        Object.assign(this, {
            id: id,
            name: name,
            alias: alias,
            source: source
        });
    }
    source_url() {
        switch (this.source) {
            case "netease":
                return `https://music.163.com/#/artist?id=${this.id}`
            case "kugou":
                return `https://www.kugou.com/singer/${this.id}.html`
        }
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
    source_url() {
        switch (this.source) {
            case "netease":
                return `https://music.163.com/#/album?id=${this.id}`
            case "kugou":
                return `https://www.kugou.com/yy/album/single/${this.id}.html`
        }
    }
}
class Song {
    constructor(data) {
        this.data = data;
    }
    source_url() {
        switch (this.source) {
            case "netease":
                return `https://music.163.com/#/song?id=${this.id()}`
            case "kugou":
                return `https://www.kugou.com/song/#hash=${this.data["hash"]}&album_audio_id=${this.id()}`
        }
    }
}
class NeteaseSong extends Song {
    constructor(data) {
        super()
        this.money = data.fee == 1;
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
        this.time = this.data.duration;
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
        this.lyrics = lyric_parser.parseLyric(lyric, tlyric);
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
        if (quality == 2) return `http://music.163.com/song/media/outer/url?id=${this.id()}.mp3`
        let req = await requests.post(
            "https://interface3.music.163.com/eapi/song/enhance/player/url",
            netease_crypto.eapi('/api/song/enhance/player/url', {
                "ids": JSON.stringify([this.id()]),
                "br": rate_map[quality],
            })
        );
        return req.data['data'][0]['url']
    };
}
class KugouSong extends Song {
    constructor(data) {
        super()
        this.money = true;
        this.source = "kugou";
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
    hello(content) {
        if (content["err_code"]) return;
        this.fulldata = content.data;
    }
    async _setup() {
        let HASH = this.data["hash"]
        let ID = this.data["album_audio_id"];
        let t = 0;
        const timstamp = +new Date();
        let req = await requests.get(
            (
                Math.random() <= 0.5 ?
                `https://wwwapi.kugou.com/yy/index.php?r=play/getdata&callback=this.hello&mid=1&hash=${HASH}&platid=4&album_id=${ID}&_=${timstamp}` :
                `https://wwwapi.kugou.com/yy/index.php?r=play/getdata&callback=this.hello&mid=1&hash=${HASH}&appid=1014&album_audio_id=${ID}&_=${timstamp}`
            )
        );
        eval(req.data);
        if (Object.keys(this.fulldata).length <= 3) {
            this.lyrics = {};
            this.money = false;
        } else {
            this.time = this.fulldata.timelength;
            this.lyrics = lyric_parser.parseLyric(this.fulldata["lyrics"], "");
        }
        this.ok = true;
    }
    id() { return this.data["album_audio_id"]; }
    name() { return this.data["songname"]; }
    artists() {
        let l = [];
        for (let i in this.fulldata["authors"]) {
            let ar = this.fulldata["authors"][i];
            l.push(new Artist(parseInt(ar.author_id), ar.author_name, "", "kugou"));
        }
        return l;
    }
    author_name() {
        return this.fulldata["author_name"];
    }
    alias() { return "" }
    album() { return new Album(parseInt(this.data["album_id"]), this.data["album_name"], "kugou") };
    async get_music_url(quality = 0) {
        return this.fulldata["play_url"] || this.fulldata["play_backup_url"]
    };
}
module.exports = {
    Artist,
    Album,
    Song,
    NeteaseSong,
    KugouSong,
    sleep
}