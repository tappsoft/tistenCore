// https://github.com/listen1/listen1_chrome_extension/blob/f3360ac36a3b01e7b9e0597c88c86362ecdf6112/js/controller/play.js
function parseLyric(lyric, tlyric) {
    const lines = lyric.split('\n');
    let result = [];
    const timeResult = [];

    if (typeof tlyric !== 'string') {
        tlyric = '';
    }
    const linesTrans = tlyric.split('\n');
    const resultTrans = [];
    const timeResultTrans = [];
    if (tlyric === '') {
        linesTrans.splice(0);
    }

    function rightPadding(str, length, padChar) {
        const newstr = str + new Array(length - str.length + 1).join(padChar);
        return newstr;
    }

    const process =
        (result, timeResult, translationFlag) => (line, index) => {
            const tagReg = /\[\D*:([^\]]+)\]/g;
            const tagRegResult = tagReg.exec(line);
            if (tagRegResult) {
                const lyricObject = {};
                lyricObject.seconds = 0;
                [lyricObject.content] = tagRegResult;
                result.push(lyricObject);
                return;
            }

            const timeReg = /\[(\d{2,})\:(\d{2})(?:\.(\d{1,3}))?\]/g; // eslint-disable-line no-useless-escape

            let timeRegResult = null;
            // eslint-disable-next-line no-cond-assign
            while ((timeRegResult = timeReg.exec(line)) !== null) {
                const htmlUnescapes = {
                    '&amp;': '&',
                    '&lt;': '<',
                    '&gt;': '>',
                    '&quot;': '"',
                    '&#39;': "'",
                    '&apos;': "'",
                };
                timeResult.push({
                    content: line
                        .replace(timeRegResult[0], '')
                        .replace(
                            /&(?:amp|lt|gt|quot|#39|apos);/g,
                            (match) => htmlUnescapes[match]
                        ),
                    seconds: parseInt(timeRegResult[1], 10) * 60 * 1000 + // min
                        parseInt(timeRegResult[2], 10) * 1000 + // sec
                        (timeRegResult[3] ?
                            parseInt(rightPadding(timeRegResult[3], 3, '0'), 10) :
                            0), // microsec
                    translationFlag,
                    index,
                });
            }
        };

    lines.forEach(process(result, timeResult, false));
    linesTrans.forEach(process(resultTrans, timeResultTrans, true));

    // sort time line
    result = timeResult.concat(timeResultTrans).sort((a, b) => {
        const keyA = a.seconds;
        const keyB = b.seconds;

        // Compare the 2 dates
        if (keyA < keyB) return -1;
        if (keyA > keyB) return 1;
        if (a.translationFlag !== b.translationFlag) {
            if (a.translationFlag === false) {
                return -1;
            }
            return 1;
        }
        if (a.index < b.index) return -1;
        if (a.index > b.index) return 1;
        return 0;
    });
    // disable tag info, because music provider always write
    // tag info in lyric timeline.
    // result.push.apply(result, timeResult);
    // result = timeResult; // executed up there

    for (let i = 0; i < result.length; i += 1) {
        result[i].lineNumber = i;
    }

    return result;
}
module.exports = {
    parseLyric
}