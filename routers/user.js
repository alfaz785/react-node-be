const { Router } = require("express");
const con = require("../connection/sqlDB");
const {
  handelHashingPassword,
  handleGenerateAuthToken,
  handleVerifyAuthToken,
  handleVerifyPassword,
  handleHashingPassword,
} = require("../controller/userFun");
const router = Router();

// GET METHOD -----------------------------

router.get("/users", (req, res) => {
  const getQuery = "SELECT * FROM registration_user";

  con.query(getQuery, (err, result) => {
    if (err) throw res.status(500).send("Server Error");
    res.json(result);
  });
});

// POST METHOD --------------------------------

router.post("/add-user", (req, res) => {
  const { fullName, email, password } = req.body;
  const { hashPassword, salt } = handleHashingPassword(password);

  const insertQuery = `INSERT INTO registration_user (fullName, email, password, salt) VALUES ('${fullName}', '${email}', '${hashPassword}', '${salt}')`;
  const userData = {
    fullName,
    email,
    hashPassword,
    salt,
  };
  con.query(insertQuery, (err, result) => {
    if (err) throw res.status(500).send("Server Error");
    const token = handleGenerateAuthToken(userData);
    res.json({ status: "success", JWT: token });
  });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const data = await handleVerifyPassword(password, email);
    res.json({ message: data });
  } catch (error) {
    console.error("Error in login:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});
router.post("/add-blog", (req, res) => {
  const data = handleVerifyAuthToken(req.headers.authorization);
  res.json({ status: "success", message: data.message });
});

module.exports = router;
