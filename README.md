# tistenCore
JavaScript 各渠道音乐库

## Features
- [X] search
- [X] info
- [X] music url
- [X] lyrics & translate

## TODO
- [X] Netease
- [X] Kugou
- [ ] QQ
- [ ] Kuwo
- [ ] Migu
- [ ] Bilibili
- [ ] :smile:... (planning)

## Example
[👉更多示例](https://github.com/tappsoft/tistenCore/tree/main/examples)
```javascript
search_music("netease", "never gonna give you up").then(async(value) => {
    let e = value[0];
    await e.waitForOk();
    // 名称，id，音乐url，作者，专辑，作者格式化后的字符串
    console.log(e.name(), e.id(), await e.get_music_url());
    console.log(e.artists(), e.album(), e.author_name());
})
```
## API
### `Song` 的子类 （歌曲类）
> 包括：
> - NeteaseSong
> - KugouSong
#### 方法
- `await e.waitForOk()` 等待加载就绪，读取前必须使用
- `await get_music_url()` 获取播放url
- `id()`->`Number` 获取ID 
- `name()`->`String` 获取歌名 
- `artists()`->`Artist[]` 获取艺术家列表 
- `album()`->`Album` 获取专辑 
- `author_name()`->`String` 所有艺术家的名字连在一起
- `source_url()`->`String` 详情页url
#### 属性
- `source`: `String` 来源
- `money`:`Boolean` 是否收费
- `lyrics`:`{content:xxx,seconds:xxx,...}[]` 歌词解析后内容（包括翻译）
```json
[
    //...
    {
        "content": "Never gonna make you cry",
        "seconds": 205110,
        "translationFlag": false,
        "index": 63,
        "lineNumber": 63
    },
    //...
]
```
### `Artist` 类 （艺术家类）
> Song.artist() -> Artist[] 得到艺术家对象`Artist`列表
#### 属性
- `id`:`Number` 该艺术家在TA平台上的编号
- `name`:`String` 艺术家名
- `alias`:`String` 艺术家别名，某些平台上有，没有的平台为空字符
- `source`:`String` 来源：
    - `netease`
    - `kugou`
    ...后续添加...
#### 方法
- `source_url()`->`String` 详情页url

### `Album` 类 （专辑类）
- `id`:`Number` 该专辑在它平台上的编号
- `name`:`String` 专辑名
- `source`:`String` 来源，同`Artist`类的`source`
#### 方法
- `source_url()`->`String` 详情页url
---
若侵犯了您的权利，请提issue
