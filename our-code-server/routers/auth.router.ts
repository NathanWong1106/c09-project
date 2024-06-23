import { Router } from "express";
import { createUser, getUserByEmail } from "../db/userdb.util";
import UserSession from "../interfaces/sessions/userSession.interface";
import GoogleUser from "../interfaces/google/googleUser.interface";
import { isAuthenticated } from "../middleware/auth.middleware";

const authRouter = Router();

authRouter.post("/login", async (req, res) => {
  if (!req.body.token) {
    return res.status(400).json({ error: "Missing code" });
  }

  const data = await fetch(
    `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${req.body.token}`
  );

  const gUserInfo: GoogleUser = await data.json() as GoogleUser;
  let dbUser = await getUserByEmail(gUserInfo.email);
  
  if (dbUser === null) {
    dbUser = await createUser(gUserInfo.email)
  }

  const userSess: UserSession = {
    id: dbUser.id,
    email: gUserInfo.email,
    name: gUserInfo.name,
    picture: gUserInfo.picture,
  };

  req.session.user = userSess;
  console.log(req.session.user);

  return res.status(200).json({ user: userSess });
});

authRouter.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: "Failed to logout" });
    }

    return res.status(200).json({ message: "Logged out" });
  });
});

authRouter.get("/me", isAuthenticated, (req, res) => {
  return res.status(200).json({ user: req.session.user });
});

export default authRouter;
