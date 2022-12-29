'use strict';

process.env.SECRET = 'TEST_SECRET';

const bearer = require('./src/auth/middleware/bearer.js');
const { db, users } = require('./src/auth/models/index.js');
const jwt = require('jsonwebtoken');

let userData = {
  testUser: { username: 'user', password: 'password', role: 'admin' },
};

// Pre-load our database with fake users
beforeAll(async () => {
  await db.sync();
  await users.create(userData);
});
afterAll(async () => {
  await db.drop();
});

describe('Auth Middleware', () => {

  const req = {};
  const res = {
    status: jest.fn(() => res),
    send: jest.fn(() => res),
    json: jest.fn(() => res),
  };
  const next = jest.fn();

  describe('user authentication', () => {

    it('fails login for an admin with an invalid token', () => {

      req.headers = {
        authorization: 'Bearer invalidtoken',
      };

      return bearer(req, res, next)
        .then(() => {
          expect(next).not.toHaveBeenCalled();
          expect(res.status).toHaveBeenCalledWith(403);
        });

    });

    it('successful login for an admin user with a valid token', () => {

      const user = { username: 'admin' };
      const token = jwt.sign(user, process.env.SECRET);

      req.headers = {
        authorization: `Bearer ${token}`,
      };

      return bearer(req, res, next)
        .then(() => {
          expect(next).toHaveBeenCalledWith();
        });

    });
  });
});
