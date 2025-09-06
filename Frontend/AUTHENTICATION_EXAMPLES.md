# Firebase Authentication Testing Examples

## Testing the Authentication System

### 1. AuthContext Usage Examples

```javascript
import { useAuth } from '../contexts/AuthContext';

function MyComponent() {
  const { 
    currentUser, 
    authLoading, 
    signIn, 
    signUp, 
    signInWithGoogle, 
    logout 
  } = useAuth();

  // Check if user is authenticated
  if (currentUser) {
    console.log('User is logged in:', currentUser.email);
  }

  // Example: Sign in with email/password
  const handleLogin = async () => {
    try {
      await signIn('user@example.com', 'password123');
      // User will be redirected automatically
    } catch (error) {
      // Error handling is done in AuthContext with toast notifications
      console.error('Login failed:', error);
    }
  };

  // Example: Sign up new user
  const handleSignUp = async () => {
    try {
      await signUp('newuser@example.com', 'password123', 'John Doe');
      // User will be redirected to dashboard
    } catch (error) {
      console.error('Sign up failed:', error);
    }
  };

  // Example: Google Sign-in
  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      // User will be redirected to dashboard
    } catch (error) {
      console.error('Google sign in failed:', error);
    }
  };

  return (
    <div>
      {authLoading && <p>Loading...</p>}
      {currentUser ? (
        <div>
          <p>Welcome, {currentUser.displayName || currentUser.email}!</p>
          <button onClick={logout}>Sign Out</button>
        </div>
      ) : (
        <div>
          <button onClick={handleLogin}>Sign In</button>
          <button onClick={handleSignUp}>Sign Up</button>
          <button onClick={handleGoogleSignIn}>Sign In with Google</button>
        </div>
      )}
    </div>
  );
}
```

### 2. Protected Route Examples

```javascript
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Simple Protected Route
function ProtectedRoute({ children }) {
  const { currentUser, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  
  return currentUser ? children : <Navigate to="/login" />;
}

// Protected Route with Redirect Back
function ProtectedRouteWithRedirect({ children }) {
  const { currentUser, loading } = useAuth();
  const location = useLocation();
  
  if (loading) return <div>Loading...</div>;
  
  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  return children;
}

// Role-based Protected Route
function RoleProtectedRoute({ children, requiredRole }) {
  const { currentUser, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  
  if (!currentUser) {
    return <Navigate to="/login" />;
  }
  
  // Check user role (you'd get this from Firestore)
  if (currentUser.role !== requiredRole) {
    return <Navigate to="/unauthorized" />;
  }
  
  return children;
}
```

### 3. User Data Structure in Firestore

When a user signs up or signs in, the following document is created in Firestore:

```javascript
// Collection: users
// Document ID: user.uid
{
  uid: "firebase-user-uid",
  displayName: "John Doe",
  email: "john@example.com",
  photoURL: "https://lh3.googleusercontent.com/...", // Only for Google users
  createdAt: Timestamp,
  lastLoginAt: Timestamp,
  profileCompleted: false,
  assessmentCompleted: false
}
```

### 4. Error Handling Examples

The AuthContext automatically handles errors and shows toast notifications for:

- **Email already in use** during sign up
- **Wrong password** during sign in
- **User not found** for non-existent emails
- **Weak password** (less than 6 characters)
- **Invalid email** format
- **Popup blocked** for Google sign-in
- **Network errors** and Firebase errors

### 5. Loading States

```javascript
function LoginForm() {
  const { authLoading } = useAuth();

  return (
    <button disabled={authLoading}>
      {authLoading ? (
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          Signing in...
        </div>
      ) : (
        'Sign In'
      )}
    </button>
  );
}
```

### 6. User Session Persistence

Firebase automatically persists user sessions across browser refreshes and tabs. The AuthContext listens for auth state changes and updates the UI accordingly.

### 7. Sign Out Example

```javascript
function SignOutButton() {
  const { logout } = useAuth();

  const handleSignOut = async () => {
    try {
      await logout();
      // User will be redirected to home page
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  return <button onClick={handleSignOut}>Sign Out</button>;
}
```

### 8. Password Reset Example

```javascript
function ForgotPasswordForm() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');

  const handleResetPassword = async (e) => {
    e.preventDefault();
    try {
      await resetPassword(email);
      // Success toast will be shown automatically
    } catch (error) {
      // Error toast will be shown automatically
      console.error('Password reset failed:', error);
    }
  };

  return (
    <form onSubmit={handleResetPassword}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email"
        required
      />
      <button type="submit">Reset Password</button>
    </form>
  );
}
```

## Testing Checklist

### Authentication Flow Testing
- [ ] User can register with email/password
- [ ] User can sign in with email/password
- [ ] User can sign in with Google
- [ ] User can reset password
- [ ] User can sign out
- [ ] User session persists across page refreshes
- [ ] User is redirected to dashboard after successful login
- [ ] User is redirected to login when accessing protected routes
- [ ] User is redirected back to intended page after login

### Error Handling Testing
- [ ] Proper error messages for invalid email
- [ ] Proper error messages for weak password
- [ ] Proper error messages for wrong password
- [ ] Proper error messages for non-existent user
- [ ] Proper error messages for email already in use
- [ ] Network error handling

### UI/UX Testing
- [ ] Loading states during authentication
- [ ] Proper form validation
- [ ] Toast notifications for success/error
- [ ] Responsive design on mobile
- [ ] Password visibility toggle works
- [ ] Remember me functionality (browser level)

### Firestore Integration Testing
- [ ] User document created on registration
- [ ] User document updated on login
- [ ] lastLoginAt timestamp updated
- [ ] Profile completion status tracked
