const express = require("express");
const multer = require("multer");
const ejs = require("ejs");
const path = require("path");
const util = require("util");
const fs = require("fs");
const PredictionApiClient = require("azure-cognitiveservices-customvision-prediction");

const setTimeoutPromise = util.promisify(setTimeout);

// Set up environment variables
const dotenv = require("dotenv");
dotenv.config();

var currentFileName = "";

const predictionKey = process.env.PREDICTION_KEY;
const dataRoot = "photos";

const endpoint = "https://southcentralus.api.cognitive.microsoft.com";

const publishIterationName = "Iteration3";

const predictor = new PredictionApiClient(predictionKey, endpoint);

// Set The Storage Engine
const storage = multer.diskStorage({
  destination: "./public/uploads/",
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

// Init Upload
const upload = multer({
  storage: storage,
  limits: { fileSize: 1000000 },
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
}).single("myImage");

// Check File Type
function checkFileType(file, cb) {
  // Allowed ext
  const filetypes = /jpeg|jpg|png|gif/;
  // Check ext
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb("Error: Images Only!");
  }
}

const app = express();

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

app.get("/", function (req, res) {
  res.render("index");
});

app.post("/upload", (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      res.render("index", {
        msg: err,
      });
    } else {
      if (req.file == undefined) {
        res.render("index", {
          msg: "Error: No File Selected!",
        });
      } else {
        currentFileName = req.file.filename;
        res.render("index", {
          msg: "File Uploaded!",
          file: `./uploads/${req.file.filename}`,
        });
      }
    }
  });
});

// console.log(currentFileName)
//const testFile = fs.readFileSync(`public/uploads/${currentFileName}`);
(async () => {
  const results = await predictor.classifyImage(
    "f04ae26a-ec18-4254-9d08-10fa220d46ac",
    publishIterationName,
    req.file
  );

  // Show results
  console.log("Results:");
  results.predictions.forEach((predictedResult) => {
    console.log(
      `\t ${predictedResult.tagName}: ${(
        predictedResult.probability * 100.0
      ).toFixed(2)}%`
    );
  });
})();

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
