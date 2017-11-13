const mongoose              = require('mongoose');
const { Schema }            = mongoose;
mongoose.Promise            = require('bluebird');

const chatSchema = new Schema({
    username: {type: String, required: true},
    message: {type: String, required: true},
    time: {type: String, required: true},
    created_at: {type: Date, default: Date.now},
    is_deleted: false
});

module.exports = mongoose.model('Chat', chatSchema);
