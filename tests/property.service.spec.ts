import { describe, it, expect } from '@jest/globals';
import propertyService from '../src/api/property/services/property';

describe('property service', () => {
  it('should be defined', () => {
    expect(propertyService).toBeDefined();
  });
});