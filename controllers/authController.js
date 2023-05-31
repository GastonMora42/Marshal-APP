const jwt = require("jsonwebtoken");
const bcryptjs = require("bcryptjs");
const conexion = require("../db/db.js");
const { promisify } = require("util");
const { compileFunction } = require("vm");
require("dotenv").config();

//Metodo para registrarse
exports.register = async (req, res) => {
  try {
    const name = req.body.name;
    const lastname = req.body.lastname;
    const user = req.body.user;
    const password = req.body.password;
    const email = req.body.email;
    const celular = req.body.celular;

    const passHash = await bcryptjs.hash(password, 8);

    conexion.query(
      "INSERT INTO users SET ?",
      {
        name: name,
        lastname: lastname,
        user: user,
        password: passHash,
        email: email,
        celular: celular,
      },
      (error, results) => {
        if (error) {
          console.log("Ocurrio un error" + error);
        }
        res.redirect("/hub");
      }
    );
  } catch (error) {
    console.log(error);
  }
};

exports.login = async (req, res) => {
  try {
    const email = req.body.email;
    const user = req.body.user;
    const password = req.body.password;

    if (!email || !password) {
      res.render("login", {
        alert: true,
        alertMessage: "Por favor ingrese todos los datos",
        alertTitle: "Advertencia",
        alertIcon: "info",
        showConfirmButton: true,
        timer: false,
        ruta: "login",
      });
    } else {
      conexion.query(
        "SELECT * FROM users WHERE email = ?",
        [email],
        async (error, results) => {
          if (
            results.length == 0 ||
            !(await bcryptjs.compare(password, results[0].password))
          ) {
            res.render("login", {
              alert: true,
              alertMessage: "Por favor ingrese todos los datos",
              alertTitle: "Oups",
              alertIcon: "info",
              showConfirmButton: true,
              timer: false,
              ruta: "login",
            });
          } else {
            //inicio de seision OK
            const id = results[0].id;
            const token = jwt.sign({ id: id }, "shhhhh", {
              expiresIn: "7d",
            });
            console.log("token" + token + "para el usuario:" + email);

            const cookies = {
              expires: new Date(Date.now() + 5 * 1000),
              httpOnly: true,
            };
            res.cookie("jwt", token, cookies);
            res.redirect("/hub")
            res.render("hub", {
              email: req.email,
              alert: true,
              alertMessage: "Conexion exitosa",
              alertTitle: "Iniciaste sesion correctamente",
              alertIcon: "success",
              showConfirmButton: false,
              timer: 800,
              ruta: "hub",
            });
          }
        }
      );
    }
  } catch (error) {
    console.log(error);
  }
};

exports.isAuthenticated = async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      const decodificada = await promisify(jwt.verify)(
        req.cookies.jwt,
        "shhhhh"
      );
      conexion.query("SELECT * FROM users WHERE id = ?", [decodificada.id], (error, results) => {
        if(!results){return next()}
        req.user = results[0];
        return next();
      })
    } catch (error) {
      console.log(error);
      return next();
    }
  }else{
    res.redirect("/hub")
  }
};

exports.logout = (req, res) => {
  res.clearCookie("jwt");
  return res.redirect("/");
};
