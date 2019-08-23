import { Component, OnInit } from '@angular/core';
import { SettingsModel } from './models/SettingsModel';
import { StateModel } from './models/StateModel';
import { LogModel } from './models/LogModel';
import { EntryModel } from './models/EntryModel';
import crypto from 'crypto-browserify';

@Component({
  selector: 'app-example',
  templateUrl: './example.component.html',
  styleUrls: ['./example.component.sass'],
  providers: []
})
export class ExampleComponent implements OnInit {

  settings: SettingsModel = new SettingsModel(
    3,
    {
      min: 100,
      max: 150
    },
    50,
    {
      heartbeat: 100
    });
  workers: Worker[];
  workerStates: StateModel[];
  log: LogModel = new LogModel();
  getLog: LogModel = new LogModel();
  getLogEntry: EntryModel = new EntryModel(
    null,
    null,
    null,
    {
      key: null,
      value: {
        nonce: null,
        value: null
      }
    }
  );

  private keys = [];

  ngOnInit() {
  }

  onPlay() {
    this.prepareKeys();
    this.initWorkers();
  }

  onAppend() {
    this.log.instance.postMessage({
      type: 'push',
      args: [this.log.key, {
        nonce: Date.now(),
        value: this.log.value
      }]
    });
  }

  onGetLog() {
    this.getLog.instance.postMessage({
      type: 'get_log',
      args: [this.getLog.index]
    });
  }

  private prepareKeys() {
    this.keys = [];
    for (let i = 0; i < this.settings.count; i++){
      const node = crypto.createECDH('secp256k1');
      node.generateKeys();
      this.keys.push({
        privateKey: node.getPrivateKey().toString('hex'),
        publicKey: node.getPublicKey('hex', 'compressed')
      });
    }
    console.log(this.keys)
  }

  private initWorkers() {

    if (this.workers && this.workers.length)
      for (const worker of this.workers)
        worker.terminate();

    this.workerStates = [];
    this.workers = this.keys.map((key, index) => {

      const worker = new Worker('assets/workers/mokkaWorker.js');

      worker.addEventListener('message', (e) => {
        if (e.data.type === 'packet')
          this.workers[e.data.args[0]].postMessage({type: 'packet', args: [e.data.args[1]]});
        if (e.data.type === 'info')
          this.workerStates[index] = new StateModel(e.data.args[0].index, e.data.args[0].hash, e.data.args[0].index.term);
        if (e.data.type === 'log') {
          console.log(e.data.args[0])
          this.getLogEntry = e.data.args[0] === null ?
            new EntryModel(null, null, null, {key: null, value: {nonce: null, value: null}}) :
            new EntryModel(e.data.args[0].index, e.data.args[0].hash, e.data.args[0].term, e.data.args[0].log);
        }
      }, false);

      worker.postMessage({type: 'init', args: [index, this.keys, this.settings]});
      this.workerStates.push(new StateModel(0, ''.padStart(32, '0'), 0));
      return worker;
    });

    this.log = new LogModel("", "", 0, this.workers[0]);
    this.getLog = new LogModel("", "", 0, this.workers[0]);
  }


}
