import { userID, yesterday } from './commons.js';

$(document).ready(function() {

    let curFeeding = null;

    $('#add-meal-button').on('click', async function() {

        let selectedMeal = $('#meals-list').val();
        let weight = $('#meal-weight').val();

        let response = await fetch(`${origin}/api/reports/set/${userID}/${curFeeding}?yesterday=${yesterday}&meal_id=${selectedMeal}&weight=${weight}`);

        if (response.ok)  $(`#${curFeeding}-table`).DataTable().ajax.reload();
    });

    let bTable = null;
    let dTable = null;
    let sTable = null;

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
                        return `<input type="number" min="1" value="${data}" id="${row._id}" onblur="editRowWeight('${userID}', '${yesterday}', '${row._id}', 'breakfast')" />`;
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
                    <a href="javascript:;" onclick="deleteRow('${userID}', '${yesterday}', '${row._id}', 'breakfast')" >
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
                        return `<input type="number" min="1" value="${data}" id="${row._id}" onblur="editRowWeight('${userID}', '${yesterday}', '${row._id}', 'dinner')" />`;
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
                    <a href="javascript:;" onclick="deleteRow('${userID}', '${yesterday}', '${row._id}', 'dinner')" >
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
                        return `<input type="number" min="1" value="${data}" id="${row._id}" onblur="editRowWeight('${userID}', '${yesterday}', '${row._id}', 'supper')" />`;
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
                    <a href="javascript:;" onclick="deleteRow('${userID}', '${yesterday}', '${row._id}', 'supper')" >
                        delete
                    </a>`;
                    }
                },
                ]
            });
        }
    });
    
});