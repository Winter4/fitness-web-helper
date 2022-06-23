const express = require("express");
const router = express.Router();
const { log } = require("../logger");

const User = require("../models/user");
const Report = require("../models/report");
const time = require("../time");

const { getReport } = require("../_commons");

const { Telegram } = require("telegraf");
const tgClient = new Telegram(process.env.BOT_TOKEN);

// copied from models/report
// got errors on exporting
// so here's the solvation
const groupAtoi = {
  proteins: 0,
  fats: 1,
  carbons: 2,
};

// get the percents of eating per each group
const examineTab = (tab, name) => {
  // calc the percent of reaching the target
  let percents = [];
  for (let group of tab.nutrients) {
    const perc = Number(
      (group.calories.got / group.calories.target) * 100
    ).toFixed();
    percents.push(perc);
  }

  // func for getting mark from the percent value
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

  // calcing marks for percent array
  let marks = [];
  for (let perc of percents) marks.push(getMark(perc));

  return {
    name: name,
    mark: marks,
    value: percents,
  };
};

// router for sending report to bot
router.get("/send-report/:user", async (req, res) => {
  try {
    // user object
    const user = await User.findById(req.params.user);

    // report for user and date
    const report = await getReport(req.params, req.query);
    await report.populate("tabs.meals.food");

    // get the tabs percents and marks
    const tabs = {
      breakfast: examineTab(report.tabs[0], "Завтрак"),
      lunch1: examineTab(report.tabs[1], "Перекус 1"),
      dinner: examineTab(report.tabs[2], "Обед"),
      lunch2: examineTab(report.tabs[3], "Перекус 2"),
      supper: examineTab(report.tabs[4], "Ужин"),
    };

    // generate text from the tab values
    const generateTab = (tab) => {
      const template = (nutr, value) =>
        `В данном приеме пищи содержание ${nutr}ов составляет <b>${value}%</b> от идеального значения`;
      const marks = {
        5: "Идеально!",
        4: "Отлично!",
        3: "Хорошо!",
        2: "Норма!",
        1: "Неудовлетворительно!",
      };

      return (
        `<b><u>${tab.name}:</u></b> \n` +
        `<b>Белки</b>: ${marks[tab.mark[0]]} ${template(
          "белк",
          tab.value[0]
        )} \n` +
        `<b>Жиры</b>: ${marks[tab.mark[1]]} ${template(
          "жир",
          tab.value[1]
        )} \n` +
        `<b>Углеводы</b>: ${marks[tab.mark[2]]} ${template(
          "углевод",
          tab.value[2]
        )} \n\n`
      );
    };

    // groups avg percents
    const avgPercents = {
      values: Array(3).fill(Number(0)),
      count: 0,
    };
    const addPercents = (values) => {
      for (let i in avgPercents.values) {
        avgPercents.values[i] += Number(values[i]);
      }
      avgPercents.count++;
    };

    // concatenate the strings and make the message to bot
    // also calc groups percents

    let text = `Отчёт за ${report.date} проверен \n\n\n${user.name}, мы оценили Ваш отчёт \n\n`;
    text += generateTab(tabs.breakfast);
    addPercents(tabs.breakfast.value);
    if (user.mealsPerDay > 3) {
      text += generateTab(tabs.lunch1);
      addPercents(tabs.lunch1.value);
    }
    text += generateTab(tabs.dinner);
    addPercents(tabs.dinner.value);
    if (user.mealsPerDay == 5) {
      text += generateTab(tabs.lunch2);
      addPercents(tabs.lunch2.value);
    }
    text += generateTab(tabs.supper);
    addPercents(tabs.supper.value);

    // calc avg percents for each group
    for (let i in avgPercents.values)
      avgPercents.values[i] /= avgPercents.count;
    // if all the percents are good, make it true and send its msg
    let percentsFlag = true;

    // if the proteins weight breaks the limits
    if (avgPercents.values[0] <= 89) {
      percentsFlag = false;
      text +=
        "\nНедостаточное содержание белка в организме приводит к снижению мышечной массы, ухудшению мышечного тонуса и снижению силовых показателей \n";
    } else if (avgPercents.values[0] >= 111) {
      percentsFlag = false;
      text +=
        "\nОбратите внимание: при избытке белка еда с трудом переваривается, поэтому ЖКТ работает в усиленном режиме, " +
        "что сказывается на самочувствии и ведёт к повышению общей калорийности \n";
    }

    // if the fats weight breaks the limits
    if (avgPercents.values[1] <= 89) {
      percentsFlag = false;
      text +=
        "\nОбратите внимание: при недостаточном содержании жиров в рационе организму тяжело насытиться другими нутриентами и регулировать аппетит! " +
        "Также, содержание в рационе полиненасыщенных жиров (орехи, жирная рыба, тофу, соевые бобы, семечки, грецкие орехи, семена льна и подсолнечника), " +
        "и мононенасыщенных жиров (орехи и ореховое масло, авокадо, оливковое и рапсовое масло, оливки) ведёт к улучшению многих функций организма и профилактике различных заболеваний\n";
    } else if (avgPercents.values[1] >= 111) {
      percentsFlag = false;
      text +=
        "\nОбратите внимание: при избытке жиров, калорийность рациона существенно повышается, что способствует набору лишнего веса \n";
    }

    // if the carbons weight is not enough
    if (avgPercents.values[2] <= 89) {
      percentsFlag = false;
      text +=
        "\nОбратите внимание: недостаточное содержание углеводов (особенно в утреннее и дневное время) приводит к плохому самочувствию, " +
        "нехватке энергии и чувству голода(особенно в вечернее время) \n";
    } else if (avgPercents.values[2] >= 111) {
      percentsFlag = false;
      text +=
        "\nОбратите внимание: при повышенном содержании углеводов в суточном рационе, организм конвертирует их избыточное количество в жир \n";
    }

    // if the vegetables weight isn't enough
    if (
      Number(report.vegetables.weight.eaten) <
      Number(report.vegetables.weight.target)
    ) {
      text +=
        "\nОбратите внимание: недостаточное потребление овощей в рационе к недостаточному наличию клетчатки, " +
        "которая «скрабирует» и нормализует работу ЖКТ, помогает избавиться от лишнего веса, выводит шлаки и токсины. " +
        "Достаточное количество клетчатки приводит к медленному усвоению жиров и углеводов, снижает уровень сахара в крови, " +
        "дает чувство сытости\n";
    }

    // if junkfood was eaten
    if (report.junk.calories.got > 0) {
      // if junkfood breakes the calories limit
      if (
        report.calories.got > report.calories.target &&
        report.calories.got - report.junk.calories.got <= report.calories.target
      ) {
        text +=
          "\nВы превысили свою калорийность за счет нерекомендованных продуктов. Это не позволит Вам добиться результата: вы наберёте вес или он останется тем же";
      } else {
        text +=
          "\nУпотребление нерекомендованных продуктов негативно скажется на Вашем результате в достижении желаемого веса";
      }
    }

    log.info("Sending report to bot", { user: user._id, date: report.date });
    tgClient.sendMessage(req.params.user, text, { parse_mode: "HTML" });
    log.info("Sent report to bot", { user: user._id, date: report.date });

    log.info("Response for GET with OK", { route: req.url });
    res.send();
  } catch (e) {
    log.error({ route: req.url, error: e.message });
    res.statusCode = 500;
    res.send("Возникла непредвиденная ошибка на стороне сервера :(");
  }
});

module.exports = router;
