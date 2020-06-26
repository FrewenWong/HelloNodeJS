const mongoose = require('mongoose')
const Schema = mongoose.Schema
const channelSchema = new Schema(
    {
        name: String,
        albumCount: {type: Number, default: 0},
    },
    {timestamps: true},
)

const ChannelModel = mongoose.model('channel', channelSchema)

module.exports = ChannelModel
