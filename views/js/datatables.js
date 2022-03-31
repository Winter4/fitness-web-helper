
$(document).ready(function() {
    
    let bfTable = $('#breakfastTable').DataTable({
        paging: false,
        searching: false,
        ordering: false,
        info: false,
    });

    $('#add-meal-button').on('click', async function() {

        let selected = document.getElementById('meals-list').value;

        let response = await fetch('http://localhost:5500/meals/' + selected);
        let meal = await response.json();

        let mealWeight = document.getElementById('meal-weight').value;
        if (mealWeight == '' || Number(mealWeight) < 1) {
            
        }
        else {
            bfTable.row.add( [
                meal.name,
                mealWeight,
                meal.calories,
                meal.proteins,
                meal.fats,
                meal.carbons
            ] ).draw( false );
        }
    } );
    

});