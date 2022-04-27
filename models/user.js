const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    _id: {
        type: Number,
        required: true,
    },
    name: String,
    caloriesToLose: Number,
    mealsPerDay: Number
   
}, {versionKey: false, collection: 'users'} );

module.exports = mongoose.model('user', userSchema);