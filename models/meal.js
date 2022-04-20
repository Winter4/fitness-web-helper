const mongoose = require('mongoose');

const mealSchema = new mongoose.Schema({
    _id: {
        type: mongoose.Schema.Types.ObjectId,
    },
    name: {
        type: String,
        required: true,
    },
    calories: {
        type: Number,
        required: true,
    },
    proteins: {
        type: Number,
        required: true,
    },
    fats: {
        type: Number,
        required: true,
    },
    carbons: {
        type: Number,
        required: true,
    },

    group: {
        type: String,
        immutable: true,
    }
}, { collection: 'meals', versionKey: false });

module.exports = mongoose.model('meal', mealSchema);