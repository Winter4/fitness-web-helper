const mongoose = require('mongoose');
const { log } = require('../logger');

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
        calories: { got: Number, target: Number, },
        nutrients: [{
            rate: Number,
            calories: {
                got: Number,
                target: Number,
            },
        }],
    }],

    vegetables: {
        weight: {
            eaten: Number,
            target: {
                type: Number,
                default: 300,
                immutable: true,
            }
        }
    },
    junk: [{
        _id: mongoose.Schema.Types.ObjectId,
        food: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'meal',
        },
        weight: {
            eaten: Number,
        },
    }],

    calories: {
        got: Number,
        target: Number,
    },
    mealsPerDay: Number,

}, { collection: 'reports', versionKey: false });

// _____________________________________________

// logging
reportSchema.pre('save', function(next) {
    log.info('Saving report to DB', { user: this.user, date: this.date });
    next();
});

// logging
reportSchema.post('save', function(doc, next) {
    log.info('Saved report to DB', { user: this.user, date: this.date });
    next();
});



const groupAtoi = {
    'proteins': 0,
    'fats': 1,
    'carbons': 2,
}

// calculate calories-got in the report
reportSchema.pre('save', async function(next) {
    try {
        log.info('Entered pre-save model mdlwre', { model: 'report' });

        // get the meals info
        await this.populate('tabs.meals.food');

        // ________________ calc calories got in the whole report __________________
        
        // reset calories got in the report
        this.calories.got = Number(0);
        
        // calc calories in tabs
        for (tab of this.tabs) {

            // reset calories got in the tab
            tab.calories.got = Number(0);

            // reset calories got per each group
            for (let group of tab.nutrients)
                group.calories.got = Number(0);

            // calc calories got per each group & in the tab & in report
            for (meal of tab.meals) {

                // calories per this food (weigh * calory)
                const cals = Number(meal.food.calories * meal.weight.eaten)

                // report calories
                this.calories.got += cals;
                // tab calories  
                tab.calories.got += cals;
                // group calories
                tab.nutrients[ groupAtoi[meal.food.group] ].calories.got += cals;
            }

            // set calories got in tab to fixed
            tab.calories.got = (tab.calories.got).toFixed();

            // set calories got to fixed
            for (let group of tab.nutrients)
                group.calories.got = (group.calories.got).toFixed();
        }

        // calc calories in junkfood tables
        await this.populate('junk.food');
        for (meal of this.junk)
            this.calories.got += Number(meal.food.calories * meal.weight.eaten);

        // beauifing
        this.calories.got = (this.calories.got).toFixed();
        

        log.info('Leaving pre-save model mdlwre', { model: 'report' });
        next();

    } catch (e) {
        log.error({ model: 'report', error: e.message });
        throw new Error('Report model pre-save mdlwre failed');
    }
});

// ____________________________________________________________________

// calc toEat weight for each food
reportSchema.methods.calcToEatWeights = async function(tab, nutrient) {
    try {
        log.info('Entered calcToEatWeights model method', { model: 'report' });

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

        // get the food data
        await this.populate(`tabs.${tabAtoi[tab]}.meals.food`);

        // get tab to operate with
        const curTab = this.tabs[ tabAtoi[tab] ];
        // get group in the tab to operate with
        const curGroup = curTab.nutrients[ groupAtoi[nutrient] ];

        // calories to be eaten in this group
        const caloriesToEat = curGroup.calories.target - curGroup.calories.got;

        // calc new weights to eat
        for (let meal of curTab.meals) {
            if (meal.food.group == nutrient)
                meal.weight.toEat = (caloriesToEat / meal.food.calories).toFixed();
        }

        log.info('Leaving calcToEatWeights model method', { model: 'report' });

    } catch (e) {
        log.error({ model: 'report', error: e.message });
        throw new Error('Report model calcToEatWeights method failed');
    }
};

// calc all the target calories in the report
reportSchema.methods.calcTargetCalories = function() {
    try {
        log.info('Entered calcTargetCalories model method', { model: 'report' });

        /* Tabs:
        *   0 - breakfast
        *   1 - lunch 1
        *   2 - dinner
        *   3 - lunch 2
        *   4 - supper
        */
       
        // target calories per each tab
        switch(this.mealsPerDay) {
            case 3:
                this.tabs[0].calories.target = (this.calories.target * 0.3).toFixed();
                this.tabs[2].calories.target = (this.calories.target * 0.45).toFixed();
                this.tabs[4].calories.target = (this.calories.target * 0.25).toFixed();

                this.tabs[1].calories.target = 0;
                this.tabs[3].calories.target = 0;
                break;

            case 4:
                this.tabs[0].calories.target = (this.calories.target * 0.25).toFixed();
                this.tabs[1].calories.target = (this.calories.target * 0.15).toFixed();
                this.tabs[2].calories.target = (this.calories.target * 0.4).toFixed();
                this.tabs[4].calories.target = (this.calories.target * 0.2).toFixed();

                this.tabs[3].calories.target = 0;
                break;

            case 5:
                this.tabs[0].calories.target = (this.calories.target * 0.25).toFixed();
                this.tabs[1].calories.target = (this.calories.target * 0.15).toFixed();
                this.tabs[2].calories.target = (this.calories.target * 0.35).toFixed();
                this.tabs[3].calories.target = (this.calories.target * 0.1).toFixed();
                this.tabs[4].calories.target = (this.calories.target * 0.15).toFixed();
                break;
        }

        // target calories per each nutrient (group) in each tab
        for (let tab of this.tabs) {
            for (let group of tab.nutrients) {
                group.calories.target = (tab.calories.target * group.rate).toFixed();
            }
        }

        log.info('Leaving calcTargetCalories model method', { model: 'report' });

    } catch (e) {
        log.error({ model: 'report', error: e.message });
        throw new Error('Report model calcTargetCalories method failed');
    }
};

module.exports = mongoose.model('report', reportSchema);