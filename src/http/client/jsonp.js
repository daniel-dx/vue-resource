/**
 * JSONP client.
 */

import Promise from '../../promise';

export default function (request) {
    return new Promise((resolve) => {

        var name = request.jsonp || 'jsonp', callback = '_jsonp' + Math.random().toString(36).substr(2), body = null, handler, script, timeout;

        handler = ({type}) => {

            if (timeout) { // clear timeout when request response in time
                timeout = null;
                clearTimeout(timeout);
            }

            var status = 0;

            if (type === 'load' && body !== null) {
                status = 200;
            } else if (type === 'error') {
                status = 500;
            } else if (type === 'timeout') {
                body = '{"statusText": "timeout"}';
            }

            resolve(request.respondWith(body || '{}', {status})); // TODO xhr和jsonp请求超时返回的响应内容不一置

            delete window[callback];
            document.body.removeChild(script);
        };

        request.params[name] = callback;

        window[callback] = (result) => {
            body = JSON.stringify(result);
        };

        script = document.createElement('script');
        script.src = request.getUrl();
        script.type = 'text/javascript';
        script.async = true;
        script.onload = handler;
        script.onerror = handler;
        if (request.timeout) {
            timeout = setTimeout(() => { // timeout, mark it
                script.onload = script.onerror = (_ref) => {
                    var ref = {type: 'timeout'};
                    handler(ref);
                }
                clearTimeout(timeout);
            }, request.timeout);
        }

        document.body.appendChild(script);
    });
}
