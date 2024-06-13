console.log('Hello World');
let configObject = {
    // websocket_url: 'ws://34.241.102.241:5080/ws', // Please use this connection manager only for testing purposes
    websocket_url: localStorage.getItem('ws_url') ?? 'wss://xmpp.systest.moya.app:5443/ws', // Please use this connection manager only for testing purposes
    // bosh_service_url: 'https://convxaersejs.org/http-bind/', // Please use this connection manager only for testing purposes
    allow_bookmarks: false,
    allow_multiple_devices: false,
    authentication: 'login',
    auto_join_on_invite: true,
    auto_login: true,
    auto_reconnect: false,
    allow_non_roster_messaging: true,
    discover_connection_methods: false,
    jid: localStorage.getItem('jid') ?? '27794915044@binu-test.m.in-app.io',
    loglevel: 'info',
    omemo_default: true,
    persistent_store: 'IndexedDB',
    password: localStorage.getItem('password') ?? 'UOfxZIiIds',
    whitelisted_plugins: ['converse-omemo'],
};

async function init() {
    console.log('INIT');
    // await import('../../src/headless/dist/converse-headless.js');
    let converseModule = window.converse;
    let { converse, _converse, api } = converseModule;
    console.log(configObject);
    converse.initialize(configObject);
}

function handleUI(obj) {
    let { jid, password, websocket_url } = obj;
    let jidInput = document.getElementById('jid');
    let passwordInput = document.getElementById('password');
    let ws_url = document.getElementById('ws_url');
    if (jid) {
        jidInput.value = jid;
    }
    if (password) {
        passwordInput.value = password;
    }
    if (websocket_url) {
        ws_url.value = websocket_url;
    }
    let mainThreadBtn = document.getElementById('mainThreadBtn');
    let workerThreadBtn = document.getElementById('workerThreadBtn');
    let clearStoreBtn = document.getElementById('clearStore');
    if (clearStoreBtn) {
        clearStoreBtn.addEventListener('click', () => {
            [sessionStorage, localStorage].forEach((storage) => {
                storage.clear();
            });
        });
    }

    function updateConfig() {
        configObject.jid = jidInput.value;
        configObject.password = passwordInput.value;
        configObject.websocket_url = ws_url.value;
        localStorage.setItem('jid', jidInput.value);
        localStorage.setItem('password', passwordInput.value);
        localStorage.setItem('ws_url', ws_url.value);
        console.log('UPDATED', password, passwordInput.value);
    }
    if (mainThreadBtn) {
        mainThreadBtn.addEventListener('click', () => {
            updateConfig();
            window.main();
        });
    }
    if (workerThreadBtn) {
        workerThreadBtn.addEventListener('click', () => {
            updateConfig();
            window.thread();
        });
    }
}

window.main = () => {
    // sessionStorage.clear();
    // localStorage.clear();
    init();
};
window.thread = () => {
    myWorker = new Worker('./worker.js');
    window.worker = myWorker;
    myWorker.postMessage(configObject);
};
// let mainThread = true;
// mainThread=false;
// if(mainThread){
//     init()
// }
// else{
//     var myWorker = new Worker('./worker.js', );
// }

// converse.initialize({
//     websocket_url: 'wss://xmpp.systest.moya.app:5443/ws', // Please use this connection manager only for testing purposes
//     view_mode: 'fullscreen',
//     auto_login: true,
//     auto_reconnect: false,
//     jid: '123@test.com',
//     password: 'pass',
// })

document.addEventListener('DOMContentLoaded', () => {
    handleUI(configObject);
});
