var require_phone_validation = true;
var installable = false;

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js').then(registration => {
            if (registration.installing) {
                serviceWorker = registration.installing;
            } else if (registration.waiting) {
                serviceWorker = registration.waiting;
            } else if (registration.active) {
                serviceWorker = registration.active;
            }
        },  (err)=> {
            console.log('ServiceWorker registration failed: ', err);
        })
    });
}

$(async () => {
    if (!window.location.search) {
        goTo('page/login.html', 'replace')
    } else {
        goTo(atob(window.location.search.replace('?', '')) + '.html', 'replace')
    }
    verline()
})

// CONST PRINCIPAL //
const app = {
    notif: async (msg) => {
        if ($('#snackbar').hasClass('show')) {
            setTimeout(() => {
                app.notif(msg)
            }, 300)
        } else {
            $('#snackbar').html(msg);
            $('#snackbar').addClass('show');
            setTimeout(() => {
                $('#snackbar').removeClass('show');
                $('#snackbar').html('');
            }, 2500);
        }
    },
    input: {
        format: () => {
            const ainp = $('.ainp');
            for (let i = 0; i < ainp.length; i++) {
                var esto = ainp[i], att = esto.attributes, id = (!esto.id) ? 'ainput' + i : esto.id, attrs = '';
                for (let i = 0; i < att.length; i++) {
                    if (att[i].nodeName != 'style' && att[i].nodeName != 'type' && att[i].nodeName != 'class' && att[i].nodeName != 'placeholder') {
                        attrs += att[i].nodeName + '="' + att[i].nodeValue + '" ';
                    }
                }
                $(esto).replaceWith('<div class="ainput" style="' + att['style'].nodeValue + '"><input type="' + esto.type + '" id="' + id + '" name="' + esto.name + '" style="width:100%" ' + attrs + '><div class="placeh">' + esto.placeholder + '</div></div>');
            }
        }
    },
    standalone: () => {
        return ((window.navigator.standalone == true) || (window.matchMedia('(display-mode: standalone)').matches))
    }
};


/// FUNCIONES DE USUARIO ///

app.user = {
    add: (e) => {
        e.preventDefault()
        inp = $(e.target).find('input')
        var uMail = inp[0].value;
        var uCat = inp[1].value;
        var uSite = inp[2].value;
        var u = inp[3].value;

        var usr = $('#zinput').val().split('.').join('_').toLowerCase().split('@arbusta_net').join('');
        var cat = $('#category').val();
        db.ref('Users/').once('value', (uuu) => {
            usrs = uuu.val();
            if (usrs[usr]) {
                error('Ese usuario ya existe!')
            } else {
                db.ref('Users/' + usr).update({
                    points: '0',
                    cat: cat
                });
                $('#zinput').val('');
                sucess('Usuario creado correctamente')
            }
            usrs[usr] = { points: '0' }
            window.sessionStorage.setItem('usrs', JSON.stringify(usrs))
        })
    },
    actual: () => {
        return local('actualuser');
    },
    delete: (id) => {

    },
    list: () => {

    },
    info: () => {

    }
}

/// CUANDO CAMBIA DE CONEXION ///
navigator.connection.onchange = () => {
    verline()
};


/// VOLVER FUNCTION ///

function volver(x) {
    if (x == 'userinfo') {
        if ($('.chip').hasClass('card')) {
            $('.chip').removeClass('card')
            $('.chip').on('click', thisUserInf);
        }
    } else {
        $('#' + x).addClass('closed');
        setTimeout(() => { $('#' + x).remove() }, 150);
    }

}
// LOGIN FUNTIONS //

app.login = {
    in: (e) => {
        e.preventDefault();
        inp = $(e.target).find('input')
        var userIn = inp[0].value.toLowerCase().split('.').join('_').replace('@', '_').replace(' ', '');
        var passIn = inp[1].value;
        if (userIn && passIn) {
            fetch('https://aula-7e215.firebaseio.com/users/' + userIn + '.json', { cache: 'no-store' }).then(x => {
                x.json().then(act => {
                    if (userIn == '1=1' || userIn == 'admin' || userIn == 'lalala' || userIn == 'test' || userIn == '9999' || userIn == '1234' || userIn == 'true') {
                        var testingmsg = [
                            '"Un clásico."',
                            'Jaja salu2',
                            'Sí sí como no',
                            'Testing es genial',
                            'Tu tlankilo yo nelvioso'
                        ]
                        app.notif(testingmsg[Math.floor(Math.random() * Math.floor(5))])
                    } else {

                        if (act) {

                            if (passIn == act.pass) {
                                local('actualuser', userIn)
                                fetch('https://aula-7e215.firebaseio.com/users/' + app.user.actual() + '.json').then(x => {
                                    x.json().then(act => {
                                        local('user', JSON.stringify(act))
                                        if (act.theme) {
                                            local('theme', act.theme.shadows)
                                            local('nightmode', act.theme.night)
                                        } else {
                                            local('theme', 'awesome')
                                            local('nightmode', 'off')
                                        }
                                    })
                                }).then(e => {
                                    window.location.replace('./index.html');return false;
                                })


                            } else {
                                app.notif('La contraseña es incorrecta.')
                            }

                        } else {
                            app.notif('El usuario no existe.')
                        }
                    }
                })
            })
        }
    },
    out: () => {
        local.del('actualuser');
        local.del('theme');
        local.del('nightmode');
        local.del('user');
        local.del('user_img')
        setTimeout(() => {
           window.location.reload()
        }, 200)

    }
}

//STORAGE//

var session = (a, b) => {
    if (a) {
        if (b) {
            window.sessionStorage.setItem(a, b);
        } else {
            return window.sessionStorage.getItem(a);
        }
        return true
    } else {
        return {}
    }
}

session.del = (a) => {
    window.sessionStorage.removeItem(a);
}

var local = (a, b) => {
    if (a) {
        if (b) {
            window.localStorage.setItem(a, b);

        } else {
            return window.localStorage.getItem(a);
        }
        return true
    } else {
        return {}
    }
}
local.del = (a) => {
    window.localStorage.removeItem(a)
}


// VERIFICAR CONEXION //
function verline() {
    return new Promise((resolve) => {
        fetch('https://api.ipify.org?format=json&callback= ', { cache: 'no-store' }).then(x => {
            x.json().then(data => {
                resolve(data.ip)
            }).catch(err => {
                window.location.href = './offline.html'
            })
        }).catch(err => {
            window.location.reload()
        })
    })
}


let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
    deferredPrompt = e;
    e.preventDefault();
    setTimeout(() => {
        installable = true;
    }, 1000)
});

if (window.Notification && Notification.permission !== "denied") {
    Notification.requestPermission((status) => {
        console.log('Notif: ' + status)
    })
}

//Hvppp853TifpO67brC-9j0lgyrb31SB-dMPmsQe8
