import { Component, OnInit } from '@angular/core';
import { SettingsModel } from './models/SettingsModel';
import { StateModel } from './models/StateModel';
import crypto from 'crypto-browserify';
import NodeStates from 'mokka/dist/consensus/constants/NodeStates';
import _ from 'lodash';

@Component({
  selector: 'app-example',
  templateUrl: './example.component.html',
  styleUrls: ['./example.component.sass'],
  providers: []
})
export class ExampleComponent implements OnInit {

  settings: SettingsModel = new SettingsModel(3, 500, 60000, 1000);
  workers: Worker[];
  workerStates: StateModel[];

  private keys = [];

  ngOnInit() {
  }

  onPlay() {
    this.prepareKeys();
    this.initWorkers();
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

      const invertedStates = _.invert(NodeStates);

      worker.addEventListener('message', (e) => {
        if (e.data.type === 'packet')
          this.workers[e.data.args[0]].postMessage({type: 'packet', args: [e.data.args[1]], id: e.data.id});
        if (e.data.type === 'info')
          this.workerStates[index] = new StateModel(invertedStates[e.data.args[0].state], e.data.args[0].term);
      }, false);


      worker.postMessage({type: 'init', args: [index, this.keys, this.settings]});
      this.workerStates.push(new StateModel(invertedStates[0], 0));
      return worker;
    });
  }


}
