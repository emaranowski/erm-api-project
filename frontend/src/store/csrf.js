import Cookies from 'js-cookie'; // to extract XSRF-TOKEN cookie val

// fetch reqs with any HTTP verb/method other than GET:
// must have XSRF-TOKEN header,
// w/ val as XSRF-TOKEN cookie
// (to do so, wrap fetch func on window w/ csrfFetch,
// to use in place of def fetch func)

export async function csrfFetch(url, options = {}) {
    // if no method, default to 'GET'
    options.method = options.method || 'GET';
    // if no headers, default to empty obj {}
    options.headers = options.headers || {};

    // if any method other than 'GET':
    // set "Content-Type" header to "application/json";
    // set "XSRF-TOKEN" header to extracted val of "XSRF-TOKEN" cookie
    if (options.method.toUpperCase() !== 'GET') {
        options.headers['Content-Type'] = options.headers['Content-Type'] || 'application/json';
        options.headers['XSRF-Token'] = Cookies.get('XSRF-TOKEN');
    }
    // call + await default window's fetch, passing in url + options
    const res = await window.fetch(url, options);

    // if res status code is 400 or above,
    // throw res itself as error
    if (res.status >= 400) throw res;

    // if res status code is under 400,
    // ret res to next promise chain
    return res;
}

// call to get "XSRF-TOKEN" cookie (only use in development)
// call custom csrfFetch func with /api/csrf/restore as url param
export function restoreCSRF() {
    return csrfFetch('/api/csrf/restore');
}
