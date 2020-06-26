const cheerio = require('cheerio');
const Promise = require('bluebird');
const {request} = require("../../common/HttpUtils");
const AlbumModel = require('./model/album.model')
const ChannelModel = require('./model/channel.model')
const RecommendAlbumModel = require('./model/recommend_album.model')
const logger = require("../../common/Logger");

const TAG = "4JImageSpider";

async function getHttpResponse(link) {
    // 获取网络请求内容
    const body = await request(link);
    // console.debug("getHttpResponse", `body = ${JSON.stringify(body)}`);
    /// 获取网页内容。然后使用cheerio.load()
    // https://github.com/cheeriojs/cheerio/wiki/Chinese-README
    const $ = cheerio.load(body);
    const result = [];
    $('div.row.screen_option.bor0>.body>ul>li>a').each((i, e) => {
        // 获取二级请求连接
        const link = `http://www.4j4j.cn${$(e).attr('href')}`;
        const name = $(e).text();
        if (name !== '全部') {
            result.push({
                name,
                link,
            })
        }
    });
    return result
}

exports.imageSpider4j4j = async function () {

    const result = await getHttpResponse('http://www.4j4j.cn/sjbz/f-size219.html');
    // console.debug("imageSpider4j4j", `result = ${JSON.stringify(result)}`);


    for (const channel of result) {
        const links = await scrapeLinks(channel.link)
        // 定义专辑数组
        const albums = []
        /// http://bluebirdjs.com/docs/api/promise.map.html
        await Promise.map(
            links,
            async link => {
                // TODO albums.push(...()) 三个点是啥意思？
                albums.push(...(await scrapeAlbum(link)))
            },

            /// 定义并发数据
            {concurrency: 10});

        channel.albums = albums
    }
    return result

}

/**
 * 进行图片的抓取
 * @param link
 * @returns {Promise<void>}
 */
async function scrapePhoto(link) {
    const body = await request(link);
    // const $ = cheerio.load(body, { decodeEntities: false })
    const $ = cheerio.load(body);
    const photos = []
    $('#clearfix>li>div>a>img').each((i, e) => {
        let src = $(e).attr('src')
        // console.log(TAG, "=====", src);
        src = src.substr(0, src.indexOf('.jpg')) + '.jpg'
        photos.push({url: src, width: 1080, height: 1920})
    })
    let name = $('div.beauty_details>strong').html() || ''
    name = name.substr(0, name.indexOf('<font'))
    return {photos, name}
}

async function scrapeAlbum(link) {
    const body = await request(link);

    const $ = cheerio.load(body)

    const albums = []

    $('div.phone_wallpaper_box > ul >li')
        .each((index, element) => {
            const name = $(element)
                .find('p>a')
                .text()
            const link = `http://www.4j4j.cn${$(element)
                .find('a')
                .attr('href')}`
            let cover = $(element)
                .find('a>img')
                .attr('src');
            /// 我们进行一下格式化处理，去掉后面的图片大小的限制，找到原始的图
            cover = cover.substr(0, cover.indexOf('.jpg')) + '.jpg'
            let count = $(element)
                .find('p>font')
                .text();
            count = count.substr(count.indexOf('(') + 1, count.indexOf(')') - count.indexOf('(') - 1);
            // console.log(TAG, name, link, cover, count);
            /// 放入专辑数组中
            albums.push({
                name,
                cover: {url: cover, width: 1080, height: 1920},
                link,
                count
            })
        });

    await Promise.map(
        albums,
        async album => {
            const {photos, name} = await scrapePhoto(album.link)
            album.photos = photos
            album.name = name
            album.count = photos.length
        },
        {concurrency: 10}
    );
    return albums
}


/**
 * 进行图片的下一页、上一页的遍历
 * @param link
 * @returns {Promise<[*]>}
 */
async function scrapeLinks(link) {
    const body = await request(link);
    const $ = cheerio.load(body);
    const links = [link];

    $('#pageList>a').each((i, e) => {
        const pageNo = $(e).text();
        if (pageNo !== '上一页' && pageNo !== '下一页') {
            const link = $(e).attr('href');
            if (link) {
                links.push(`
            http://www.4j4j.cn${link}`)
            }
        }
    })
    ;
    return links
}

/**
 * 将爬虫爬取的结果保存到MongoDB中
 */
exports.saveToMongodb = async function (result) {

    await AlbumModel.deleteMany()

    await ChannelModel.deleteMany()

    for (const element of result) {
        /// 创建channel表，存入频道的相关
        const channel = await ChannelModel.create({name: element.name, albumCount: element.albums.length})

        //// 进行专辑的存储
        if (element.albums && element.albums.length > 0) {
            const albums = element.albums.map(v => {
                // 将albums是主键设置为channel表中的ID
                element.channelId = channel.id
                return element;
            })
            await AlbumModel.create(albums);
        }
    }

    const albums = await AlbumModel.find().limit(5);
    logger.log("info", `saveToMongodb::${JSON.stringify(albums)}`);
    await RecommendAlbumModel.create({albums: albums.map(v => v.id)})

}

