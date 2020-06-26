const mongoose = require('mongoose')
const Schema = mongoose.Schema
const albumSchema = new Schema(
    {
        name: String,
        author: String,
        authorName: String,
        authorAvatar: String,
        cover: {url: String, width: Number, height: Number},
        description: String,
        channelId: String,
        tags: [String],
        photos: [{url: String, width: Number, height: Number}],
        count: Number,
        favoriteCount: {type: Number, default: 0},
    },
    {timestamps: true},
)

const AlbumModel = mongoose.model('album', albumSchema)

module.exports = AlbumModel
