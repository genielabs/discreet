export class IrcUser {
  prefix: string;
  name: string;
  mode: string;
  away: string;
  whois: any = {};
  version: string;
  online = true;
  channels: {mode: string, flags: string} [] = [];
  constructor() {
    // this is used to store private chat data like chatUser playlists
    this.channels['private'] = {};
  }
}
