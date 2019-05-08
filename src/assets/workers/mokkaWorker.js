const window = self;
importScripts('/assets/workers/web_bundle.js');

class BrowserMokka extends Mokka.Mokka {

  initialize () {
  }

  async write (address, packet) {
    self.postMessage({type: 'packet', args: [address, packet]});
  }

  connect () {
    this.initialize();
    super.connect();
  }

}

const init = (index, keys, settings) => {

  window.mokka = new BrowserMokka({
    address: `${index}/${keys[index].substring(64, 128)}`,
    electionMax: settings.election.max,
    electionMin: settings.election.min,
    gossipHeartbeat: 200,
    gossipTimeout: 200,
    heartbeat: settings.heartbeat,
    logger: {
      info: (text) => console.log(`worker#${index} ${text}`),
      error: (text) => console.log(`worker#${index} ${text}`),
      trace: (text) => console.log(`worker#${index} ${text}`)
    },
    privateKey: keys[index]
  });

  for (let i = 0; i < keys.length; i++)
    if (i !== index)
      window.mokka.nodeApi.join(`${i}/${keys[i].substring(64, 128)}`);

  window.mokka.connect();

  window.mokka.on('error', (err) => {
    console.log(err);
  });

  window.mokka.on('log', async (index)=>{
    const info = await window.mokka.getDb().getState().getInfo();
    self.postMessage({type: 'info', args: [info]});
  });

};

self.addEventListener('message', async function (e) {

  if (!e.data)
    return;

  if (e.data.type === 'init')
    return init(...e.data.args);

  if (e.data.type === 'packet')
    window.mokka.emit('data', e.data.args[0]);

  if (e.data.type === 'push') {
    window.mokka.logApi.push(...e.data.args);
    const info = await window.mokka.getDb().getState().getInfo();
    self.postMessage({type: 'info', args: [info]});
  }

  if (e.data.type === 'info'){
    const info = await window.mokka.getDb().getState().getInfo();
    self.postMessage({type: 'info', args: [info]});
  }

  if(e.data.type === 'get_log'){
    const log = await window.mokka.getDb().getEntry().get(e.data.args[0]);
    self.postMessage({type: 'log', args: [log]});
  }

}, false);
