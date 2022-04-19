
// ______________________________ get query object of the URL _____________________________________

function getQueryParam(param, url) {

    let href = url;
    // this is an expression to get query strings
    let regexp = new RegExp( '[?&]' + param + '=([^&#]*)', 'i' );
    let qString = regexp.exec(href);

    return qString ? qString[1] : null;
}

// globals
const protocol = 'http://';
const host = 'localhost:8080';
const origin = protocol + host;

const url = new URL(location.href).href;

const user = getQueryParam('id', url);
const yesterday = Number(getQueryParam('yesterday', url));

// _______________________________ delete row from the table ________________________________________

async function deleteRow(user, yesterday, rowID, feeding) {

    await $.get(`/api/reports/del/${user}/${feeding}?yesterday=${yesterday}&row_id='${rowID}'`)
    .done(function(res) {
        $(`#${feeding}-table`).DataTable().ajax.reload();
    })
    .fail(function () { });
}

// _______________________________ edit row after weigth changing ___________________________________

async function editRow(user, yesterday, rowID, feeding) {

    let newWeight = $(`#${rowID}`).val();

    await $.get(`/api/reports/put/${user}/${feeding}?yesterday=${yesterday}&row_id='${rowID}'&row_weight=${newWeight}`)
    .done(function(res) {
        $(`#${feeding}-table`).DataTable().ajax.reload();
    })
    .fail(function () { });
}

// _______________________________ update header calories ____________________________________

async function updateCaloriesGot(origin, user, yesterday) {

    await $.get(`/calories-got/${user}/${yesterday}`)
    .done(function(res) {
        $('header div.calories div.got').html(res.caloriesGot);
    })
    .fail(function() { });
}

// _________________________________ "edit row" event handler ___________________________________

async function onRowEdit(user, yesterday, rowID, feeding, origin) {
    await editRow(user, yesterday, rowID, feeding);
    updateHeaderCalories(origin, user, yesterday);
}
// "delete row" event handler
async function onRowDelete(user, yesterday, rowID, feeding, origin) {
    await deleteRow(user, yesterday, rowID, feeding);
    updateHeaderCalories(origin, user, yesterday);
}

// ____________________________ init datatables && "add meal" button _____________________________

function getTabContent(tab) {

    // get selectors content
    $.get(`/meals`)
    .done(function(res) {
        const proteinsSelect = $(`#nav-${tab} .proteins select`);

        $.each(res, function(i, item) {
            proteinsSelect.append($('<option>', { 
                value: item._id,
                text : item.name 
            }));
        });
    })
    .fail(function() { console.log(`Get ${tab} select data error`) });
}

function setButtonOnclick(tab) {

    $(document).ready(function() {
        $(`#nav-${tab} .proteins button`).on('click', function() {

            let id = $(`#nav-${tab} .proteins select`).val();
            let weight = $(`#nav-${tab} .proteins input.weight`).val();

            $.post(`/reports/${user}/${tab}`, { id: id, weight: weight })
            .done(function(res) {
                $(`#nav-${tab} .proteins table`).DataTable().ajax().reload();
            })
            .fail(function() { console.log(`Error: post to /reports/${user}/${tab}`) });
        });
    });
}


// main .ready script
$(document).ready(function() {

    let mealsPerDay;

    // get user data
    $.get(`/data/${user}`)
    .done(function(res) {

        console.log(res);

        // get mealsPerDay
        mealsPerDay = res.mealsPerDay;

        // insert links
        let html = '';
        let linkID = 'yesterdayLink';
        if (yesterday) 
            html = `Отчёт за вчера (${res.yesterday})   |   <a href="${origin}/?id=${user}">Отчёт за сегодня (${res.today})</a>`;
        else 
            html = `<a id="${linkID}" href="${origin}?id=${user}&yesterday=1">Отчёт за вчера (${res.yesterday})</a>   |   Отчёт за сегодня (${res.today})`;
        $('header div.links').html(html);

        if (!(res.yesterdayExists)) $(`#${linkID}`).addClass('disabled').append(' отсутствует');
        /////////////////////////////////

        // fill header calories-target
        $('header div.calories div.target').html('/' + res.caloriesTarget);

        switch (mealsPerDay) {
            case 3: 
                $('#nav-lunch1-tab').addClass('disabled');
                $('#nav-lunch2-tab').addClass('disabled');
                break;

            case 4: 
                $('#nav-lunch2-tab').addClass('disabled');
                $('#nav-lunch1-tab').append(` (${res.caloriesPerTabs.lunch1} кал)`);
                break;

            case 5:
                $('#nav-lunch1-tab').append(` (${res.caloriesPerTabs.lunch1} кал)`);
                $('#nav-lunch2-tab').append(` (${res.caloriesPerTabs.lunch2} кал)`);
                break;
        }
        $('#nav-breakfast-tab').append(` (${res.caloriesPerTabs.breakfast} кал)`);
        $('#nav-dinner-tab').append(` (${res.caloriesPerTabs.dinner} кал)`);
        $('#nav-supper-tab').append(` (${res.caloriesPerTabs.supper} кал)`);
    })
    .fail(function() { });

    updateCaloriesGot(origin, user, yesterday);


    let tab = null;


    let bTab  = null; // breakfast tab
    let l1Tab = null; // launch 1 tab
    let dTab  = null; // dinner tab
    let l2Tab = null; // launch 2 tab
    let sTab  = null; // supper tab

    $('#nav-breakfast-tab').on('click', function() { 

        tab = 'breakfast'; 

        try {
            if (bTab == null) {
                bTab = true;

                $('#nav-breakfast .proteins table').DataTable({

                    language: {
                        url: "//cdn.datatables.net/plug-ins/1.10.19/i18n/Russian.json"
                    },

                    paging: false,
                    info: false,

                    ajax: `${origin}/reports/${user}/breakfast/proteins`,
            
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
                                return `<input type="number" min="1" value="${data}" id="${row._id}" onblur="onRowEdit('${user}', '${yesterday}', '${row._id}', 'breakfast', '${origin}')" />`;
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
                                <a href="javascript:;" onclick="onRowDelete('${user}', '${yesterday}', '${row._id}', 'breakfast', '${origin}')" >
                                    delete
                                </a>`;
                            }
                        },
                    ]
                });

                getTabContent(tab);
                setButtonOnclick(tab);
                
            }
        } catch (e) {
            console.log(e);
        }
    });

    
});
