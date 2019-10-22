export class IrcUser {
  prefix: string;
  name: string;
  mode: string;
  away: string;
  online = true;
  channels: {mode: string, flags: string} [] = [];
  constructor() {
    this.channels['private'] = {};
  }
}
