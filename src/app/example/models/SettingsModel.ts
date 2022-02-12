export class SettingsModel {

  constructor(
    public crashModel: 'CFT' | 'BFT',
    public count: number,
    public heartbeat: number,
    public sessionExpiration: number,
    public electionTimeout: number
  ) {  }

}
