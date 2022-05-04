function getQueryParam(param, url) {

    let href = url;
    // this is an expression to get query strings
    let regexp = new RegExp( '[?&]' + param + '=([^&#]*)', 'i' );
    let qString = regexp.exec(href);

    return qString ? qString[1] : null;
}

// G L O B A L S
const url = new URL(location.href).href;

const user = getQueryParam('user', url);
const yesterday = Number(getQueryParam('yesterday', url));
const yestQuery = `?yesterday=${yesterday}`;

const origin = new URL(location.href).origin;

// - - - - - - - - - - - - - - - - - - - - - - //

// object keeping DOM selectors
const dom = {
    header: {
        calories: {
            when: '.header-content .calories .when',
            got: '.header-content .calories .got',
            target: '.header-content .calories .target',
        },
        name: '.name',
        links: {
            span: {
                today: '.user-data-links .today-link',
                yesterday: '.user-data-links .yesterday-link',
            },
            a: {
                today: '.user-data-links .today-link a',
                yesterday: '.user-data-links .yesterday-link a',
            },
        },
        navtabs: [
            '#nav-breakfast-tab', 
            '#nav-lunch1-tab', 
            '#nav-dinner-tab',
            '#nav-lunch2-tab',
            '#nav-supper-tab',
        ],
    },

    main: {
        vegetables: {
            eaten: '#eatenVegetablesWeight',
            toEat: '#toEatVegetablesWeight',
        },
        tabs: [
            '#nav-breakfast',
            '#nav-lunch1',
            '#nav-dinner',
            '#nav-lunch2',
            '#nav-supper',
        ],
        junk: '.junk-content',
    },
}

// __________________________________________ //

// update calories GOT bar in header
function updateHeaderCaloriesBar() {

    $.get(`${origin}/header/calories/got/${user}` + yestQuery)
    .done(function(response) {
        $(dom.header.calories.got).html(response.value);

        const calsTarget = Number($(dom.header.calories.target).text());
        if (response.value > calsTarget)
            $(dom.header.calories.got).addClass('color-red');
        else 
            $(dom.header.calories.got).removeClass('color-red');
    })
    .fail(function() { console.error('updating calories got bar faled') });
};

// - - - - - - - - - - - - - - - - - //

// get the header content on loading
function requestHeader() {

    $.get(`${origin}/data/${user}` + yestQuery)
        .done(function(response) {

            // insert user name
            $(dom.header.name).html(response.userData.name);

            // insert common calories target
            $(dom.header.calories.target).html(response.caloriesTarget.common);

            // insert day in calories bar
            const day = yesterday ? 'вчера' : 'сегодня';
            $(dom.header.calories.when).html(day);

            // insert reports links
            $(dom.header.links.a.today).append(response.date.today);
            // if yesterday report exists
            if (response.date.yesterday.exists) {
                // append yesterday date
                $(dom.header.links.a.yesterday).append(response.date.yesterday.date);

                // if cur page is for yesterday
                if (yesterday) {
                    // yesterday btn is disabled
                    $(dom.header.links.span.yesterday).addClass('disabled');
                    // today link
                    $(dom.header.links.a.today).attr('href', `${origin}?user=${user}`);
                }
                // if cur page is for today
                else {
                    // today btn is disabled
                    $(dom.header.links.span.today).addClass('disabled');
                    // yesterday link
                    $(dom.header.links.a.yesterday).attr('href', `${origin}?user=${user}&yesterday=1`);
                }
            }
            // if there is no report for yesterday
            else {
                // mark yesterday btn
                $(dom.header.links.a.yesterday).append('отсутствует');
                // make yesterday btn disabled
                $(dom.header.links.span.yesterday).addClass('disabled');
            }

            // make the necessary tabs visible
            switch (response.userData.mealsPerDay) {
                // the 'break' statements ARE NOT missed here
                // that's the algorithm :)
                case 5:
                    // 5 meals per day means all the tabs should be on
                    $(dom.header.navtabs[3]).removeClass('invisible');

                case 4:
                    // 4 meals per day means 'lunch2' tab is off
                    $(dom.header.navtabs[1]).removeClass('invisible');

                case 3:
                    // 3 meals per day means 'lunch 1-2' tabs are off
                    $(dom.header.navtabs[0]).removeClass('invisible');
                    $(dom.header.navtabs[2]).removeClass('invisible');
                    $(dom.header.navtabs[4]).removeClass('invisible');
            }
            
            // update calories which are already eaten
            updateHeaderCaloriesBar();
        })
        .fail(function() { log.error('getting & setting the header content failed') });
}

// ________________________________________________________________ //

// block header template
const makeHeader = (text) => {
    return `<div class="block-header col-12">
                <div class="row">
                    <div class="col-3 offset-1 mb-2">
                        <span class="h">${text}:</span>
                        <span class="calories-got">XXX</span> из <span class="calories-target">YYY</span>
                    </div>
                </div>
            </div>`;
}

// table template
const makeTable = (tab) => { 
    return `<div class="col-12 col-md-9 mt-2 m-sm-0">
                <div class="block-table">
                    <table data-tab="${tab}">
                    </table>
                </div>
            </div>`;
};

// form template
const makeForm = (tab) => {
    return `<div class="col-12 col-md-3">
                <form class="block-form" onsubmit="return false;">

                    <div class="form-header">Добавить продукт<i class="fa-solid fa-pot-food"></i></div>
                    <div class="form-tip">Выбери и укажи его вес</div>

                    <div class="form-elements">
                        <div class="select-div">
                            <select>
                            </select>
                        </div>

                        <div>
                            <input class="weight" type="number" min="1" placeholder="Масса пищи.." />
                        </div>

                        <button data-tab="${tab}">Добавить</button>
                    </div>

                </form>
            </div>`;
};

/**
 * [make & insert block with the form and its table]
 * @param  string               target [CSS/JQ selector where to insert the block]
 * @param  object{string x2}    group  [latin & cyrillic strings for the block]
 * @param  object{string x4}    ajax   [URLs for the tables GET, buttons POST, tables DELETE and tables PUT]
 */
function makeBlock(target, group, ajax, toEatVisible) {

    const block = 
        `<div class="${group.latin} block row mb-5">
            ${makeHeader(group.cyrillic)}
            ${makeForm(target)}
            ${makeTable(target)}
        </div>`;

    $(target).append(block);

    // current block <select>
    const select = $(`${target} .${group.latin} select`);
    // current block <input>
    const input =  $(`${target} .${group.latin} input`);
    // current block <button>
    const button = $(`${target} .${group.latin} button`);
    // current block <table>
    const table =  $(`${target} .${group.latin} table`);

    // - - - - - - - - - - //

    // fill the <select>
    $.get(`${origin}/meals/${group.latin}`)
        .done(function(response) {
            for (let food of response) {
                select.append(
                    $('<option>', { text: food.name, value: food._id })
                );
            }
        })
        .fail(function() { log.error(`requesting ${group} meals failed`) });
    
    // set onclick button script
    button.on('click', function() {

        const id = select.val();
        const weight = input.val();
        if (!weight) return;

        $.post(ajax.post, { meal_id: id, meal_weight: weight })
        .done(function(res) {
            input.val('').blur();
            table.DataTable().ajax.reload();
            updateHeaderCaloriesBar();
            updateTabCalories(target, 'got');
        })
        .fail(function() { console.error(`post to ${ajax.post} failed`) });
    });

    // - - - - - - - - - - - //

    
    // make the <table>
    table.DataTable({

        language: {
            url: "//cdn.datatables.net/plug-ins/1.10.19/i18n/Russian.json"
        },

        paging: false,
        info: false,
        searching: false,
        ordering: false,

        ajax: ajax.get,
        processing: true,

        columns: [
            {
                title: "Продукт",
                data: "name",
                render: function(data, type, row, meta) {
                            const icon = `<i class="fa-solid fa-circle-info color-green" title="${row.title}"></i>`;
                            const field = row.title ? `<span>${data} ${icon}</span>` : `<span>${data}</span>`;
                            return field;
                },
            },
            {
                title: "Съедено, г",
                data: "weight.eaten",
                render: function(data, type, row, meta) {
                    return `<input 
                                type="number" 
                                min="1" 
                                maxlength="3" 
                                value="${data}" 
                                id="${row._id}" 
                                data-tab="${target}"
                                onblur="onInputBlur('${row._id}', '${ajax.put}', '${table.attr('id')}')"
                            />`;
                }
            },
            {
                title: "Осталось съесть, г",
                data: "weight.toEat",
                visible: toEatVisible,
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

                    return `${res}`;
                }
            },
            {
                data: null,
                render: function(data, type, row, meta) {
                    return `<a href="javascript:;"
                                class="delete-icon"
                                onclick="onRowDelete('${row._id}', '${ajax.delete}', '${table.attr('id')}')"
                            >
                                <i class="fa-solid fa-trash-can color-red"></i>
                            </a>`;
                }
            },
        ]
    });
}

// - - - - - - - - - - - - - - - - - - //

// tabs groups array
const tabGroups = {
    latin: ['proteins', 'fats', 'carbons'],
    cyrillic: ['Белки', 'Жиры', 'Углеводы'],
};

// get the tab calories data, depending on type (got/target)
function updateTabCalories(tabID, type) {
    $.get(`${origin}/tab/calories/${type}/${user}/${tabID.substring(5)}` + yestQuery)
        .done(function(response) {

            const tabCaloriesGot = $(`${tabID} .tab-header-content .calories-got`);
            const tabCaloriesTarget = $(`${tabID} .tab-header-content .calories-target`);

            // insert value to the tab calories bar
            if (type == 'got') tabCaloriesGot.html(response.tab);
            else tabCaloriesTarget.html(response.tab);

            if (Number(tabCaloriesGot.text()) > Number(tabCaloriesTarget.text())) {
                tabCaloriesGot.addClass('color-red');
            }
            else {
                tabCaloriesGot.removeClass('color-red');
            }

            // - - - - - - - - //

            // shortcut for span
            const getSpan = (tab, group, type) => $(`${tab} .${group} .calories-${type}`);

            // insert values to the blocks calories bars
            for (let i in tabGroups.latin) {

                const span = getSpan(tabID, tabGroups.latin[i], type);
                span.html(response.groups[i]);

                const gotSpan = getSpan(tabID, tabGroups.latin[i], 'got');
                const targetSpan = getSpan(tabID, tabGroups.latin[i], 'target');

                // check for coloring
                if (Number(gotSpan.text()) > Number(targetSpan.text())) {
                    gotSpan.addClass('color-red');
                }
                else {
                    gotSpan.removeClass('color-red');
                }
            }
        })
        .fail(function() { console.error(`updating tab ${tabID} calories ${type} failed`) });
}
 
function makeTabs() {
    for (let tab of dom.main.tabs) {

        // each tab = header calories bar + 3 blocks of each tab group
         
        // getting tab name from the button in navtab
        const tabName = $(`${tab}-tab`).text().toLowerCase();

        // make header calories bar
        const header = `<div class="tab-header row text-center mb-4">
                            <div class="col-12">
                                калорий за ${tabName}:
                                <div class="tab-header-content">
                                    <span class="calories-got">XXX</span> из <span class="calories-target">YYY</span>
                                </div
                            </div>
                        </div>`;

        $(tab).append(header);

        // - - - - - - - - - - - - - - - - - - //

        // get the calories data
        updateTabCalories(tab, 'target');
        updateTabCalories(tab, 'got');

        // to eat table column should't be visible in junkfood tables
        const toEatTableColumnVisible = true;

        // make 3 block per each tab
        for (let i in tabGroups.latin) {

            const ajax = {
                get:    `${origin}/reports/tabs/${user}/${tab.substring(5)}/${tabGroups.latin[i]}`  + yestQuery,
                post:   `${origin}/reports/tabs/${user}/${tab.substring(5)}`                        + yestQuery,
                put:    `${origin}/reports/tabs/${user}/${tab.substring(5)}/${tabGroups.latin[i]}`  + yestQuery,
                delete: `${origin}/reports/tabs/${user}/${tab.substring(5)}/${tabGroups.latin[i]}`  + yestQuery,
            };

            makeBlock(
                tab, 
                { latin: tabGroups.latin[i], cyrillic: tabGroups.cyrillic[i] }, 
                ajax,
                toEatTableColumnVisible
            );
        }
    }
}

function makeJunk() {

    // make header calories bar
    const header = `<div class="tab-header row text-center mb-4">
                        <div class="col-12">
                            калорий за счёт нерекомендованных продуктов:
                            <div class="tab-header-content">
                                <span class="calories-got">XXX</span>
                            </div
                        </div>
                    </div>`;

    $(dom.main.junk).append(header);

    // junk groups array
    const junkGroups = { 
        latin: ['alcohol', 'soda', 'sweets'],
        cyrillic: ['Алкоголь', 'Газировка и соки', 'Сладости'],
    };

    const toEatTableColumnVisible = false;

    // make junk blocks
    for (let i in junkGroups.latin) {

        const ajax = {
            get:    `${origin}/reports/junk/${user}/${junkGroups.latin[i]}` + yestQuery,
            post:   `${origin}/reports/junk/${user}` + yestQuery,
            put:    `${origin}/reports/junk/${user}` + yestQuery,
            delete: `${origin}/reports/junk/${user}` + yestQuery,
        };

        makeBlock(
            dom.main.junk,
            { latin: junkGroups.latin[i], cyrillic: junkGroups.cyrillic[i] },
            ajax,
            toEatTableColumnVisible
        );
    }
}

// ____________________________________________________________________ //

function initVegetablesBlock() {

    const updateVegetablesBlock = () => {

        $.get(`/reports/vegetables/${user}` + yestQuery)
        .done(function(response) {

            $(dom.main.vegetables.eaten).val(response.eatenWeight);

            const arrow = '<i class="fa-solid fa-arrow-up color-green"></i>';
            const check = '<i class="fa-solid fa-check color-green"></i>';

            const toEat = Number(response.toEatWeight) > 0 ? arrow + response.toEatWeight : check;

            $('div.vegetables #toEatVegetablesWeight').html(toEat);
        })
        .fail(function() { console.error('updating vegetables block failed') });
    };

    // eaten vegetables weight changed
    $(dom.main.vegetables.eaten).on('blur', function() {

        const weight = $(dom.main.vegetables.eaten).val();

        $.ajax({
            url: `/reports/vegetables/${user}` + yestQuery + `&weight=${weight}`,
            type: 'PUT',
            success: function () {
                updateVegetablesBlock();
            },
            error: function(res) {
                console.error('putting new vegetables data failed');
            }
        });
    });

    // calling the func to get the data on document loading
    updateVegetablesBlock();
}

// ______________________________________________________________


$(document).ready(function() {

    // request for the header content
    requestHeader();

    // init vegetables block
    initVegetablesBlock();    

    // make the main content - tabs, block, its forms & tables
    makeTabs();
    makeJunk();
});




function onInputBlur(inputID, ajax, tableID) {

    const input = $(`#${inputID}`);
    const table = $(`#${tableID}`);

    const weight = input.val();

    $.ajax({
        url: ajax + `&row_id=${inputID}` + `&row_weight=${weight}`,
        type: 'PUT',
        success: function (res) {
            table.DataTable().ajax.reload();
            updateHeaderCaloriesBar();
            updateTabCalories(input.data('tab'), 'got');
        },
        error: function(res) {
            console.error(`onblur of input ${inputID} failed`);
        }
    });
}

function onRowDelete(rowID, ajax, tableID) {

    const table = $(`#${tableID}`);

    $.ajax({
        url: ajax + `&row_id=${rowID}`,
        type: 'DELETE',
        success: function (res) {
            table.DataTable().ajax.reload();
            updateHeaderCaloriesBar();
            updateTabCalories(table.data('tab'), 'got');
        },
        error: function(res) {
            console.log(`ondelete of row ${rowID} failed`)
        }
    });
}