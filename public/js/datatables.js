function deleteRow(userID, rowID) {

    $.get(`/api/reports/del/${userID}/breakfast?row_id='${rowID}'`)
    .done(function (data) {
        $("#breakfastTable").DataTable().ajax.reload();
    })
    .fail(function () {
        
    });
}

function editRowWeight(userID, rowID) {

    /* let newWeight = $(`[data-id='${rowID}']`).value; */
    let newWeight = $(`#${rowID}`).val();

    $.get(`/api/reports/put/${userID}/breakfast?row_id='${rowID}'&row_weight=${newWeight}`)
    .done(function (data) {
        $("#breakfastTable").DataTable().ajax.reload();
    })
    .fail(function () {

    });
}

$(document).ready(function() {
    
    let userID = new URL(location.href).pathname;
    userID = userID.substring(1);

    let curTable = null;

    let bfTable = $('#breakfastTable').DataTable({

        paging: false,
        info: false,

        ajax: `http://localhost:5500/api/reports/get/${userID}/breakfast`,

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
            return `
            <input type="number" min="1" value="${data}" id="${row._id}" onblur="editRowWeight(${userID}, '${row._id}')" />
            `;
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
            <a href="javascript:;" onclick="deleteRow(${userID}, '${row._id}')" >
                delete
            </a>`;
            }
        },
        ]
    });


    $('#add-meal-button').on('click', async function() {

        let selectedMeal = document.getElementById('meals-list').value;

        let weight = document.getElementById('meal-weight').value;
        let response = await fetch(`http://localhost:5500/api/reports/set/${userID}/breakfast?meal_id=${selectedMeal}&weight=${weight}`);

        if (response.ok) bfTable.ajax.reload();
    });




});