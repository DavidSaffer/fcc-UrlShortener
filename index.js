require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const bodyParser = require("body-parser");
const dns = require("dns");

// Basic Configuration
const port = process.env.PORT || 3000;

// URL holders
let urlDatabase = {};
let urlCounter = 1;

app.use(cors());

app.use("/", bodyParser.json());
// Text bodies
app.use(express.urlencoded({ extended: true }));

app.use("/public", express.static(`${process.cwd()}/public`));

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

// Your first API endpoint
app.get("/api/hello", function (req, res) {
  res.json({ greeting: "hello API" });
});

app.post("/api/shorturl", (req, res) => {
  console.log(req.body);
  try {
    const { hostname } = new URL(req.body.url);
    console.log(hostname);
    dns.lookup(hostname, (err) => {
      if (err) return res.json({ error: "Invalid URL" });

      urlDatabase[urlCounter] = req.body.url;
      urlCounter++;
      res.json({
        original_url: req.body.url,
        short_url: urlCounter - 1,
      });
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: "Invalid URL format" });
  }
});

app.get("/api/shorturl/:shorturl", (req, res) => {
  const { shorturl } = req.params;
  let shortUrlToInt = parseInt(shorturl);
  const url = urlDatabase[shortUrlToInt];

  if (url) {
    res.redirect(url);
  }
  res.status(404);
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
