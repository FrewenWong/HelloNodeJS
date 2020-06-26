const fs = require('fs')
const request = require('requestretry')
const crypto = require('crypto')
const path = require('path')


exports.downloadImage = function (url, savePath) {
    return new Promise((resolve, reject) => {
        let ws = fs.createWriteStream(savePath)
        //文件资源描述符被耗完：Error: EMFILE: too many open files
        ws.on('finish', () => {
            resolve() //下载完成
        })
        request({
            url: url,
            maxAttempts: 5,
            retryDelay: 2000,
            retryStrategy: request.RetryStrategies.HTTPOrNetworkError,
        })
            .on('error', function (err) {
                reject(err)
            })
            .pipe(ws)
    })
}


exports.detectImageWH = async function (url) {
    const fileName = crypto
        .createHash('md5')
        .update(url)
        .digest('hex')
    const suffix = url.substr(url.lastIndexOf('.'))
    const dir = path.resolve(__dirname, '../images')
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir)
    }
    const savePath = `${dir}/${fileName}${suffix}`
    await exports.downloadImage(url, savePath)
    const dimensions = await sizeOf(savePath)
    return dimensions
}
