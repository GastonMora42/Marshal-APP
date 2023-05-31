const express = require("express");
const router = express.Router();

const db = require ("../db/db");
// Home page route. Todas las rutas que empiecen con /, se manejan en este archivo

const authController = require("../controllers/authController");

//router para las vistas
router.get("/", (req, res) => {
  res.render("index");
});

router.get("/login", (req, res) => {
  res.render("login", {alert: false})
});

router.get("/register", (req, res) => {
  res.render("register");
});

router.get("/hub",authController.isAuthenticated, (req, res) => {
  res.render("hub", {email:req.email});
});



//Router para los metodos del controller
router.post("/register", authController.register)
router.post("/login", authController.login)
router.post("/hub", authController.login)
router.get("/logout", authController.logout)
module.exports = router;
