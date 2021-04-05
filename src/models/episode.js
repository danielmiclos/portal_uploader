const mongoose = require('mongoose');

const episodeSchema = mongoose.Schema({
    //_id: mongoose.Schema.Types.ObjectId,
    parentId: mongoose.Schema.Types.ObjectId,
    type: String,
    name: String,
    createdAt: mongoose.Schema.Types.Date,
    modifiedAt: mongoose.Schema.Types.Date
});

module.exports = mongoose.model('Episode', episodeSchema);