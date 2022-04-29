const express = require('express');
const router = express.Router();
const { log } = require('../logger');

const User = require('../models/user');
const Report = require('../models/report');
const time = require('../time');

const { getReport } = require('../_commons');

const { Telegram } = require('telegraf');
const tgClient = new Telegram(process.env.BOT_TOKEN);


const examineTab = (tab, name) => {

    let caloriesGot = {
        'proteins': 0,
        'carbons': 0,
        'fats': 0,
    };

    // calc calories eaten per each nutrient
    for (let meal of tab.meals) {
        caloriesGot[meal.food.group] += meal.food.calories * meal.weight.eaten;
    }

    // calc target calories value for each nutrient
    const caloriesTarget = {
        proteins: tab.calories.target * tab.nutrientRates.proteins,
        carbons: tab.calories.target * tab.nutrientRates.carbons,
        fats: tab.calories.target * tab.nutrientRates.fats,
    };

    // calc the percent of reaching the target
    const percents = {
        proteins: Number(caloriesGot.proteins / caloriesTarget.proteins * 100),
        carbons: Number(caloriesGot.carbons / caloriesTarget.carbons * 100),
        fats: Number(caloriesGot.fats / caloriesTarget.fats * 100),
    };


    const getMark = (percent) => {
        percent = Number(percent);

        let mark;
        if (percent >= 95 && percent <= 105) mark = 5;
        else if (percent >= 90 && percent <= 110) mark = 4;
        else if (percent >= 80 && percent <= 120) mark = 3;
        else if (percent >= 70 && percent <= 130) mark = 2;
        else mark = 1;

        return mark;
    };

    return {
        name: name,
        mark: {
            proteins: getMark(percents.proteins),
            carbons: getMark(percents.carbons),
            fats: getMark(percents.fats),
        },
        value: {
            proteins: (percents.proteins).toFixed(),
            carbons: (percents.carbons).toFixed(),
            fats: (percents.fats).toFixed(),
        },
    };
};

router.get('/send-report/:user', async (req, res) => {
    try {
        const user = await User.findById(req.params.user);

        const report = await getReport(req.params, req.query);
        await report.populate('tabs.meals.food');

        const tabs = {
            breakfast: examineTab(report.tabs[0], 'Завтрак'),
            lunch1: examineTab(report.tabs[1], 'Перекус 1'),
            dinner: examineTab(report.tabs[2], 'Обед'),
            lunch2: examineTab(report.tabs[3], 'Перекус 2'),
            supper: examineTab(report.tabs[4], 'Ужин'),
        }



        const generateTab = (tab) => {

            const template = (nutr, value) => `В данном приеме пищи содержание ${nutr}ов составляет <b>${value}%</b> от идеального значения`;
            const marks = {
                '5': 'Идеально!',
                '4': 'Отлично!',
                '3': 'Хорошо!',
                '2': 'Норма!',
                '1': 'Неудовлетворительно!',
            };

            return `<b><u>${tab.name}:</u></b>
<b>Белки</b>: ${marks[tab.mark.proteins]} ${template('белк', tab.value.proteins)}
<b>Жиры</b>: ${marks[tab.mark.fats]} ${template('жир', tab.value.fats)}
<b>Углеводы</b>: ${marks[tab.mark.carbons]} ${template('углевод', tab.value.carbons)} \n\n`
        };



        let text = `Отчёт за ${report.date} проверен \n\n\n${user.name}, мы оценили Ваш отчёт \n\n`;
        text += generateTab(tabs.breakfast);
        if (user.mealsPerDay > 3) text += generateTab(tabs.lunch1);
        text += generateTab(tabs.dinner);
        if (user.mealsPerDay == 5) text += generateTab(tabs.lunch2);
        text += generateTab(tabs.supper);

        if (Number(report.nonNutrientMeals.vegetables.weight.eaten) < 300) {
            text += `Обратите внимание: недостаточное потребление овощей в рационе к недостаточному наличию клетчатки, ` + 
                `которая «скрабирует» и нормализует работу ЖКТ, помогает избавиться от лишнего веса, выводит шлаки и токсины. ` + 
                `Достаточное количество клетчатки приводит к медленному усвоению жиров и углеводов, снижает уровень сахара в крови, `
                + `дает чувство сытости.`;
        }

        log.info('Sending report to bot', { user: user._id, date: report.date });
        tgClient.sendMessage(req.params.user, text, { parse_mode: 'HTML' });
        log.info('Sent report to bot', { user: user._id, date: report.date });

        log.info('Response for GET with OK', { route: req.url });
        res.send();

    } catch (e) {
        log.error({ route: req.url, error: e.message });
        res.statusCode = 500;
        res.send('Возникла непредвиденная ошибка на стороне сервера :(');
    }
});

module.exports = router;