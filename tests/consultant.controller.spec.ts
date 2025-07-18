import { describe, it, expect } from '@jest/globals';
import consultantController from '../src/api/consultant/controllers/consultant';

describe('consultant controller', () => {
  it('should be defined', () => {
    expect(consultantController).toBeDefined();
  });
});