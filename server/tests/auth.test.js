import test from 'node:test';
import assert from 'node:assert/strict';
import { generateToken, verifyToken, hashPassword, verifyPassword } from '../middleware/authMiddleware.js';

test('Auth Security - Cryptographic Password Hashing & Verification', () => {
  const password = 'SecurePassword123!';
  const { hash, salt } = hashPassword(password);
  
  assert.ok(hash, 'Hash should be generated');
  assert.ok(salt, 'Salt should be generated');
  assert.strictEqual(verifyPassword(password, hash, salt), true, 'Correct password must verify successfully');
  assert.strictEqual(verifyPassword('WrongPassword', hash, salt), false, 'Incorrect password must be rejected');
});

test('Auth Security - Signed JWT Token Generation & Verification', () => {
  const sampleUser = {
    userId: 'usr-test-12345',
    email: 'testbuyer@havenmatch.ai',
    name: 'Test Buyer',
    role: 'BUYER'
  };

  const token = generateToken(sampleUser);
  assert.ok(token.startsWith('hm_'), 'Token should have hm_ prefix');

  const decoded = verifyToken(token);
  assert.ok(decoded, 'Token should decode successfully');
  assert.strictEqual(decoded.userId, sampleUser.userId, 'Decoded userId must match');
  assert.strictEqual(decoded.email, sampleUser.email, 'Decoded email must match');
  assert.strictEqual(decoded.role, 'BUYER', 'Decoded role must match');
});
