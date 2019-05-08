export class LogModel {

  constructor(
    public key: string = "",
    public value: string = "",
    public index: number = 0,
    public instance: Worker = null
  ) {
  }

}
