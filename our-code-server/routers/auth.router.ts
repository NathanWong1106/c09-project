import {
  Strategy as GoogleStrategy,
  VerifyCallback,
} from "passport-google-oauth20";
import passport, { Profile } from "passport";
import { Router } from "express";
import UserSession from "../interfaces/sessions/userSession.interface";
import { createUser, getUserByEmail, getUserById } from "../db/userdb.util";
import { isAuthenticated } from "../middleware/auth.middleware";

const verify = async (
  accessToken: string,
  refreshToken: string, // UNUSED - no need for this yet?
  profile: Profile,
  done: VerifyCallback
) => {
  const email = profile.emails?.[0].value;
  if (!email) {
    return done(null, false, { message: "No email found" });
  }

  let user = await getUserByEmail(email);
  if (!user) {
    user = await createUser(email);
  }

  const userSession: UserSession = {
    id: user.id,
    email: user.email,
    accessToken,
  };

  // Store user in session cookie
  return done(null, userSession);
};

// Google OAuth2.0 Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      callbackURL: "http://localhost:3000/auth/google/callback", 
      scope: ["email", "profile"],
    },
    verify
  )
);

// On login success, store user in session cookie
passport.serializeUser((user, done) => {
  const userSess = user as UserSession;
  done(null, userSess);
});

// On logout, remove user from session cookie
passport.deserializeUser((user: UserSession, done) => {
  done(null, user);
});

const authRouter = Router();

/**
 * This route initiates the Google OAuth2.0 flow
 * by redirecting the user (Resource owner) to Google's sign in screen
 * 
 * The authorization grant will then be redirected to the next route
 * at /auth/google/callback
 */
authRouter.get(
  "/google",
  passport.authenticate("google", { scope: ["email", "profile"] })
);

/**
 * This route is called by Google after the user has signed in
 * and authorized the application to access their profile. 
 * 
 * Here we send an authorization grant to Google along with our
 * client secret. Google will then send back the user's profile.
 * 
 * If the user is not found in the database, they are created.
 * Then the user's profile is stored in the session cookie.
 * See details in the verify function above.
 * 
 * We redirect the user to the home page after this.
 */
authRouter.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login",
    failureMessage: true,
  }),
  (req, res) => {
    res.redirect("/");
  }
);

/**
 * Logout the current user if authenticated
 */
authRouter.get("/logout", isAuthenticated, (req, res, next) => {
  req.logout((err) => {
    return next(err);
  });
  res.redirect("/");
});

/**
 * Return the current user if authenticated
 */
authRouter.get("/me", isAuthenticated, (req, res) => {
  res.json(req.user);
});

export default authRouter;
