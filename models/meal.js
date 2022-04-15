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

mealSchema.methods.calcByWeight = function(weight) {
    return {
        _id: this._id,
        name: this.name,

        calories: (weight * this.calories / 100).toFixed(1),
        proteins: (weight * this.proteins / 100).toFixed(1),
        fats: (weight * this.fats / 100).toFixed(1),
        carbons: (weight * this.carbons / 100).toFixed(1),

        group: this.group,
    };
};

mealSchema.methods.getCaloriesByWeight = function(weight) {
    return Number((weight * this.calories / 100).toFixed(1));
}

module.exports = mongoose.model('meal', mealSchema);