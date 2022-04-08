import {origin, userID, yesterday} from './commons.js';

$(document).ready(async function() {

    let response = await fetch(`${origin}/header/report-data/${userID}/${yesterday}`);
    //let data = await response.json();

    let html = '';
    if (yesterday) {
        html = `Отчёт за вчера   |   <a href="${origin}/?id=${userID}">Отчёт за сегодня</a>`;
    } 
    else {
        html = `<a href="${origin}?id=${userID}&yesterday=1">Отчёт за вчера</a>   |   Отчёт за сегодня`;
    }

    $('.header-text').append(html);
});