export class ChatInfo {
  name: string;
  host: string;
  modes: string;
  prefix: string;
  // TODO: add more data
  type: 'public' | 'private' = 'private';

  constructor(prefix: string) {
    this.name = this.prefix = prefix;
    if (prefix.indexOf('!') !== -1) {
      [this.name, this.host] = prefix.split('!');
    }
    if (this.name.startsWith('#')) {
      this.type = 'public';
    }
  }
}
