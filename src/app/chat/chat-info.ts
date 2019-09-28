export class ChatInfo {
  name: string;
  host: string;
  modes: string;
  prefix: string;
  // TODO: add more data

  constructor(prefix: string) {
    this.name = this.prefix = prefix;
    if (prefix.indexOf('!') !== -1) {
      [this.name, this.host] = prefix.split('!');
    }
  }
}
