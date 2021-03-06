'use strict';

let userService = require('../services/user-service');
let sessionService = require('../services/session-service');
let buildMiddleware = require('../middleware/build-middleware');
let apiResultWrapper = require('../middleware/api-result-wrapper');
let encodePassword = require('../middleware/encode-password');

function getUserId(req, res, next) {
  req.userId = req.swagger.params.user_id.value;
  next();
}

/**
 * GET /users
 */
module.exports.queryUsers = buildMiddleware(
  require('../middleware/query-id'),
  require('../middleware/query-fields'),
  require('../middleware/query-pagination'),
  (req, res, next) => res.apiPromise(next, userService.queryUsers(req.query))
);

/**
 * POST /users
 */
module.exports.createUser = buildMiddleware(
  encodePassword('password', 'encoded_password'),
  apiResultWrapper('user'),
  (req, res, next) => res.apiPromise(next, userService.createUser(req.body))
);

/**
 * GET /users/:user_id
 */
module.exports.getUser = buildMiddleware(
  getUserId,
  require('../middleware/query-fields'),
  apiResultWrapper('user'),
  (req, res, next) => res.apiPromise(next, userService.getUser(req.userId, req.query.fields))
);


/**
 * DELETE /users/:user_id
 */
module.exports.deleteUser = buildMiddleware(
  getUserId,
  (req, res, next) => res.apiPromise(next, userService.deleteUser(req.userId))
);

/**
 * PATCH /users/:user_id
 */
module.exports.updateUser = buildMiddleware(
  getUserId,
  apiResultWrapper('user'),
  (req, res, next) => res.apiPromise(next, userService.updateUser(req.userId, req.body))
);

/**
 * PATCH /users/:user_id/password
 */
module.exports.updateUserPassword = buildMiddleware(
  getUserId,
  encodePassword('new_password', 'encoded_new_password'),
  (req, res, next) => res.apiPromise(next, userService.updateUserPassword(req.userId, req.body))
);

/**
 * GET /users/:user_id/sessions
 */
module.exports.getUserSessions = buildMiddleware(
  getUserId,
  apiResultWrapper('sessions'),
  (req, res, next) => {
    return res.apiPromise(next,
      userService.getUser(req.userId).then(user => sessionService.getUserSessions(user.id))
    );
  }
);

/**
 * DELETE /users/:user_id/sessions
 */
module.exports.deleteUserSessions = buildMiddleware(
  getUserId,
  (req, res, next) => {
    return res.apiPromise(next,
      userService.getUser(req.userId).then(user => sessionService.deleteUserSessions(user.id))
    );
  }
);

/**
 * POST /users/:user_id/sessions
 */
module.exports.createUserSession = buildMiddleware(
  getUserId,
  apiResultWrapper('session'),
  (req, res, next) => {
    return res.apiPromise(next,
      userService.getUser(req.userId).then(user => sessionService.createSession(user.id, req.body))
    );
  }
);
