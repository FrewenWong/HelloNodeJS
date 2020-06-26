const mongoose = require('mongoose')
const Schema = mongoose.Schema
const recommendAlbumSchema = new Schema(
    {
        albums: [String],
    },
    {timestamps: true},
)

const RecommendAlbumModel = mongoose.model('recommend_album', recommendAlbumSchema)

module.exports = RecommendAlbumModel
