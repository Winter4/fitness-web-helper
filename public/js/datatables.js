
$(document).ready(function() {
    
    let userID = new URL(location.href).pathname;
    userID = userID.substring(1);

    let bfTable = $('#breakfastTable').DataTable({
        paging: false,
        info: false,

        ajax: `http://localhost:5500/api/reports/get/${userID}/breakfast`,

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
                  <input type="number" min="1" value="${data}" />
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
                  <a href="javascript:;" onclick="removeRecord(${row.id})" >
                    <i class="fas fa-trash">delete</i>
                  </a>`;
                }
              },
        ]
    });

    function removeRecord(id) {
        //$.get("/api/removeRecord?id=" + id)
        $.done(function (data) {
            $("#all-table").DataTable().ajax.reload();
            Toastify({ text: "Запись успешно удалена", className: "bg-gradient-success border-radius-lg" }).showToast();
        })
        .fail(function () {
            Toastify({ text: "Ошибка во время удаления записи", className: "bg-gradient-danger border-radius-lg" }).showToast();
        });
    }

    $('#add-meal-button').on('click', async function() {

      console.log('test 1');

      let selected = document.getElementById('meals-list').value;

      let weight = document.getElementById('meal-weight').value;
      let response = await fetch(`http://localhost:5500/api/reports/set/${userID}/breakfast?meal_id=${selected}&weight=${weight}`);
      
      if (response.ok) bfTable.ajax.reload();
      else console.log('error');
  } );

    /* 
    $("#current-table").DataTable({
        ajax: "тут какая-то ссылка",
        language: {
          url: "//cdn.datatables.net/plug-ins/1.10.19/i18n/Russian.json"
        },
        columns: [
          {
            title: "IP",
            data: "ip",
            render: function ( data, type, row, meta ) {
              return `<img src="/assets/img/flags/${row.country}.svg" class="avatar-xs me-2" title="${row.country}"> ${data}`;
            }
          },
          {
            title: "Страна",
            data: "country",
            visible: false
          },
          {
            title: "Дата",
            data: "timestamp",
            render: function ( data, type, row, meta ) {
              var date = new Date(+data * 1000);
              return formatDate(date);
            }
          },
          {
            title: "Действия",
            class: "text-center",
            orderable: false,
            searchable: false,
            data: null,
            render: function ( data, type, row, meta ) {
              return `
              <a href="javascript:;" onclick="removeRecord(${row.id})" >
                <i class="fas fa-trash"></i>
              </a>`;
            }
          },
        ]
      });
   
    function removeRecord(id) {
        $.get("/api/removeRecord?id=" + id)
        .done(function (data) {
            $("#all-table").DataTable().ajax.reload();
            Toastify({ text: "Запись успешно удалена", className: "bg-gradient-success border-radius-lg" }).showToast();
        })
        .fail(function () {
            Toastify({ text: "Ошибка во время удаления записи", className: "bg-gradient-danger border-radius-lg" }).showToast();
        });
    } */

});