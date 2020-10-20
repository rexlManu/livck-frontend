const backend = {
    init: () => {
        console.log('Status-Backend loading...');
        backend.request.init();
        backend.data.init();
        if (backend.cache.currentPage === 'main') {
            backend.timer.init();
        }
        console.log('Status-Backend loaded!');
    },
    cache: {
        requesting: false,
        page: [],
        currentPage: $('meta[name="page"]').attr('content'),
        alerts: false,
    },
    notify: {
        success: (message) => {
            toastr.success(message, backend.notify.options);
        },
        error: (message) => {
            toastr.error(message, backend.notify.options);
        },
        info: (message) => {
            toastr.info(message, backend.notify.options);
        },
        options: {
            positionClass: 'toast-bottom-right'
        },
        confirm: async (message, callback) => await confirm(message) ? callback() : null
    },
    csrf: () => $('meta[name="csrf-token"]').attr('content'),
    request: {
        build(url, method, data) {
            if (data && !data.hasOwnProperty('_token'))
                data['_token'] = backend.csrf();
            return new Promise((success, error) => $.ajax({
                url,
                method,
                data,
                success,
                error,
            }));
        },
        get: (url, data, notify, btn) => {
            let promise = backend.request.build(url, 'GET', data);
            if (notify) {
                let button = $(btn);
                let defaultButton = button.html();
                button.html(`<span><i class="fa fa-spinner fa-spin"></i>${button.text()}</span>`);
                promise.then((data) => {
                    backend.request.handle(data);
                    setTimeout(() => button.html(defaultButton), 300);
                }).catch((error) => {
                    backend.request.handle(error.responseJSON);
                    setTimeout(() => button.html(defaultButton), 300);
                });
            }
            return promise;
        },
        post: (url, data) => backend.request.build(url, 'POST', data),
        init: () => {
            $('button[type=submit]').on('click', function (e) {
                let button = $(this);
                if (button.data('form')) {
                    $(button.data('form')).submit();
                }
            });
            $("form").on("submit", function (e) {
                e.preventDefault();
                if (backend.cache.requesting)
                    return;
                backend.cache.requesting = true;
                let form = $(this);
                let button = form.find('button');
                let defaultButton = button.html();
                button.html('<span><i class="fa fa-spinner fa-spin"></i> ' + button.text() + '</span>');
                backend.request.post(form.attr('action'), form.serialize()).then((data) => {
                    backend.request.handle(data);
                    setTimeout(() => button.html(defaultButton), 300);
                    backend.cache.requesting = false;
                }).catch((error) => {
                    console.log(error.responseJSON);
                    if (error.status && error.status === 500) {
                        backend.notify.error('Es ist ein Fehler aufgetreten, bitte versuchen Sie es zu einem späteren Zeitpunkt erneut.');
                    } else {
                        backend.request.handle(error.responseJSON);
                    }
                    setTimeout(() => button.html(defaultButton), 300);
                    backend.cache.requesting = false;
                });
            });
        },
        execute: {
            post: (url, data, button) => {
                button = $(button);
                console.log(button)
                let defaultButton = button.html();
                button.html('<span><i class="fa fa-spinner fa-spin"></i> ' + button.text() + '</span>');
                backend.request.post(url, data).then((data) => {
                    backend.request.handle(data);
                    setTimeout(() => button.html(defaultButton), 300);
                }).catch((error) => {
                    if (error.status && error.status === 500)
                        backend.notify.error('Es ist ein Fehler aufgetreten, bitte versuchen Sie es zu einem späteren Zeitpunkt erneut.');
                    else backend.request.handle(error.responseJSON);
                    setTimeout(() => button.html(defaultButton), 300);
                });
            },
            get: (url, button) => {
                button = $(button);
                let defaultButton = button.html();
                button.html('<span><i class="fa fa-spinner fa-spin"></i> ' + button.text() + '</span>');
                backend.request.get(url).then((data) => {
                    backend.request.handle(data);
                    setTimeout(() => button.html(defaultButton), 300);
                }).catch((error) => {
                    if (error.status && error.status === 500)
                        backend.notify.error('Es ist ein Fehler aufgetreten, bitte versuchen Sie es zu einem späteren Zeitpunkt erneut.');
                    else backend.request.handle(error.responseJSON);
                    setTimeout(() => button.html(defaultButton), 300);
                });
            },
        },
        handle: (response, notify = true) => {
            let data = response;
            if (data && !data.success && data.errors && data.errors.length > 0 && notify)
                backend.notify.error(data.errors[0]);
            else if (data && data.success && data.messages && data.messages.length > 0 && notify)
                backend.notify.success(data.messages[0]);
            if (data.hasOwnProperty('data') && data.data.hasOwnProperty('redirect_url'))
                window.location.href = data.data.redirect_url;
            if (backend.cache.modal && data.success) {
                backend.modal.close();
                backend.cache.modal = false;
            }
            return data.success;
        }
    },
    click: {
        init: () => {
            backend.click.copy();
        },
        copy: () => $('a[type="copy"]').on('click', (e) => {
            var $temp = $("<input>");
            $("body").append($temp);
            let target = $(e.target);
            $temp.val(target.data('copy')).select();
            document.execCommand("copy");
            $temp.remove();
            let title = target.data('title');
            let tooltip = $('.tooltip .tooltip-inner');
            let bgColor = tooltip.css('background-color');
            tooltip.css('background-color', '#7bea7b');
            target.tooltip('hide').attr('data-original-title', 'Kopiert!').tooltip('show');
            setTimeout(() => target.tooltip('hide').attr('data-original-title', title), 500)
            setTimeout(() => tooltip.css('background-color', bgColor), 500)
        })
    },
    timer: {
        interval: $('meta[name="refresh_interval"]').attr('content'),
        time: 0,
        init: () => {
            backend.timer.reset();
            backend.timer.setTime();
            setInterval(() => {
                backend.timer.setTime();
                if (backend.timer.time > 1) {
                    backend.timer.time--;
                } else {
                    backend.timer.reset();
                    backend.data.handle();
                }
            }, 1000);
        },
        reset: () => backend.timer.time = backend.timer.interval,
        setTime: () => $('[data-toggle="timer"]').text(backend.timer.time),
    },
    data: {
        sync: () => backend.request.get('data').then(value => backend.cache.page = value).catch(error => console.log(error)),
        handle: () => {
            backend.data.sync().then(() => {
                backend.set.status();
                backend.set.main();
                if (backend.cache.currentPage === 'main') {
                    backend.set.category();
                    backend.set.alert();
                }
            });
        },
        init: () => backend.data.sync().then(() => backend.data.handle()),
    },
    set: {
        category: () => {
            $('[data-category]').empty();
            if (backend.cache.page.categories.length <= 0) {
                $('[data-category]').append('<div class="card border-0 rounded mb-2">\n' +
                    '                <a><div class="card-header border-0 bg-light p-3 pr-5">\n' +
                    '                        <div class="row">\n' +
                    '                            <h6 class="col title mb-0 text-center" style="font-size: 16px">Es wurden noch keine Monitore erstellt.</h6>\n' +
                    '                        </div>\n' +
                    '                    </div>\n' +
                    '                </a>\n' +
                    '            </div>');
            }
            backend.cache.page.categories.forEach(category => {
                if (category.monitors.length <= 0)
                    return;
                $('[data-category]').append('<h4 class="title mb-1 text-left text-white" style="font-size: 18px;float: left">' + category.title + '</h4>')
                $('[data-category]').append('<table data-category-table="' + category.uuid + '" class="table table-padded" style="min-height: 66px;"></table>');
                $('[data-category-table="' + category.uuid + '"]').append('<tbody></tbody>');
                category.monitors.forEach(monitor => backend.set.monitor(category, monitor))
            })
        },
        main: () => {
            $('title').text(backend.cache.page.title);
            $('[data-status-title]').text(backend.cache.page.title);
        },
        monitor: (category, monitor) => {
            $('[data-category-table="' + category.uuid + '"] tbody').append('<tr data-monitor="' + monitor.uuid + '" style="display: flex!important;width: 100%;" class="mb-2"></tr>');
            $('[data-category-table="' + category.uuid + '"] tbody tr[data-monitor="' + monitor.uuid + '"]').append('<td class="' + (monitor.state !== 'AVAILABLE' ? 'text-offline' : '') + '" style="text-align: left;width: 100%" data-title><span>' + monitor.title + '</span></td>');
            $('[data-category-table="' + category.uuid + '"] tbody tr[data-monitor="' + monitor.uuid + '"]').append('<td class="text-right text-muted" data-latency style="width: 100%;padding-right: 0px"><span>' + monitor.latency + '</span> <a style="padding: 0px 0px 0px 10px">—</a></td>');
            $('[data-category-table="' + category.uuid + '"] tbody tr[data-monitor="' + monitor.uuid + '"]').append('<td class="text-center" data-display-state>\n' +
                '                                            <div data-offline class="box-mini box-offline"\n' +
                '                                                 style="' + (monitor.state === 'AVAILABLE' ? 'display: none' : '') + '">\n' +
                '                                                <div class="pulsator-mini pulsator-offline"></div>\n' +
                '                                            </div>\n' +
                '                                            <div data-online class="box-mini box-online" style="' + (monitor.state !== 'AVAILABLE' ? 'display: none' : '') + '">\n' +
                '                                                <div class="pulsator-mini pulsator-online"></div>\n' +
                '                                            </div>\n' +
                '                                        </td>');
        },
        status: () => {
            $('[data-status]').css('display', 'none');
            $('[data-status="' + backend.cache.page.reachability + '"]').css('display', '');
        },
        alert: () => {
            if (!backend.cache.alerts) {
                if(backend.cache.page.alerts.length < 1) {
                    $('[data-alert-list]').append('<div class="card border-0 rounded mb-2">\n' +
                        '                <a><div class="card-header border-0 bg-light p-3 pr-5">\n' +
                        '                        <div class="row">\n' +
                        '                            <h6 class="col title mb-0 text-center" style="font-size: 16px">Keine Vorfälle vorhanden.</h6>\n' +
                        '                        </div>\n' +
                        '                    </div>\n' +
                        '                </a>\n' +
                        '            </div>');
                    backend.events.dataLoaded();
                } else {
                    $('[data-alerts]').append('<div class="section-title mb-5"><h4 class="title text-left text-white" style="font-size: 18px;float: left">Aktuelles</h4></div>');
                    $('[data-alerts]').append('<div class="faq-content"><div class="accordion" id="alerts" data-alert-list></div></div>');
                    backend.cache.alerts = true;
                }
            }
            backend.cache.page.alerts.forEach(alert => {
                let uuid = alert.uuid.replace(/-/g, '');
                if ($('[data-alert-message="'+uuid+'"]').length >= 1) {
                    $('[data-alert-title="'+uuid+'"]').text(alert.subject);
                    $('[data-alert-message="'+uuid+'"]').empty();
                    $('[data-alert-message="'+uuid+'"]').html(alert.message);
                } else {
                    let random = backend.generate.string(10);
                    $('[data-alert-list]').append('<div class="card border-0 rounded mb-2">\n' +
                        '                <a data-toggle="collapse" aria-expanded="true" href="#'+random+'" class="collapsed"><div class="card-header border-0 bg-light p-3 pr-5">\n' +
                        '                        <div class="row">\n' +
                        '                            <h6 class="col title mb-0 text-left" style="font-size: 16px" data-alert-title="'+uuid+'"> ' + alert.subject + '</h6>\n' +
                        '                            <h6 class="col title mb-0 text-right ml-auto">' + alert.created_at + '</h6>\n' +
                        '                        </div>\n' +
                        '                    </div>\n' +
                        '                </a>\n' +
                        '                <div id="'+random+'" class="collapse text-left" data-parent="#alerts">\n' +
                        '                    <div class="card-body px-2 py-4">\n' +
                        '                        <blockquote class="blockquote p-3 mb-0" data-alert-message="'+uuid+'">\n' +
                        '                            <p class="text-muted mb-0 faq-ans" style="word-break: normal!important;">' + alert.message + '</p>\n' +
                        '                        </blockquote>\n' +
                        '                    </div>\n' +
                        '                    <div class="px-2" style="text-align: right;padding-bottom: 0.3em;margin-top: -1em;">\n' +
                        '                        <a onclick="location.href = \'incident/'+alert.id+'\';" target="_blank" class="badge badge-primary mb-1" style="text-align: right!important;cursor: pointer">Teilen</a>\n' +
                        '                    </div>\n' +
                        '                </div>\n' +
                        '            </div>');
                    if ($('[data-alert-list] .card').length === backend.cache.page.alerts.length) {
                        backend.events.dataLoaded();
                    }
                }
            });
        },
    },
    events: {
        dataLoaded: () => {
            console.log('Event: dataLoaded');
            $('[data-footer]').css('display', '');
        }
    },
    generate: {
        string: (length) => {
            let result           = '';
            let characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            let charactersLength = characters.length;
            for ( var i = 0; i < length; i++ ) {
                result += characters.charAt(Math.floor(Math.random() * charactersLength));
            }
            return result;
        }
    }
};
$(() => setTimeout(() => backend.init(), 200));

window.toastr.options = backend.notify.options;
