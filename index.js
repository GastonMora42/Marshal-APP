const express = require("express");
const app = express();
const mysql = require("mysql");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");

const cors = require("cors");

//Importamos Base de Datos
const db = require("./db/db");

app.use(cors());
app.use(cookieParser());

//Para procesar datos enviados por formularios
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Render de vistas
app.get("/", (req, res) => {
  res.render("index");
});

//Seteamos motro de plantillas
app.set("view engine", "ejs");

//Seteamos carpeta public
app.use(express.static(__dirname + "/public"));

//Seteamos variables de entorno
dotenv.config({ path: "./env.env" });

//Usamos cookies
app.use(cookieParser());

//Llamar al router
app.use("/", require("./routes/router"));

app.post("/create", (req, res) => {
  const usuario = req.body.usuario;
  const marca = req.body.marca;
  const alcanze = req.body.alcanze;
  const rol = req.body.rol;
  const años = req.body.años;
  const objetivos = req.body.objetivos;

  db.query(
    "INSERT INTO usuarios (usuario, marca, alcanze, rol, años, objetivos) VALUES (?,?,?,?,?,?)",
    [usuario, marca, alcanze, rol, años, objetivos],
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        res.send("Usuario creado exitosamente");
      }
    }
  );
});

app.get("/usuarios", (req, res) => {
  db.query("SELECT * FROM usuarios", (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.send(result);
    }
  });
});

//Para eliminar el cache del navegador y que no se pueda volver con el boton back despues de hacer logout
app.use(function (req, res, next) {
  if (!req.email)
    res.header("Cache-Control", "private, no-cache, no-store, must-revalidate");
  next();
});

app.listen(3000, () => {
  console.log("El servidor esta corriendo en el puerto 3000");
});
