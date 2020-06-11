/* SERVICE WORKER beta BY NAHU :)
El service worker se encargará de gusrdar la app y los servicios 
en el almacenamiento del dispositivo para que se pueda acceder 
sin conexion a la app. (por ahora solo mostrará pantalla Ofline.html)
*/

var vCache = false, appVer = 'beta 0.1';

(async () => {
    var nativeAddAll = Cache.prototype.addAll;
    var userAgent = navigator.userAgent.match(/(Firefox|Chrome)\/(\d+\.)/);

    // Has nice behaviour of `var` which everyone hates
    if (userAgent) {
        var agent = userAgent[1];
        var version = parseInt(userAgent[2]);
    }

    var isChromeVersion = (agent === 'Chrome' && version >= 50);
    var isFirefoxVersion = (agent === 'Firefox' && version >= 46);
    var isAgentVersion = (!userAgent || isFirefoxVersion || isChromeVersion);
    if (nativeAddAll && isAgentVersion) {
        return;
    }

    // Cache prototype function 'addAll'
    Cache.prototype.addAll = (requests) => {
        var cache = this;

        // Since DOMExceptions are not constructable:
        function NetworkError(message) {
            this.name = 'NetworkError';
            this.code = 19;
            this.message = message;
        }

        NetworkError.prototype = Object.create(Error.prototype);

        return Promise.resolve().then(function () {
            if (arguments.length < 1) {
                throw new TypeError();
            }

            requests = requests.map(function (request) {
                if (request instanceof Request) {
                    return request;
                } else {
                    // may throw TypeError
                    return String(request);
                }
            });

            return Promise.all(requests.map(function (request) {
                if (typeof request === 'string') {
                    request = new Request(request);
                }

                var scheme = new URL(request.url).protocol;

                if (scheme !== 'http:' && scheme !== 'https:') {
                    throw new NetworkError("Invalid scheme");
                }

                return fetch(request.clone());
            }));
        }).then(function (responses) {
            if (responses.some(function (response) {
                return !response.ok;
            })) {
                throw new NetworkError('Incorrect response status');
            }

            return Promise.all(responses.map(function (response, i) {
                return cache.put(requests[i], response);
            }));
        }).then(function () {
            return undefined;
        });
    };

    // Cache prototype function 'add'
    Cache.prototype.add = function (request) {
        return this.addAll([request]);
    };
});

var NHSW = {
    installFunction: e => {
        self.skipWaiting().then(() => {
            caches.open('aula-cache-v1').then(a => {
                a.keys().then(re => {
                    if (re.length > 0) {
                        vCache = true;
                        caches.delete('aula-cache-v1');

                    } else {
                        vCache = false;
                    }
                })
            })
        })
    },
    fetchFunction: e => {
        e.respondWith(
            caches.open('aula-cache-v1').then(async cache => {
                return cache.match(e.request).then(response => {
                    return (response && !vCache) ? response : fetch(e.request).catch(() => caches.match('.' + '/offline.html'));
                })
            }));
    },

    activateFunction: e => {
        e.waitUntil(caches.open('aula-cache-v1').then(
            cache => {
                e.waitUntil(clients.matchAll({
                    type: "window"
                }).then(clientList => {
                    for (var i = 0; i < clientList.length; i++) {
                        var client = clientList[i];
                        if (client.frameType == "top-level" && 'focus' in client) {
                            if (vCache) {
                                if (client.url.split('?')[1] != 'cGFnZS9sb2dpbi5odG0=') {
                                    client.navigate('./')
                                }
                            } else {
                                client.navigate('./')
                            }
                        }
                    }
                }));

                return cache.addAll([
                    '.' + '/offline.html',
                    '.' + '/404.html',
                    '.' + '/font.css',
                    '.' + '/lib/img/',
                    '.' + '/lib/js/jquery.min.js',
                    '.' + '/lib/js/ripple.js',

                ]);
            }));
        e.waitUntil(self.clients.claim())
    }
};


self.addEventListener('install', NHSW.installFunction);


self.addEventListener('fetch', NHSW.fetchFunction);


self.addEventListener('activate', NHSW.activateFunction);

self.onnotificationclick = e => {
    e.notification.close();
    e.waitUntil(clients.matchAll({
        type: "window"
    }).then(function (clientList) {

        if (e.notification.tag == 'actua') {
            //si es una notificación de actualizción.. entonces
            for (var i = 0; i < clientList.length; i++) {
                var client = clientList[i];
                if (client.frameType == "top-level" && 'focus' in client)
                    client.focus()
                return client.navigate('./index.html')
            }
            if (clients.openWindow)
                return clients.openWindow('./index.html');
        } else {
            //si es una notificación normal.. entonces
            for (var i = 0; i < clientList.length; i++) {
                var client = clientList[i];
                if (client.frameType == "top-level" && 'focus' in client)
                    return client.focus()
            }
            if (clients.openWindow)
                return clients.openWindow('./');
        }
    }));
};