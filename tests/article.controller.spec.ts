import { describe, it, expect } from '@jest/globals';
import articleController from '../src/api/article/controllers/article';

describe('article controller', () => {
  it('should be defined', () => {
    expect(articleController).toBeDefined();
  });
});