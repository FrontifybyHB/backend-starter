/**
 * Auth Validator Test
 * Purpose: Verify authentication schemas sanitize and reject invalid input.
 */
import {
  loginSchema,
  registerSchema,
} from '../src/validators/auth.validator.js';

describe('auth validators', () => {
  it('normalizes register email and trims string fields', () => {
    const result = registerSchema.validate({
      username: ' himanshu_1 ',
      name: ' Himanshu ',
      email: ' HIMANSHU@example.COM ',
      password: 'StrongPass1!',
      ignored: true,
    }, { stripUnknown: true });

    expect(result.error).toBeUndefined();
    expect(result.value.email).toBe('himanshu@example.com');
    expect(result.value.username).toBe('himanshu_1');
    expect(result.value.name).toBe('Himanshu');
    expect(result.value.ignored).toBeUndefined();
  });

  it('rejects weak login payloads', () => {
    const result = loginSchema.validate({
      email: 'not-an-email',
      password: 'short',
    });

    expect(result.error).toBeDefined();
  });
});
