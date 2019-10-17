export class SettingsModel {

  constructor(
    public count: number,
    public election: {
      max: number,
      min: number
    },
    public heartbeat: number,
    public gossip: {
      heartbeat: number
    }
  ) {  }

}
