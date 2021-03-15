const mongoose = require('mongoose');


// Removi o _id porque o mongo cria sozinho e não preciso ficar testando se o ID existe para criar a pasta.
const projectItemSchema = mongoose.Schema({
    //_id: mongoose.Schema.Types.ObjectId,
    parentId: mongoose.Schema.Types.ObjectId,
    type: String,
    name: String,
    originalName: String,
    size: Number,
    path: String,
    createdAt: mongoose.Schema.Types.Date,
    modifiedAt: mongoose.Schema.Types.Date
});

module.exports = mongoose.model('ProjectItem', projectItemSchema);