const {connect, disconnect} = require("./database");
const moment = require('moment');
const dotEnv = require('dotenv');
const {imageSpider4j4j, saveToMongodb} = require('./spider/4jSpider/4JImgSpider');
const logger = require("./common/Logger");


dotEnv.config();

const TAG = "NyxNodeSpider";
console.debug(TAG, "==========NyxSpider Start============");

/**
 * 方法立即执行
 */
(async function () {
    // 进行数据库连接
    await connect();

    const start = moment();

    const result = await execWebSpider()

    await saveToMongodb(result);

    // logger.log("info", `imageSpider4j4j:${JSON.stringify(result)}`);

    console.debug(`cost ${moment.duration(moment().diff(start)).as('seconds')}s`)


})().finally(() => {
    //
    disconnect().then((response) => {
        console.debug(TAG, 'disconnect', response);
    });
});

/**
 * 网络爬虫开始执行
 * @returns {Promise<void>}
 */
async function execWebSpider() {

    return imageSpider4j4j();
}
