# tistenCore
JavaScript 各渠道音乐库

## TODO
- [X] Netease
    - [X] search
    - [X] info
    - [X] music url
    - [X] lyrics & translate
- [X] Kugou
    - [X] search
    - [X] info
    - [X] music url
    - [X] lyrics & translate
- [ ] QQ
- [ ] Kuwo
- [ ] Migu
- [ ] Bilibili
- [ ] :smile:... (planning)

## Example

```javascript
search_music("netease", "never gonna give you up").then(async(value) => {
    let e = value[0];
    await e.waitForOk();
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
- `await e.waitForOk()` 等待加载就绪
- `id()`->`Number` 获取ID 
- `name()`->`String` 获取歌名 
- `await get_music_url()` 获取url
- `artists()`->`Artist[]` 获取艺术家列表 
- `album()`->`Album` 获取专辑 
- `author_name()`->`String` 所有艺术家的名字连在一起
#### 属性
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

### `Album` 类 （专辑类）
- `id`:`Number` 该专辑在它平台上的编号
- `name`:`String` 专辑名
- `source`:`String` 来源，同`Artist`类的`source`

---
若侵犯了您的权利，请提issue
