
// __________________________ get query object of the URL __________________________________ //

function getQueryParam(param, url) {

    let href = url;
    // this is an expression to get query strings
    let regexp = new RegExp( '[?&]' + param + '=([^&#]*)', 'i' );
    let qString = regexp.exec(href);

    return qString ? qString[1] : null;
}

// G L O B A L S
const protocol = 'http://';
const host = 'localhost:8080';
const origin = protocol + host;

const url = new URL(location.href).href;

const user = getQueryParam('user', url);
const yesterday = Number(getQueryParam('yesterday', url));
// _____________ //

// ______________________________ update header calories ___________________________________ //

function updateCaloriesGot(user, yesterday) {

    $.get(`/calories-got/${user}?yesterday=${yesterday}`)
    .done(function(res) {
        $('header div.calories div.got').html(res.caloriesGot);
    })
    .fail(function(err) { console.log('Update calories got:'); console.log(err); });
}

// _______________________________ update & get vegetables weights __________________________ //

function updateVegetablesInput() {
    const newVal = $('div.vegetables input').val();

    $.ajax({
        url: `/reports/non-nutr/vegetables/${user}?yesterday=${yesterday}&veg_weight=${newVal}`,
        type: 'PUT',
        success: function (res) {
            getVegetablesInput();
        },
        error: function(res) {
            
        }
    });
}

function getVegetablesInput() {

    $.get(`/reports/non-nutr/vegetables/${user}?yesterday=${yesterday}`)
    .done(function(res) {
        $('div.vegetables input').val(res.eatenWeight);
        
        let toEat = '';
        if (Number(res.toEatWeight) > 0) {
            toEat = '<i class="fa-solid fa-arrow-up color-green"></i> ' + res.toEatWeight;
        }
        $('div.vegetables #toEatVegetablesWeight').html(toEat);

    })
    .fail(function() { });
}

// _________________________ edit row after weigth changing _________________________________ //

function updateNutrRow(user, tab, rowID, nutrient, yesterday) {

    let newWeight = $(`#${rowID}`).val();

    $.ajax({
        url: `/reports/nutr/${user}/${tab}/${nutrient}?yesterday=${yesterday}&row_id=${rowID}&row_weight=${newWeight}`,
        type: 'PUT',
        success: function (res) {
            $(`#nav-${tab} .${nutrient} .block-table table.block-rows`).DataTable().ajax.reload();
            updateCaloriesGot(user, yesterday);
        },
        error: function(res) {
            console.log(`Update ${tab} ${nutrient} table data error`)
        }
    });
}
async function onNutrRowUpdate(user, tab, rowID, nutrient, yesterday) {
    updateNutrRow(user, tab, rowID, nutrient, yesterday);
}

function updateJunkRow(user, rowID, yesterday) {
    let newWeight = $(`#${rowID}`).val();

    $.ajax({
        url: `/reports/non-nutr/junk/${user}?yesterday=${yesterday}&row_id=${rowID}&row_weight=${newWeight}`,
        type: 'PUT',
        success: function (res) {
            $(`div.junk table`).DataTable().ajax.reload();
            updateCaloriesGot(user, yesterday);
        },
        error: function(res) {
            console.log(`Update ${tab} ${nutrient} table data error`)
        }
    });
}
async function onJunkRowUpdate(user, rowID, yesterday) {
    updateJunkRow(user, rowID, yesterday);
}

// ___________________________ delete row from the table ______________________________ //

function deleteNutrRow(user, tab, rowID, nutrient, yesterday) {
    $.ajax({
        url: `/reports/nutr/${user}/${tab}/${nutrient}?yesterday=${yesterday}&row_id=${rowID}`,
        type: 'DELETE',
        success: function (res) {
            $(`#nav-${tab} .${nutrient} .block-table table.block-rows`).DataTable().ajax.reload();
            updateCaloriesGot(user, yesterday);
        },
        error: function(res) {
            console.log(`Delete ${tab} ${nutrient} table row error`)
        }
    });
}
async function onNutrRowDelete(user, tab, rowID, nutrient, yesterday) {
    deleteNutrRow(user, tab, rowID, nutrient, yesterday);
}

function deleteJunkRow(user, rowID, yesterday) {
    $.ajax({
        url: `/reports/non-nutr/junk/${user}?yesterday=${yesterday}&row_id=${rowID}`,
        type: 'DELETE',
        success: function (res) {
            $(`div.junk table`).DataTable().ajax.reload();
            updateCaloriesGot(user, yesterday);
        },
        error: function(res) {
            console.log(`Delete ${tab} ${nutrient} table row error`)
        }
    });
}
async function onJunkRowDelete(user, rowID, yesterday) {
    deleteJunkRow(user, rowID, yesterday);
}

// __________________________ Main .ready script ___________________________________ //

const createSelector = (nutrient) => {
    let selector = $('<select>');

    $.get(`/meals/${nutrient}`)
    .done(function(res) {
        $.each(res, function(i, item) {
            selector.append($('<option>', {
                value: item._id,
                text : item.name
            }));
        });
    })
    .fail(function() { console.log(`Get ${nutrient} select options error`) });

    return selector;
};

$(document).ready(function() {

    // - - - - - - - - - - Functions used below - - - - - - - - - - - - -

    const createHeaderLinks = (res, yesterday) => {
        let html = '';

        let linkID = 'yesterdayLink';
        if (yesterday)
            html = `Отчёт за вчера (${res.yesterday})   |   <a href="${origin}/?user=${user}">Отчёт за сегодня (${res.today})</a>`;
        else
            html = `<a id="${linkID}" href="${origin}?user=${user}&yesterday=1">Отчёт за вчера (${res.yesterday})</a>   |   Отчёт за сегодня (${res.today})`;
        $('header div.links').html(html);

        if (!(res.yesterdayExists)) $(`#${linkID}`).addClass('disabled').append(' отсутствует');
    };

    const insertTabs = (res) => {

        const selectors = {
            proteins: createSelector('proteins'),
            fats: createSelector('fats'),
            carbons: createSelector('carbons'),
        };

        const initTab = (tab) => {
            $(`#nav-${tab}-tab`).one('click', function() {
                initTable(tab, 'carbons', yesterday, selectors.carbons, 'Углеводы');
                initTable(tab, 'proteins', yesterday, selectors.proteins, 'Белки');
                initTable(tab, 'fats', yesterday, selectors.fats, 'Жиры');
            });
        };

        // - - - - - - - - - - - - - - Init Tabs - - - - - - - - - - - - - - - - -

        let tab;
        const cssInvisible = 'invisible';
        switch(res.mealsPerDay) {

            // ATTENTION: 'break' statements ARE NOT missed here
            // it's how it works :)
            case 5:
                tab = 'lunch2';
                initTab(tab);
                $(`#nav-${tab}-tab`).removeClass(cssInvisible);
                $(`#nav-${tab}-tab`).append(` (${res.caloriesPerTabs.lunch2} кал)`);

            case 4:
                tab = 'lunch1';
                initTab(tab);
                $(`#nav-${tab}-tab`).removeClass(cssInvisible);
                $(`#nav-${tab}-tab`).append(` (${res.caloriesPerTabs.lunch1} кал)`);

            case 3:
                tab = 'breakfast';
                initTab(tab);
                $(`#nav-${tab}-tab`).removeClass(cssInvisible);
                $(`#nav-${tab}-tab`).append(` (${res.caloriesPerTabs.breakfast} кал)`);

                tab = 'dinner';
                initTab(tab);
                $(`#nav-${tab}-tab`).removeClass(cssInvisible);
                $(`#nav-${tab}-tab`).append(` (${res.caloriesPerTabs.dinner} кал)`);

                tab = 'supper';
                initTab(tab);
                $(`#nav-${tab}-tab`).removeClass(cssInvisible);
                $(`#nav-${tab}-tab`).append(` (${res.caloriesPerTabs.supper} кал)`);
        }
    };

    // - - - - - - - - - - - - - - - - Call all the funcs - - - - - - - - - - - - - - - - - - - - -

    // get user data
    $.get(`/data/${user}?yesterday=${yesterday}`)
    .done(function(res) {

        createHeaderLinks(res, yesterday);
        insertTabs(res);

        // fill vegetables input table
        getVegetablesInput();

        // create junk table and its selectors
        initJunkTable();

        // fill header calories-target
        $('header div.calories div.target').html('/' + res.caloriesTarget);
    })
    .fail(function() { });

    updateCaloriesGot(user, yesterday);

    // set send-report button onclick
    $('#send-report').on('click', function() {
        $.get(`/send-report/${user}?yesterday=${yesterday}`)
        .done(function(res) {} )
        .fail(function() { console.error('send to tg') } );
    });
});

// ___________________________ DataTable Create funcs ______________________________________ //

function setButtonOnclick(tab, nutrient) {

    $(`#nav-${tab} .${nutrient} button`).on('click', function() {

        let id = $(`#nav-${tab} .${nutrient} select`).val();
        let weight = $(`#nav-${tab} .${nutrient} input.weight`).val();

        if (weight == '') return;

        $.post(`/reports/nutr/${user}/${tab}?yesterday=${yesterday}`, { meal_id: id, meal_weight: weight })
        .done(function(res) {
            $(`#nav-${tab} .${nutrient} .block-table table.block-rows`).DataTable().ajax.reload();
            updateCaloriesGot(user, yesterday);
        })
        .fail(function() { console.log(`Error: post to /reports/${user}/${tab}`) });
    });
}

const createTable = (name) => {
    const table = $('<div>', { 'class': 'block-table col-9' });

    table.append($('<h6>', { 'class': 'block-type-header', 'text': `${name}` }))
    .append($('<table>', { 'class': 'block-rows' }));

    return table;
}

const createBlock = (formsNames, nutrient, name) => {

        const form = $('<div>', { 'class': 'form col-3 align-self-center' });
        for (let name of formsNames) {
            const div = $('<div>', { 'class': `${name}` });
            const input = $('<input>', { 'class': 'weight', 'type': 'number', 'min': '1', 'placeholder': 'Масса' });

            div.append($('<label>', { 'class': 'select-label' }))
            .append($('<label>').append(input))
            .append($('<button>', { 'text': 'Добавить' }));

            form.append(div);
        }
        
        const table = createTable(name);

        const block = $('<div>', { 'class': `${nutrient} block row` });
        block.append(form).append(table);

        return block;
    };

function initTable(tab, nutrient, yesterday, selector, name) {

    const block = createBlock([nutrient], nutrient, name); // 1 - number of forms
    $(`#nav-${tab}`).append(block);

    // add selector to the table form
    $(`#nav-${tab} .${nutrient} .form label.select-label`).append(selector);

    // set button click script (add meal)
    setButtonOnclick(tab, nutrient);

    $(`#nav-${tab} .${nutrient} .block-table table.block-rows`).DataTable({

        language: {
            url: "//cdn.datatables.net/plug-ins/1.10.19/i18n/Russian.json"
        },

        paging: false,
        info: false,
        searching: false,
        ordering: false,

        ajax: `${origin}/reports/nutr/${user}/${tab}/${nutrient}?yesterday=${yesterday}`,

        columns: [
            {
                //title: "Продукт",
                data: "name",
                render: function(data, type, row, metat) {
                    return `<span>${data} <i class="fa-solid fa-circle-info" title="${row.title}"></i> </span>`
                },
            },
            {
                data: "weight.eaten",
                render: function(data, type, row, meta) {
                    return `<input type="number" min="1" value="${data}" id="${row._id}"
                        onblur="onNutrRowUpdate('${user}', '${tab}', '${row._id}', '${nutrient}', '${yesterday}')" />`;
                }
            },
            {
                data: "weight.toEat",
                render: function(data, type, row, meta) { 
                    let res;
                    if (Number(data) < 0) {
                        res = '<i class="fa-solid fa-arrow-down color-red"></i> ' + Number(data) * -1;
                    } 
                    else if (Number(data) > 0) {
                        res = '<i class="fa-solid fa-arrow-up color-green"></i> ' + data;
                    }
                    else {
                        res = data;
                    }

                    return `<span>${res}</span>`;
                }
            },
            {
                data: null,
                render: function(data, type, row, meta) {
                    return `
                    <a href="javascript:;"
                        class="delete-icon"
                        onclick="onNutrRowDelete('${user}', '${tab}', '${row._id}', '${nutrient}', '${yesterday}')"
                    >
                        <i class="fa-solid fa-trash-can"></i>
                    </a>`;
                }
            },
        ]
    });  
}

const initJunkTable = () => {

    const groups = ['alcohol', 'soda', 'sweets'];

    const block = createBlock(groups, 'junk', 'Вредная еда'); // 3 - number of forms
    $('main').append(block);

    // add selectors to the table forms
    for (let group of groups) {
        $(`div.junk .form .${group} label.select-label`).append(createSelector(group));

        $(`div.junk .form .${group} button`).on('click', function() {
            const id = $(`div.junk .form .${group} select`).val();
            const weight = $(`div.junk .form .${group} input`).val();

            if (weight == '') return;

            $.post(`/reports/non-nutr/junk/${user}?yesterday=${yesterday}`, { meal_id: id, meal_weight: weight })
            .done(function(res) {
                $(`div.junk .block-table table`).DataTable().ajax.reload();
                updateCaloriesGot(user, yesterday);
            })
            .fail(function() { console.log(`Error: post to /reports/non-nutr/junk/${group}`) });
        });
    }


    // create the table itself
    $('div.junk table').DataTable({

        language: {
            url: "//cdn.datatables.net/plug-ins/1.10.19/i18n/Russian.json"
        },

        paging: false,
        info: false,
        searching: false,
        ordering: false,

        ajax: `${origin}/reports/non-nutr/junk/${user}?yesterday=${yesterday}`,

        columns: [
            {
                data: "name",
            },
            {
                data: "weight.eaten",
                render: function(data, type, row, meta) {
                    return `<input type="number" min="1" value="${data}" id="${row._id}"
                        onblur="onJunkRowUpdate('${user}', '${row._id}', '${yesterday}')" />`;
                }
            },
            {
                data: null,
                render: function(data, type, row, meta) {
                    return `
                    <a href="javascript:;"
                        class="delete-icon"
                        onclick="onJunkRowDelete('${user}', '${row._id}', '${yesterday}')"
                    >
                        <i class="fa-solid fa-trash-can"></i>
                    </a>`;
                }
            },
        ]
    });
};