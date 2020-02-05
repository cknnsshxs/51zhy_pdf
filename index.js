const axios = require('axios');
axios.defaults.timeout = 10000;
const Crypto = require("crypto-js");
const fs = require('fs');
const hummus = require('hummus');
const memoryStreams = require('memory-streams');

let id = 621967, merge = true, authorKey = undefined;
if (process.argv.length >= 3)
    id = process.argv[2];
if (process.argv.length >= 4)
    axios.defaults.timeout = process.argv[3] * 1000;
if (process.argv.length >= 5)
    merge = !!+process.argv[4];
let deviceKey = '3uKpxtFAoOeqQQ0S';
let deviceToken = 'ebookF32BE444AF96C3BB0E71BF02D648DD9C';

console.logCopy = console.log.bind(console);
console.log = function (data) {
    let currentDate = '[' + new Date().toLocaleString() + '] ';
    this.logCopy(currentDate, data);
};
/**
 * Concatenate PDFs in Buffers
 * @param {Array} bufferList
 * @param {String} name
 * @returns {Promise}
 */
const combineMultiplePDFBuffers = async (bufferList, name) => {
    const outStream = new memoryStreams.WritableStream();
    try {
        const firstPDFStream = new hummus.PDFRStreamForBuffer(bufferList[0]);
        let pdfWriter = hummus.createWriterToModify(firstPDFStream, new hummus.PDFStreamForResponse(outStream));
        for (let i = 1; i < bufferList.length; ++i) {
            let tmpPDFStream = new hummus.PDFRStreamForBuffer(bufferList[i]);
            await pdfWriter.appendPDFPagesFromPDF(tmpPDFStream);
        }
        pdfWriter.end();
        let newBuffer = outStream.toBuffer();
        outStream.end();

        fs.writeFileSync(name, newBuffer);
        return Promise.resolve()
    } catch (e) {
        outStream.end();
        return Promise.reject('Error during PDF combination: ' + e.message)
    }
};

function makeKey(e, t) {
    var n = Crypto.enc.Utf8.parse(e);
    return Crypto.AES.decrypt(t, n, {
        mode: Crypto.mode.ECB,
        padding: Crypto.pad.Pkcs7
    })
}

function btoa(s) {
    return Buffer.from(s, 'binary').toString('base64')
}

/**
 * @return {string}
 */
function Uint8ToBase64(t) {
    let c = "";
    for (let o = 32768, a = 0, s = t.length, l; a < s;) {
        l = t.subarray(a, Math.min(a + o, s));
        c += String.fromCharCode.apply(null, l);
        a += o;
    }
    return btoa(c);
}

function wordArrayToU8(t) {
    let o = t.words, a = t.sigBytes, s = new Uint8Array(a), c = 0, l;
    for (; c < a; c++) {
        l = o[c >>> 2] >>> 24 - c % 4 * 8 & 255;
        s[c] = l;
    }
    return s
}

const detail_param = {
    'AccessToken': 'null',
    'DeviceToken': deviceToken,
    'ApiName': '/Content/Detail',
    'BridgePlatformName': 'phei_yd_web',
    'random': Math.random(),
    'AppId': 3,
    'id': id,
};

let detail = null, data = null;
let start = new Date().getTime();
axios.get('https://bridge.51zhy.cn/transfer/Content/Detail', {params: detail_param}).then(res => {
    detail = res.data;
}).then(() => {
    console.log(`开始下载：${detail['Data']['Title']}`);
    let authorizeToken = detail['Data']['ExtendData']['AuthorizeToken'];
    const authorize_data = {
        'AccessToken': 'null',
        'DeviceToken': deviceToken,
        'ApiName': 'content/authorize',
        'BridgePlatformName': 'phei_yd_web',
        'random': Math.random(),
        'AppId': 3,
        'id': id,
        'IsOnline': true,
        'authorizeToken': authorizeToken,
    };
    const url_encoded = obj => Object.keys(obj).map(k => encodeURIComponent(k) + '=' + encodeURIComponent(obj[k])).join('&');
    axios.post('https://bridge.51zhy.cn/transfer//content/authorize', url_encoded(authorize_data), {
        headers: {'Content-Type': "application/x-www-form-urlencoded; charset=UTF-8"}
    }).then(async function (response) {
        data = response['data']['Data'];
        if (response['data']['Code'] !== 200) {
            console.log('接口失效，' + response['data']['Description']);
        } else {
            authorKey = makeKey(deviceKey, data['Key']);
            let buffer_list = [];
            if (!merge && !fs.existsSync(id)) {
                fs.mkdirSync(id);
            }
            let page = data['SplitFileUrls'];
            while (page.length) {
                let new_page = [];
                for (let i = 0; i < page.length; ++i) {
                    let page_url = page[i];
                    await axios.get(page_url,
                        {
                            responseType: 'arraybuffer'
                        })
                        .then((response) => {
                            let arrayBuffer = response.data;
                            let a = new Uint8Array(arrayBuffer);
                            let s = Uint8ToBase64(a);
                            let c = Crypto.AES.decrypt(s, authorKey, {
                                mode: Crypto.mode.ECB,
                                padding: Crypto.pad.Pkcs7
                            });
                            let buffer = wordArrayToU8(c);
                            buffer_list.push({
                                index: i,
                                buffer: buffer,
                            });
                            console.log(`已下载第${i + 1}页PDF，共下载${buffer_list.length}/${data['SplitFileUrls'].length}页`);
                            if (!merge) fs.writeFileSync(`${id}/${id}-${detail['Data']['Title']}-${i}.pdf`, buffer);
                        })
                        .catch((error) => {
                            new_page.push(page_url);
                            console.log(`第${i + 1}页PDF下载失败`);
                        });
                }
                page = new_page;
            }
            if (merge && buffer_list.length === data['SplitFileUrls'].length) {
                console.log(`下载完成，开始合成PDF`);
                buffer_list.sort((a, b) => {
                        return a.index - b.index
                    }
                );
                let result = buffer_list.map(({buffer}) => buffer);
                await combineMultiplePDFBuffers(result, `${id}-${detail['Data']['Title']}.pdf`);
                let end = new Date().getTime();
                console.log(`下载&合成完成，共计用时:${end - start}ms`);
            }
        }
    })
});

