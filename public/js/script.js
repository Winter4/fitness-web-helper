
// get query object of the URL
function getQueryParam(param, url) {

    let href = url;
    // this is an expression to get query strings
    let regexp = new RegExp( '[?&]' + param + '=([^&#]*)', 'i' );
    let qString = regexp.exec(href);

    return qString ? qString[1] : null;
}

// globals
const protocol = 'http://';
const host = 'localhost:5500';
const origin = protocol + host;

const url = new URL(location.href).href;

const userID = getQueryParam('id', url);
const yesterday = Number(getQueryParam('yesterday', url));

// ________________________________________________________________________________________

// delete row from the table
async function deleteRow(userID, yesterday, rowID, feeding) {

    await $.get(`/api/reports/del/${userID}/${feeding}?yesterday=${yesterday}&row_id='${rowID}'`)
    .done(function (data) {
        $(`#${feeding}-table`).DataTable().ajax.reload();
    })
    .fail(function () { });
}
// edit row after weigth changing
async function editRow(userID, yesterday, rowID, feeding) {

    let newWeight = $(`#${rowID}`).val();

    await $.get(`/api/reports/put/${userID}/${feeding}?yesterday=${yesterday}&row_id='${rowID}'&row_weight=${newWeight}`)
    .done(function (data) {
        $(`#${feeding}-table`).DataTable().ajax.reload();
    })
    .fail(function () { });
}

// ________________________________________________________________________________________

// update header calories value
async function updateHeaderCalories(origin, userID, yesterday) {

    let response = await fetch(`${origin}/header/calories/${userID}/${yesterday}`);
    let data = await response.json();

    $('header div.calories').html(`<br>Калории: ${data.caloriesEaten}/${data.caloriesToEat}`);
}
// set header links (yesterday/today report)
$(document).ready(async function() {

    let response = await fetch(`${origin}/header/date`);
    let date = await response.json();

    let html = '';
    if (yesterday) 
        html = `Отчёт за вчера (${date.yesterday})   |   <a href="${origin}/?id=${userID}">Отчёт за сегодня (${date.today})</a>`;
    else 
        html = `<a href="${origin}?id=${userID}&yesterday=1">Отчёт за вчера (${date.yesterday})</a>   |   Отчёт за сегодня (${date.today})`;

    $('header div.links').html(html);

    updateHeaderCalories(origin, userID, yesterday);
});

// ________________________________________________________________________________________

// "edit row" event handler
async function onRowEdit(userID, yesterday, rowID, feeding, origin) {
    await editRow(userID, yesterday, rowID, feeding);
    updateHeaderCalories(origin, userID, yesterday);
}
// "delete row" event handler
async function onRowDelete(userID, yesterday, rowID, feeding, origin) {
    await deleteRow(userID, yesterday, rowID, feeding);
    updateHeaderCalories(origin, userID, yesterday);
}

// ________________________________________________________________________________________

// get the meals list from DB
$(document).ready(async function() {
    try {
        let response = await fetch('http://localhost:5500/api/meals');
        let meals = await response.json();

        let list = document.getElementById('meals-list');
        for (meal of meals) {
            let option = document.createElement('option');
            option.value = meal._id;
            option.text = meal.name;
            list.appendChild(option);
        }
    } catch (e) {
        console.log(e);
    }
});

// ________________________________________________________________________________________

// init datatables && "add meal" button
$(document).ready(function() {

    let curFeeding = null;

    $('#add-meal-button').on('click', async function() {

        let selectedMeal = $('#meals-list').val();
        let weight = $('#meal-weight').val();

        let response = await fetch(`${origin}/api/reports/set/${userID}/${curFeeding}?yesterday=${yesterday}&meal_id=${selectedMeal}&weight=${weight}`);

        if (response.ok)  $(`#${curFeeding}-table`).DataTable().ajax.reload();

        updateHeaderCalories(origin, userID, yesterday);
    });

    let bTable = null;
    let dTable = null;
    let sTable = null;
    let l1Table = null;
    let l2Table = null;

    $('#nav-breakfast-tab').on('click', function() { 
        curFeeding = 'breakfast'; 

        if (bTable == null) {
            bTable = $('#breakfast-table').DataTable({

                paging: false,
                info: false,
        
                ajax: `${origin}/api/reports/get/${userID}/breakfast?yesterday=${yesterday}`,
        
                language: {
                    url: "//cdn.datatables.net/plug-ins/1.10.19/i18n/Russian.json"
                },
        
                columns: [
                {
                    title: "Продукт",
                    data: "meal.name",
                },
                {
                    title: "Масса, г",
                    orderable: false,
                    data: "weight",
                    render: function(data, type, row, meta) {
                        return `<input type="number" min="1" value="${data}" id="${row._id}" onblur="onRowEdit('${userID}', '${yesterday}', '${row._id}', 'breakfast', '${origin}')" />`;
                    }
                },
                {
                    title: "Калории",
                    data: "meal.calories",
                },
                {
                    title: "Белки",
                    data: "meal.proteins",
                },
                {
                    title: "Жиры",
                    data: "meal.fats",
                },
                {
                    title: "Углеводы",
                    data: "meal.carbons",
                },
                {
                    title: "",
                    orderable: false,
                    searchable: false,
                    data: null,
                    render: function(data, type, row, meta) {
                    return `
                    <a href="javascript:;" onclick="onRowDelete('${userID}', '${yesterday}', '${row._id}', 'breakfast', '${origin}')" >
                        delete
                    </a>`;
                    }
                },
                ]
            });
        }
    });

    $('#nav-lunch1-tab').on('click', function() { 
        curFeeding = 'lunch1'; 

        if (l1Table == null) {
            l1Table = $('#lunch1-table').DataTable({

                paging: false,
                info: false,
        
                ajax: `${origin}/api/reports/get/${userID}/lunch1?yesterday=${yesterday}`,
        
                language: {
                    url: "//cdn.datatables.net/plug-ins/1.10.19/i18n/Russian.json"
                },
        
                columns: [
                {
                    title: "Продукт",
                    data: "meal.name",
                },
                {
                    title: "Масса, г",
                    orderable: false,
                    data: "weight",
                    render: function(data, type, row, meta) {
                        return `<input type="number" min="1" value="${data}" id="${row._id}" onblur="onRowEdit('${userID}', '${yesterday}', '${row._id}', 'lunch1', '${origin}')" />`;
                    }
                },
                {
                    title: "Калории",
                    data: "meal.calories",
                },
                {
                    title: "Белки",
                    data: "meal.proteins",
                },
                {
                    title: "Жиры",
                    data: "meal.fats",
                },
                {
                    title: "Углеводы",
                    data: "meal.carbons",
                },
                {
                    title: "",
                    orderable: false,
                    searchable: false,
                    data: null,
                    render: function(data, type, row, meta) {
                    return `
                    <a href="javascript:;" onclick="onRowDelete('${userID}', '${yesterday}', '${row._id}', 'lunch1', '${origin}')" >
                        delete
                    </a>`;
                    }
                },
                ]
            });
        }
    });

    $('#nav-dinner-tab').on('click', function() { 
        curFeeding = 'dinner'; 

        if (dTable == null) {
            dTable = $('#dinner-table').DataTable({

                paging: false,
                info: false,
        
                ajax: `${origin}/api/reports/get/${userID}/dinner?yesterday=${yesterday}`,
        
                language: {
                    url: "//cdn.datatables.net/plug-ins/1.10.19/i18n/Russian.json"
                },
        
                columns: [
                {
                    title: "Продукт",
                    data: "meal.name",
                },
                {
                    title: "Масса, г",
                    orderable: false,
                    data: "weight",
                    render: function(data, type, row, meta) {
                        return `<input type="number" min="1" value="${data}" id="${row._id}" onblur="onRowEdit('${userID}', '${yesterday}', '${row._id}', 'dinner', '${origin}')" />`;
                    }
                },
                {
                    title: "Калории",
                    data: "meal.calories",
                },
                {
                    title: "Белки",
                    data: "meal.proteins",
                },
                {
                    title: "Жиры",
                    data: "meal.fats",
                },
                {
                    title: "Углеводы",
                    data: "meal.carbons",
                },
                {
                    title: "",
                    orderable: false,
                    searchable: false,
                    data: null,
                    render: function(data, type, row, meta) {
                    return `
                    <a href="javascript:;" onclick="onRowDelete('${userID}', '${yesterday}', '${row._id}', 'dinner', '${origin}')" >
                        delete
                    </a>`;
                    }
                },
                ]
            });
        }
    });

    $('#nav-lunch2-tab').on('click', function() { 
        curFeeding = 'lunch2'; 

        if (l2Table == null) {
            l2Table = $('#lunch2-table').DataTable({

                paging: false,
                info: false,
        
                ajax: `${origin}/api/reports/get/${userID}/lunch2?yesterday=${yesterday}`,
        
                language: {
                    url: "//cdn.datatables.net/plug-ins/1.10.19/i18n/Russian.json"
                },
        
                columns: [
                {
                    title: "Продукт",
                    data: "meal.name",
                },
                {
                    title: "Масса, г",
                    orderable: false,
                    data: "weight",
                    render: function(data, type, row, meta) {
                        return `<input type="number" min="1" value="${data}" id="${row._id}" onblur="onRowEdit('${userID}', '${yesterday}', '${row._id}', 'lunch2', '${origin}')" />`;
                    }
                },
                {
                    title: "Калории",
                    data: "meal.calories",
                },
                {
                    title: "Белки",
                    data: "meal.proteins",
                },
                {
                    title: "Жиры",
                    data: "meal.fats",
                },
                {
                    title: "Углеводы",
                    data: "meal.carbons",
                },
                {
                    title: "",
                    orderable: false,
                    searchable: false,
                    data: null,
                    render: function(data, type, row, meta) {
                    return `
                    <a href="javascript:;" onclick="onRowDelete('${userID}', '${yesterday}', '${row._id}', 'lunch2', '${origin}')" >
                        delete
                    </a>`;
                    }
                },
                ]
            });
        }
    });

    $('#nav-supper-tab').on('click', function() { 
        curFeeding = 'supper'; 

        if (sTable == null) {
            sTable = $('#supper-table').DataTable({

                paging: false,
                info: false,
        
                ajax: `${origin}/api/reports/get/${userID}/supper?yesterday=${yesterday}`,
        
                language: {
                    url: "//cdn.datatables.net/plug-ins/1.10.19/i18n/Russian.json"
                },
        
                columns: [
                {
                    title: "Продукт",
                    data: "meal.name",
                },
                {
                    title: "Масса, г",
                    orderable: false,
                    data: "weight",
                    render: function(data, type, row, meta) {
                        return `<input type="number" min="1" value="${data}" id="${row._id}" onblur="onRowEdit('${userID}', '${yesterday}', '${row._id}', 'supper', '${origin}')" />`;
                    }
                },
                {
                    title: "Калории",
                    data: "meal.calories",
                },
                {
                    title: "Белки",
                    data: "meal.proteins",
                },
                {
                    title: "Жиры",
                    data: "meal.fats",
                },
                {
                    title: "Углеводы",
                    data: "meal.carbons",
                },
                {
                    title: "",
                    orderable: false,
                    searchable: false,
                    data: null,
                    render: function(data, type, row, meta) {
                    return `
                    <a href="javascript:;" onclick="onRowDelete('${userID}', '${yesterday}', '${row._id}', 'supper', '${origin}')" >
                        delete
                    </a>`;
                    }
                },
                ]
            });
        }
    });
    
});