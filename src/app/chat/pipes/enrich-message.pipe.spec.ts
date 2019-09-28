import { EnrichMessage.TsPipe } from './enrich-message.ts.pipe';

describe('EnrichMessage.TsPipe', () => {
  it('create an instance', () => {
    const pipe = new EnrichMessage.TsPipe();
    expect(pipe).toBeTruthy();
  });
});
