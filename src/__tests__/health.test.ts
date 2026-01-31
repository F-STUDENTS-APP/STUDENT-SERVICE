import request from 'supertest';
import app from '../app';

describe('Student Service Health Check', () => {
  it('should return 200 and correct response', async () => {
    const response = await request(app).get('/health');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', 'UP');
    expect(response.body).toHaveProperty('service');
    expect(response.body).toHaveProperty('timestamp');
  });

  it('should have valid timestamp', async () => {
    const response = await request(app).get('/health');

    const timestamp = new Date(response.body.timestamp);
    expect(timestamp).toBeInstanceOf(Date);
    expect(timestamp.getTime()).toBeLessThanOrEqual(Date.now());
  });

  it('should return service name', async () => {
    const response = await request(app).get('/health');

    expect(response.body.service).toBeTruthy();
    expect(typeof response.body.service).toBe('string');
  });
});
