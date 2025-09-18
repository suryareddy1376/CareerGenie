/**
 * Authentication Middleware for CareerGenie
 * Validates Firebase ID tokens and provides user context
 */

const { auth } = require('../config/firebase');

/**
 * Middleware to verify Firebase ID token
 * Adds user information to req.user if valid
 */
const verifyToken = async (req, res, next) => {
  try {
    console.log('🔐 Verifying authentication token...');
    
    // Extract Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      console.log('❌ No Authorization header provided');
      return res.status(401).json({ 
        error: 'Unauthorized', 
        message: 'No authorization header provided',
        code: 'NO_AUTH_HEADER'
      });
    }

    if (!authHeader.startsWith('Bearer ')) {
      console.log('❌ Invalid Authorization header format');
      return res.status(401).json({ 
        error: 'Unauthorized', 
        message: 'Invalid authorization header format. Use: Bearer <token>',
        code: 'INVALID_AUTH_FORMAT'
      });
    }

    // Extract the ID token
    const idToken = authHeader.split('Bearer ')[1];
    
    if (!idToken || idToken.trim() === '') {
      console.log('❌ Empty or missing ID token');
      return res.status(401).json({ 
        error: 'Unauthorized', 
        message: 'No valid token provided',
        code: 'EMPTY_TOKEN'
      });
    }

    // Verify the ID token with Firebase Admin
    const decodedToken = await auth.verifyIdToken(idToken, true); // checkRevoked = true
    
    // Add user information to request object
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      name: decodedToken.name || decodedToken.display_name,
      emailVerified: decodedToken.email_verified,
      picture: decodedToken.picture,
      provider: decodedToken.firebase.sign_in_provider,
      authTime: decodedToken.auth_time,
      iat: decodedToken.iat,
      exp: decodedToken.exp
    };
    
    console.log(`✅ Token verified successfully for user: ${req.user.email} (${req.user.uid})`);
    
    // Continue to next middleware
    next();
    
  } catch (error) {
    console.error('❌ Token verification failed:', error.message);
    
    // Handle specific Firebase Auth errors
    let errorResponse = {
      error: 'Unauthorized',
      message: 'Invalid or expired token',
      code: 'TOKEN_VERIFICATION_FAILED'
    };

    if (error.code === 'auth/id-token-expired') {
      errorResponse.message = 'Token has expired. Please sign in again.';
      errorResponse.code = 'TOKEN_EXPIRED';
    } else if (error.code === 'auth/id-token-revoked') {
      errorResponse.message = 'Token has been revoked. Please sign in again.';
      errorResponse.code = 'TOKEN_REVOKED';
    } else if (error.code === 'auth/invalid-id-token') {
      errorResponse.message = 'Invalid token format or signature.';
      errorResponse.code = 'INVALID_TOKEN';
    } else if (error.code === 'auth/user-disabled') {
      errorResponse.message = 'User account has been disabled.';
      errorResponse.code = 'USER_DISABLED';
    }

    return res.status(401).json(errorResponse);
  }
};

/**
 * Optional middleware to verify token but continue if not present
 * Useful for routes that work for both authenticated and non-authenticated users
 */
const optionalVerifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // No token provided, continue without user context
      req.user = null;
      return next();
    }

    const idToken = authHeader.split('Bearer ')[1];
    
    if (!idToken || idToken.trim() === '') {
      req.user = null;
      return next();
    }

    // Try to verify token
    const decodedToken = await auth.verifyIdToken(idToken, true);
    
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      name: decodedToken.name || decodedToken.display_name,
      emailVerified: decodedToken.email_verified,
      picture: decodedToken.picture,
      provider: decodedToken.firebase.sign_in_provider
    };
    
    console.log(`✅ Optional token verified for user: ${req.user.email}`);
    
  } catch (error) {
    // Token verification failed, but continue without user context
    console.log('⚠️ Optional token verification failed, continuing without auth');
    req.user = null;
  }
  
  next();
};

/**
 * Middleware to check if user has required roles/permissions
 * Usage: checkRole(['admin', 'moderator'])
 */
const checkRole = (requiredRoles = []) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'Authentication required',
          code: 'AUTH_REQUIRED'
        });
      }

      // Get user's custom claims (roles) from Firebase
      const userRecord = await auth.getUser(req.user.uid);
      const customClaims = userRecord.customClaims || {};
      const userRoles = customClaims.roles || [];

      // Check if user has any of the required roles
      const hasRequiredRole = requiredRoles.some(role => userRoles.includes(role));

      if (!hasRequiredRole && requiredRoles.length > 0) {
        console.log(`❌ Access denied for user ${req.user.email}. Required roles: ${requiredRoles.join(', ')}`);
        return res.status(403).json({
          error: 'Forbidden',
          message: `Access denied. Required roles: ${requiredRoles.join(', ')}`,
          code: 'INSUFFICIENT_PERMISSIONS'
        });
      }

      console.log(`✅ Role check passed for user: ${req.user.email}`);
      next();

    } catch (error) {
      console.error('❌ Role check error:', error);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to verify user permissions'
      });
    }
  };
};

/**
 * Middleware to ensure the authenticated user can only access their own data
 * Compares req.user.uid with req.params.userId or req.body.userId
 */
const ensureOwnership = (userIdField = 'userId') => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'Authentication required',
          code: 'AUTH_REQUIRED'
        });
      }

      // Get user ID from params, body, or query
      const requestedUserId = req.params[userIdField] || 
                             req.body[userIdField] || 
                             req.query[userIdField];

      if (!requestedUserId) {
        return res.status(400).json({
          error: 'Bad Request',
          message: `Missing ${userIdField} parameter`,
          code: 'MISSING_USER_ID'
        });
      }

      // Check if the authenticated user is trying to access their own data
      if (req.user.uid !== requestedUserId) {
        console.log(`❌ Ownership check failed: ${req.user.uid} tried to access ${requestedUserId}`);
        return res.status(403).json({
          error: 'Forbidden',
          message: 'You can only access your own data',
          code: 'ACCESS_DENIED'
        });
      }

      console.log(`✅ Ownership verified for user: ${req.user.email}`);
      next();

    } catch (error) {
      console.error('❌ Ownership check error:', error);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to verify data ownership'
      });
    }
  };
};

/**
 * Middleware to log authentication events
 */
const logAuth = (req, res, next) => {
  const timestamp = new Date().toISOString();
  const ip = req.ip || req.connection.remoteAddress;
  const userAgent = req.get('User-Agent');
  
  if (req.user) {
    console.log(`🔍 [${timestamp}] Authenticated request: ${req.user.email} (${req.user.uid}) - ${req.method} ${req.originalUrl} from ${ip}`);
  } else {
    console.log(`🔍 [${timestamp}] Unauthenticated request: ${req.method} ${req.originalUrl} from ${ip}`);
  }
  
  next();
};

module.exports = { 
  verifyToken, 
  optionalVerifyToken, 
  checkRole, 
  ensureOwnership, 
  logAuth 
};
