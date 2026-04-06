import express from "express";
import { getUserInfo, loginController, registerController } from "../controllers/User.js";
import { isAdmin, requireSignIn } from "../middlewares/Auth.js";

const app = express.Router();

app.post('/register', registerController)
app.post('/login', loginController)
app.get('/user', getUserInfo);

//protected User route auth
app.get("/user-auth", requireSignIn, (req, res) => {
  res.status(200).send({ ok: true });
});
//protected Admin route auth
app.get("/admin-auth", requireSignIn, isAdmin, (req, res) => {
  res.status(200).send({ ok: true });
});

export default app;