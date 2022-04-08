
export function getQueryParams(url) {
    
    let qParams = {};
    // create a binding tag to use a property called search
    let anchor = document.createElement('a');
    // assign the href URL of the anchor tag
    anchor.href = url;

    // search property returns URL query string
    let qStrings = anchor.search.substring(1);
    let params = qStrings.split('&');
    for (i in params) {
        let pair = params[i].split('=');
        qParams[pair[0]] = decodeURIComponent(pair[1]);
    }
    return qParams;
}

export function getQueryParam(param, url) {

    let href = url;
    // this is an expression to get query strings
    let regexp = new RegExp( '[?&]' + param + '=([^&#]*)', 'i' );
    let qString = regexp.exec(href);

    return qString ? qString[1] : null;
}


const protocol = 'http://';
const host = 'localhost:5500';
export const origin = protocol + host;

const url = new URL(location.href).href;

export const userID = getQueryParam('id', url);
export const yesterday = Number(getQueryParam('yesterday', url));