const mongoose = require('mongoose');
require('dotenv').config();

const time = require('../time');

const reportSchema = new mongoose.Schema({
    userID: {
        type: Number,
        required: true,
        ref: 'user',
    },
    date: {
        type: String,
        required: true,
        default: () => time.today.date(),
        immutable: true,
    },
    
    breakfast: [{
        _id: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
        },
        meal: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'meal',
        },
        weight: {
            type: Number,
            min: 0,
        }
    }],
    dinner: [{
        _id: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
        },
        meal: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'meal',
        },
        weight: {
            type: Number,
            min: 0,
        }
    }],
    supper: [{
        _id: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
        },
        meal: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'meal',
        },
        weight: {
            type: Number,
            min: 0,
        }
    }],

}, { collection: 'reports', versionKey: false });

module.exports = mongoose.model('report', reportSchema);