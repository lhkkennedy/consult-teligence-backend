import { describe, it, expect } from '@jest/globals';
import consultantService from '../src/api/consultant/services/consultant';

describe('consultant service', () => {
  it('should be defined', () => {
    expect(consultantService).toBeDefined();
  });
});