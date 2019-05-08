export class EntryModel {

  constructor(
    public index: number,
    public hash: string,
    public term: number,
    public log: {
      key: string,
      value: {
        nonce: number,
        value: number
      }
    }
  ) {
  }

}
