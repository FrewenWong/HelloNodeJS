const mongoose = require('mongoose');

/**
 * 实例化mongodb的配置
 * @type {{bufferMaxEntries: number, useFindAndModify: boolean, poolSize: number, socketTimeoutMS: number, reconnectInterval: number, connectTimeoutMS: number, useCreateIndex: boolean, useNewUrlParser: boolean, family: number, autoReconnect: boolean, reconnectTries: number, autoIndex: boolean}}
 */
const options = {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: true,
    autoIndex: true, // Don't build indexes
    autoReconnect: true,
    reconnectTries: Number.MAX_VALUE, // Never stop trying to reconnect
    reconnectInterval: 500, // Reconnect every 500ms
    poolSize: 10, // Maintain up to 10 socket connections
    // If not connected, return errors immediately rather than waiting for reconnect
    bufferMaxEntries: 0,
    connectTimeoutMS: 10000, // Give up initial connection after 10 seconds
    socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    family: 4, // Use IPv4, skip trying IPv6
};

/**
 * 导出MongoDB的connect的方法
 * @returns {Promise<void>}
 */
exports.connect = async function () {
    let url = `mongodb://${process.env.MONGO_USERNAME}:${
        process.env.MONGO_PASSWORD
    }@${process.env.MONGO_HOST}:${process.env.MONGO_PORT}/${
        process.env.MONGO_DB_NAME
    }`;
    console.log("connect", `mongodb url: ${url}`);
    await mongoose.connect(url, options);
};

/**
 * 导出MongoDB的disconnect的方法
 * @returns {Promise<void>}
 */
exports.disconnect = async function () {
    await mongoose.disconnect()
};
