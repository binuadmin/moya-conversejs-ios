async function init(configObject) {
    var hasError = false;
    try {
        //Set constants
        self.window = self;
        //End Set constants

        //Manually load scripts
        if (false) {
            //Load scripts
            await importScripts('/src/headless/utils/libsignal-protocol.min.js');
            await importScripts('/src/headless/utils/webworker/xmlw3cdom.js');
            await importScripts('/src/headless/utils/webworker/xmlsax.js');
            //End of Load Scripts
        }
        else{
        //Or can set script folder
        self.userProvidedScriptsPath = '/src/headless/utils';
        //End script folder
        }

        console.log('%cImportted xmlw3cdom.js', 'color: green; font-size: 20px');
        //Load manaual compatibility scripts
        await import('../../src/headless/utils/webworker/webworker-compatibility.js').then(async (module)=>{
            let prepare = module.default
            return await prepare();
        });
        //End of Load manaual compatibility scripts
    } catch (e) {
        hasError = true;
        console.log('ERROR');
        // console.log('Something went wrong', e);
        return;
    } finally {
        if (hasError) return;
        console.log(hasError);

        //Now We can load the main script
        importScripts('/src/headless/dist/converse-headless.js');
        //End of loading main script
        setTimeout(()=>{
            console.log("WINDOW . Converse", window.converse);
        }, 1000)
        //Converse initialization:
        let converseModule = window.converse;
        let { converse, _converse, api } = converseModule;

        converse.initialize(configObject);
    }
}
// init();
onmessage = async function (e) {
    console.log("DATA",e.data);
    if(e.data.jid && e.data.password)
    {
    return init(e.data)
    }   
    let _c = window.converse._converse;
    let chat = await _c.api.chats.open('4917692171798@binu-test.m.in-app.io');
    console.log(chat);
    let res = await chat.sendMessage({body:'Hello'});
    console.log(res);


};
