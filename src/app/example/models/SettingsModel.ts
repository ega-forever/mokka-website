export class SettingsModel {

  constructor(
    public count: number,
    public heartbeat: number,
    public sessionExpiration: number,
    public electionTimeout: number
  ) {  }

}
