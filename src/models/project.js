const mongoose = require('mongoose');


// Removi o _id porque o mongo cria sozinho e não preciso ficar testando se o ID existe para criar a pasta.
const projectSchema = mongoose.Schema({
    //_id: mongoose.Schema.Types.ObjectId,
    name: String,
    jobID:String,
    bidId:String,
    createdAt: mongoose.Schema.Types.Date,
    modifiedAt: mongoose.Schema.Types.Date
});

module.exports = mongoose.model('Project', projectSchema);