const { Artist, Album, NeteaseSong, KugouSong, sleep } = require("../providers");
const { search_music } = require("../actions");
const fs = require("fs");
search_music("netease", "never gonna give you up").then(async(value) => {
    let e = value[0];
    await e.waitForOk(); // 等待就绪
    // 将处理后的歌词json写入到文件
    fs.writeFileSync("example1-lyrics.json", JSON.stringify(e.lyrics));
    // 分别是 名称，id，音乐url，详情页url
    console.log(e.name(), e.id(), await e.get_music_url(), e.source_url());
    // 输出所有作家的object以及他们的详情页url
    let x = e.artists();
    for (let i in x) {
        let ar = x[i];
        console.log(ar, ar.source_url());
    }
    // 专辑object和专辑详情页url
    console.log(e.album(), e.album().source_url());
    // 是否收费
    console.log("need money? ", e.money);
})