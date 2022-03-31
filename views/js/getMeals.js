document.addEventListener("DOMContentLoaded", async () => {
    try {
        let response = await fetch('http://localhost:5500/meals');
        let meals = await response.json();

        let list = document.getElementById('meals-list');
        for (meal of meals) {
            let option = document.createElement('option');
            option.value =  option.text = meal._id;
            list.appendChild(option);
        }
    } catch (e) {
        console.log(e);
    }
});