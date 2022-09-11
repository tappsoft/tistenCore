# tistenCore
JavaScript 各渠道音乐库

## TODO
- [X] Netease
    - [X] search
    - [X] info
    - [X] music url
    - [X] lyrics & translate
- [ ] Kugou
- [ ] QQ
- [ ] Kuwo

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
### `NeteaseSong` 类
#### 方法
- `await e.waitForOk()` 等待加载就绪
- `id()` 获取ID `Number`
- `name()` 获取歌名 `String`
- `await get_music_url()` 获取url
- `artists()` 获取作者列表 `Artist[]`
- `album()` 获取专辑 `Album`
- `author_name()` 作者名字 `String`
#### 属性
- `lyrics` 歌词解析后内容（包括翻译）`Array`
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
