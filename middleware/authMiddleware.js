// Middleware to check if user is authenticated
export const requireAuth = (req, res, next) => {
  if (!req.session.user) {
    // User is not logged in, redirect to login
    return res.redirect('/auth/login');
  }
  // User is logged in, continue to the requested route
  next();
};

// Middleware to redirect logged-in users away from auth pages
export const redirectIfLoggedIn = (req, res, next) => {
  if (req.session.user) {
    // User is already logged in, redirect to dashboard
    return res.redirect('/books');
  }
  // User is not logged in, continue to auth page
  next();
};

// Middleware to make user data available in all templates
export const attachUser = (req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
};