const express = require("express");
const multer = require("multer");
const axios = require("axios").default;
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
var testFile;

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

let axiosConfig = {
  headers: {
    Authorization: "Bearer bBeGmd3Gi1H4f9tfH5XcnaAfwsf3yQCj",
  },
};

const body = {
  Inputs: {
    WebServiceInput0: [
      {
        N: "1",
        temperature: "1",
        humidity: "233",
        ph: "0.2",
        disease: "13",
        severity: "1",
      },
    ],
  },
  GlobalParameters: {},
};

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

app.get("/", function (req, res) {
  res.render("index");
});
let scoredLabel = "";
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
        testFile = fs.readFileSync(`public/uploads/${currentFileName}`);
        (async () => {
          const results = await predictor.classifyImage(
            "f04ae26a-ec18-4254-9d08-10fa220d46ac",
            publishIterationName,
            testFile
          );

          // Show results
          console.log("Results:");
          var maxProb = 0;
          var disease = "";

          results.predictions.forEach((predictedResult) => {
            if (predictedResult.probability * 100 > maxProb) {
              maxProb = predictedResult.probability * 100;
              disease = predictedResult.tagName;
            }
            console.log(
              `\t ${predictedResult.tagName}: ${(
                predictedResult.probability * 100.0
              ).toFixed(2)}%`
            );
          });
          axios
            .post(
              "http://20.197.106.3:80/api/v1/service/finaloutput/score",
              body,
              axiosConfig
            )
            .then((response) => {
              scoredLabel =
                response.data.Results.WebServiceOutput0[0]["ControlPrediction"];
                res.render("disease", {
                  percentage: maxProb,
                  name: disease,
                  label: scoredLabel,
                });
              //res.send({ result: scoredLabel });
            })
            .catch((err) => {
              console.log("AXIOS ERR: ", err);
            });
            //console.log(scoredLabel);
          
        })();
      }
    }
  });
});
const port = process.env.PORT || 1337;
app.listen(port, function () {
  console.log("Server started on port 3000");
});
