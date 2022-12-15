const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const bcrypt = require("bcryptjs");
const saltRounds = 10;

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 8000;

const pool = new Pool({
  user: "monika",
  host: "dpg-cect7fqrrk0dhqqi5afg-a",
  database: "facerecognition_f4bi",
  password: "WCda5E6FHruiCbxCeGKydlvo9H1pxpIZ",
  port: 5432,
});

app.get("/", (req, res, next) => {
  pool
    .query("select * FROM users")
    .then((result) => res.send(result.rows))
    .catch((err) => {
      res.status(500).json(err);
    });
});

app.post("/signIn", (req, res) => {
  const { email, password } = req.body;
  console.log(email, password);
  pool
    .query("SELECT * FROM users WHERE email=$1", [email])
    .then((result) => {
      console.log(result.rows[0].password);
      bcrypt.compare(
        password,
        result.rows[0].password,
        async function (err, isValid) {
          if (isValid) {
            res.send(result.rows);
          } else {
            res.send([]);
          }
        }
      );
    })
    .catch((err) => {
      res.status(500).json(err);
    });
});

app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  pool
    .query("INSERT INTO users(fullname, email, password) VALUES($1, $2, $3)", [
      name,
      email,
      hashedPassword,
    ])
    .then(res.status(400).json("user added"))
    .catch((err) => {
      res.status(500).json(err);
    });
});

app.put("/entries", (req, res) => {
  const { id } = req.body;
  pool
    .query("SELECT * FROM users WHERE id=$1", [id])
    .then((user) => {
      const prevEntryCount = user.rows[0].entries;
      pool
        .query(`UPDATE users SET entries=${prevEntryCount + 1} WHERE id=${id}`)
        .then(() => {
          res.send(user.rows[0]);
        });
    })

    .catch((err) => {
      res.status(400).json(err);
    });
});

app.listen(PORT, () => console.log(`app is running in port ${PORT}`));
