import { IpMiddleware } from './ip.middleware';

describe('IpMiddleware', () => {
  it('should be defined', () => {
    expect(new IpMiddleware()).toBeDefined();
  });
});
