const mongoose = require('mongoose');

const time = require('../time');

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
    
    tabs: [{
        /* Tabs:
        *   0 - breakfast
        *   1 - lunch 1
        *   2 - dinner
        *   3 - lunch 2
        *   4 - supper
        */
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
        calories: { target: Number },
        nutrientRates: {
            'proteins': Number,
            'fats': Number,
            'carbons': Number,
        }
    }],

    nonNutrientMealsWeights: {
        vegetables: {
            got: Number,
            target: {
                type: Number,
                default: 300,
                immutable: true,
            }
        },
    },

    calories: {
        got: Number,
        target: Number,
    },
    mealsPerDay: Number,

}, { collection: 'reports', versionKey: false });

// _____________________________________________

// calculate calories-got in the report
reportSchema.pre('save', async function() {

    this.calories.got = Number(0);

    await this.populate('tabs.meals.food');

    for (tab of this.tabs) {
        for (meal of tab.meals) {
            this.calories.got += Number(meal.food.calories * meal.weight.eaten);
        }
    }

    this.calories.got = (this.calories.got).toFixed();
});

// ____________________________________________________________________

// calc toEat weight for each food
reportSchema.methods.calcToEatWeights = async function(tab, nutrient) {

    // copied from the _commons.js because 
    // requiring caused errors
    // change the both instances if needed
    const tabAtoi = {
        'breakfast': 0,
        'lunch1': 1,
        'dinner': 2,
        'lunch2': 3,
        'supper': 4,
    };

    
    await this.populate(`tabs.${tabAtoi[tab]}.meals.food`);
    const curTab = this.tabs[ tabAtoi[tab] ];

    // calc new calories per nutrient sum
    let newCaloriesGot = 0;
    for (let meal of curTab.meals) {
        if (meal.food.group == nutrient)
            newCaloriesGot += meal.food.calories * meal.weight.eaten;
    }

    const rate = curTab.nutrientRates[nutrient];
    const caloriesToEat = curTab.calories.target * rate - newCaloriesGot;

    // calc new weights to eat
    for (let meal of curTab.meals) {
        if (meal.food.group == nutrient)
            meal.weight.toEat = (caloriesToEat / meal.food.calories).toFixed();
    }
};

// calc all the target calories in the report
reportSchema.methods.calcTargetCalories = function() {

    /* Tabs:
    *   0 - breakfast
    *   1 - lunch 1
    *   2 - dinner
    *   3 - lunch 2
    *   4 - supper
    */
    switch(this.mealsPerDay) {
        case 3:
            this.tabs[0].calories.target = (this.calories.target * 0.3).toFixed();
            this.tabs[2].calories.target = (this.calories.target * 0.45).toFixed();
            this.tabs[4].calories.target = (this.calories.target * 0.25).toFixed();
            break;

        case 4:
            this.tabs[0].calories.target = (this.calories.target * 0.25).toFixed();
            this.tabs[1].calories.target = (this.calories.target * 0.15).toFixed();
            this.tabs[2].calories.target = (this.calories.target * 0.4).toFixed();
            this.tabs[4].calories.target = (this.calories.target * 0.2).toFixed();
            break;

        case 5:
            this.tabs[0].calories.target = (this.calories.target * 0.25).toFixed();
            this.tabs[1].calories.target = (this.calories.target * 0.15).toFixed();
            this.tabs[2].calories.target = (this.calories.target * 0.35).toFixed();
            this.tabs[3].calories.target = (this.calories.target * 0.1).toFixed();
            this.tabs[4].calories.target = (this.calories.target * 0.15).toFixed();
            break;
    }
};

module.exports = mongoose.model('report', reportSchema);