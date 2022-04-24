
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
        $('div.vegetables #toEatVegetablesWeight').html(res.toEatWeight);
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
            $(`#nav-${tab} .${nutrient} table`).DataTable().ajax.reload();
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
            $(`#nav-${tab} .${nutrient} table`).DataTable().ajax.reload();
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

        const selectors = {
            proteins: createSelector('proteins'),
            fats: createSelector('fats'),
            carbons: createSelector('carbons'),
        };


        const initTab = (tab) => {
            $(`#nav-${tab}-tab`).one('click', function() {
                initTable(tab, 'proteins', yesterday, selectors.proteins);
                initTable(tab, 'fats', yesterday, selectors.fats);
                initTable(tab, 'carbons', yesterday, selectors.carbons);
            });
        };

        // - - - - - - - - - - - - - - Init Tabs - - - - - - - - - - - - - - - - -

        let tab;
        switch(res.mealsPerDay) {

            // ATTENTION: 'break' statements ARE NOT missed here
            // it's how it works :)
            case 5:
                tab = 'lunch2';
                initTab(tab);
                $(`#nav-${tab}-tab`).removeClass('disabled');
                $(`#nav-${tab}-tab`).append(` (${res.caloriesPerTabs.lunch2} кал)`);

            case 4:
                tab = 'lunch1';
                initTab(tab);
                $(`#nav-${tab}-tab`).removeClass('disabled');
                $(`#nav-${tab}-tab`).append(` (${res.caloriesPerTabs.lunch1} кал)`);

            case 3:
                tab = 'breakfast';
                initTab(tab);
                $(`#nav-${tab}-tab`).removeClass('disabled');
                $(`#nav-${tab}-tab`).append(` (${res.caloriesPerTabs.breakfast} кал)`);

                tab = 'dinner';
                initTab(tab);
                $(`#nav-${tab}-tab`).removeClass('disabled');
                $(`#nav-${tab}-tab`).append(` (${res.caloriesPerTabs.dinner} кал)`);

                tab = 'supper';
                initTab(tab);
                $(`#nav-${tab}-tab`).removeClass('disabled');
                $(`#nav-${tab}-tab`).append(` (${res.caloriesPerTabs.supper} кал)`);
        }
    };

    const initJunkTable = () => {

        // create the table itself
        $('div.junk table').DataTable({

            language: {
                url: "//cdn.datatables.net/plug-ins/1.10.19/i18n/Russian.json"
            },

            paging: false,
            info: false,
            searching: false,

            ajax: `${origin}/reports/non-nutr/junk/${user}?yesterday=${yesterday}`,

            columns: [
                {
                    title: "Продукт",
                    data: "name",
                    orderable: false,
                },
                {
                    title: "Съедено, г",
                    data: "weight.eaten",
                    orderable: false,
                    render: function(data, type, row, meta) {
                        return `<input type="number" min="1" value="${data}" id="${row._id}"
                            onblur="onJunkRowUpdate('${user}', '${row._id}', '${yesterday}')" />`;
                    }
                },
                {
                    title: "",
                    orderable: false,
                    data: null,
                    render: function(data, type, row, meta) {
                        return `
                        <a href="javascript:;"
                            onclick="onJunkRowDelete('${user}', '${row._id}', '${yesterday}')"
                        >
                            delete
                        </a>`;
                    }
                },
            ]
        });

        const initForm = async (group) => {

            // fill the selector
            const selector = $(`div.junk .${group} select`);
            $.get(`/meals/${group}`)
            .done(function(res) {
                $.each(res, function(i, item) {
                    selector.append($('<option>', {
                        value: item._id,
                        text : item.name
                    }));
                });
            })
            .fail(function() { console.log(`Get ${nutrient} select options error`) });

            // set onclick button script
            $(`div.junk .${group} button`).on('click', function() {

                const id = $(`div.junk .${group} select`).val();
                const weight = $(`div.junk .${group} input`).val();

                $.post(`/reports/non-nutr/junk/${user}?yesterday=${yesterday}`, { meal_id: id, meal_weight: weight })
                .done(function(res) {
                    $(`div.junk table`).DataTable().ajax.reload();
                    updateCaloriesGot(user, yesterday);
                })
                .fail(function() { console.log(`Error: post to /reports/non-nutr/junk/${group}`) });
            });
        };

        // fill the selectors
        initForm('alcohol');
        initForm('soda');
        initForm('sweets');
        
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
});

// ___________________________ DataTable Create funcs ______________________________________ //

function setButtonOnclick(tab, nutrient) {

    $(`#nav-${tab} .${nutrient} button`).on('click', function() {

        let id = $(`#nav-${tab} .${nutrient} select`).val();
        let weight = $(`#nav-${tab} .${nutrient} input.weight`).val();

        $.post(`/reports/nutr/${user}/${tab}?yesterday=${yesterday}`, { meal_id: id, meal_weight: weight })
        .done(function(res) {
            $(`#nav-${tab} .${nutrient} table`).DataTable().ajax.reload();
            updateCaloriesGot(user, yesterday);
        })
        .fail(function() { console.log(`Error: post to /reports/${user}/${tab}`) });
    });
}

function initTable(tab, nutrient, yesterday, selector) {

    $(`#nav-${tab} .${nutrient} table`).DataTable({

        language: {
            url: "//cdn.datatables.net/plug-ins/1.10.19/i18n/Russian.json"
        },

        paging: false,
        info: false,
        searching: false,

        ajax: `${origin}/reports/nutr/${user}/${tab}/${nutrient}?yesterday=${yesterday}`,

        columns: [
            {
                title: "Продукт",
                data: "name",
                orderable: false,
            },
            {
                title: "Съедено, г",
                data: "weight.eaten",
                orderable: false,
                render: function(data, type, row, meta) {
                    return `<input type="number" min="1" value="${data}" id="${row._id}"
                        onblur="onNutrRowUpdate('${user}', '${tab}', '${row._id}', '${nutrient}', '${yesterday}')" />`;
                }
            },
            {
                title: "Осталось съесть, г",
                data: "weight.toEat",
                orderable: false,
                render: function(data, type, row, meta) { return data }
            },
            {
                title: "",
                orderable: false,
                data: null,
                render: function(data, type, row, meta) {
                    return `
                    <a href="javascript:;"
                        onclick="onNutrRowDelete('${user}', '${tab}', '${row._id}', '${nutrient}', '${yesterday}')"
                    >
                        delete
                    </a>`;
                }
            },
        ]
    });

    // add selector to the table form
    $(`#nav-${tab} .${nutrient} label.select-label`).append(selector);
    // set button click script (add meal)
    setButtonOnclick(tab, nutrient);
}
