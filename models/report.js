const mongoose = require('mongoose');

const time = require('../time');
const meal = require('./meal');

const User = require('./user');

// 5 similar fields may be not okay

const reportSchema = new mongoose.Schema({
    user: {
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
    
    breakfast: {
        meals: [{
            _id: mongoose.Schema.Types.ObjectId,
            food: { 
                type: mongoose.Schema.Types.ObjectId, 
                ref: 'meal',
            },
            weight: {
                eaten: Number,
                toEat: Number,
            },

        }],
        caloriesTarget: Number,
        nutrientRates: {
            proteins: {
                type: Number,
                default: 0.35,
                immutable: true,
            },
            fats: {
                type: Number,
                default: 0.25,
                immutable: true,
            },
            carbons: {
                type: Number,
                default: 0.4,
                immutable: true,
            },
        }
    },
    dinner: [{
        _id: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
        },
        meal: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'meal',
        },
        caloriesTarget: {
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
        caloriesTarget: {
            type: Number,
            min: 0,
        }
    }],
    lunch1: [{
        _id: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
        },
        meal: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'meal',
        },
        caloriesTarget: {
            type: Number,
            min: 0,
        }
    }],
    lunch2: [{
        _id: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
        },
        meal: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'meal',
        },
        caloriesTarget: {
            type: Number,
            min: 0,
        }
    }],

    calories: {
        got: Number,
        target: Number,
    }

}, { collection: 'reports', versionKey: false });

// _____________________________________________

// calculate calories-got in the report
reportSchema.pre('save', async function(next) {
    let cals = Number(0);

    await this.populate('breakfast.meals.food');
    for (item of this.breakfast.meals) 
        cals += item.food.getCaloriesByWeight(item.weight);

    /*
    await this.populate('dinner.meals.food');
    for (item of this.dinner.meals) 
        this.calories += item.meal.getCaloriesByWeight(item.weight);

    await this.populate('supper.meals.food');
    for (item of this.supper.meals) 
        this.calories += item.meal.getCaloriesByWeight(item.weight);

    await this.populate('lunch1.meals.food');
    for (item of this.lunch1.meals) 
        this.calories += item.meal.getCaloriesByWeight(item.weight);

    await this.populate('lunch2.meals.food');
    for (item of this.lunch2.meals) 
        this.calories += item.meal.getCaloriesByWeight(item.weight);
    */

    this.calories.got = cals.toFixed();
});

// ____________________________________________________________________

reportSchema.methods.getTab = function(tab) {

    let meal;
    switch(tab) {
        case 'breakfast':
            meal = this.breakfast;
            break;

        case 'launch1':
            meal = this.launch1;
            break;

        case 'dinner':
            meal = this.dinner;
            break;

        case 'launch2':
            meal = this.launch2;
            break;

        case 'supper':
            meal = this.supper;
            break;
    }

    return meal;
}

// calc toEat weight for each food
reportSchema.methods.calcToEatWeights = async function(tab, nutrient) {

    let meal = this.getTab(tab);

    await meal.populate('meals.food');

    let newCaloriesGot = 0;
    // calc new calories got sum
    for (item of meal.meals) {
        if (item.food.group == nutrient)
            newCaloriesGot += item.food.calories * item.weight.eaten;
    }

    let rate = 0;
    switch (nutrient) {
        case 'proteins':
            rate = meal.nutrientRates.proteins;
            break;

        case 'fats':
            rate = meal.nutrientRates.fats;
            break;

        case 'carbons':
            rate = meal.nutrientRates.carbons;
            break;
    }

    const caloriesToEat = meal.caloriesTarget * rate - newCaloriesGot;

    // calc new weights toEat
    for (item of meal.meals) {
        item.weight.toEat = (caloriesToEat / item.food.calories).toFixed();
    }
};

// calc all the target calories in the
reportSchema.methods.calcTargetCalories = function() {
    
    this.calories.target = this.user.caloriesToLose;

    switch(this.user.mealsPerDay) {
        case 3:
            this.breakfast.caloriesTarget = (this.calories.target * 0.4).toFixed();
            break;

        case 4:
            this.breakfast.caloriesTarget = (this.calories.target * 0.25).toFixed();
            break;

        case 5:
            this.breakfast.caloriesTarget = (this.calories.target * 0.25).toFixed();
            break;
    }
};

module.exports = mongoose.model('report', reportSchema);