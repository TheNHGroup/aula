// EVENT LISTENERS //

window.onpopstate = (e) => { app.state.back(e) }

$(() => {
    var nowst = window.location.search;
    if (nowst) {
        var sea64 = atob(nowst.replace('?', ''))
        if (sea64.includes('page/')) {
            goTo({ type: 'page', id: sea64 });
        } else {
            decideNow()
        }
    } else {
        decideNow()
    }
})

function decideNow() {
    if (!app.user.actual()) {
        goTo({ type: 'page', id: 'page/login.html' })
    } else {
        goTo({ type: 'page', id: 'page/start.html' })
    }
}

// obteniendo el archivo
app.getFile = (x) => {
    return new Promise((resolve, regect) => {
        fetch(x, { cache: 'no-cache' }).then(Response => {
            Response.text().then(text => {
                resolve(text)
            })
        }).catch(err => {
            regect(err)
        })
    })
}

const goTo = (data) => {
    if (data.type && data.type == 'page') {
        app.getFile(data.id).then((page) => {
            $('app').hide('fade', 100, () => {
                $('app').html(page)
              
                document.title = $('pagetitle').html()
                app.state.replace({ data: data }, data.id, '?' + btoa(data.id))
                $('app').show('fade', 100)
                console.log(page)
            })
        })

    } else if (data.type && data.type == 'state') {
        session('lastState', JSON.stringify(data))
        app.state.push({ data: data }, data.id, '?' + btoa(data.id))
    }
}

app.state = {
    push: (data, title, url) => {
        history.pushState(data, title, url);
    },
    replace: (data, title, url) => {
        history.replaceState(data, title, url);
    },
    back: (e) => {
        if (e.state.data.id == 'page/login.html') {
            if (!app.user.actual()) {
                goTo(e.state.data)
            }
        } else if (e.state.data.id == 'page/start.html') {
            volver(JSON.parse(session('lastState')).id);
            session('lastState', '');
        } else {
            volver(JSON.parse(session('lastState')).id);
            session('lastState', JSON.stringify(e.state.data))
        }

    }

}

/// ABRIR PAGINA ///

function openPg(id) {
    window.navigator.vibrate(50);
    app.getFile('page/' + id + '.htm')
        .then((r) => {
            $('#appParent').append('<div id="' + id + '" class="pages closed">' + r + '</div>');
            setTimeout(() => { $('#' + id).removeClass('closed') }, 150);
            goTo({ type: 'state', id: id });
        })
        .catch(() => {
            app.noti.error('Intentalo otra vez 😐')
        })
}
