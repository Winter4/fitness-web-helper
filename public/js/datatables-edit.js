
function deleteRow(userID, yesterday, rowID, feeding) {

    $.get(`/api/reports/del/${userID}/${feeding}?yesterday=${yesterday}&row_id='${rowID}'`)
    .done(function (data) {
        $(`#${feeding}-table`).DataTable().ajax.reload();
    })
    .fail(function () { });
}

function editRowWeight(userID, yesterday, rowID, feeding) {

    let newWeight = $(`#${rowID}`).val();

    $.get(`/api/reports/put/${userID}/${feeding}?yesterday=${yesterday}&row_id='${rowID}'&row_weight=${newWeight}`)
    .done(function (data) {
        $(`#${feeding}-table`).DataTable().ajax.reload();
    })
    .fail(function () { });
}