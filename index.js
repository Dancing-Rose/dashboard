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

app.get("/classify", function (req, res) {
  res.render("classify")
});

app.get("/prediction", function (req, res) {
  res.render("prediction");
})

const diseaseControl = [
  {
    "disease": "Hispa",
    "control": [
      {
        0: [
          "Use narrower plant spacing with greater leaf densities.",
          "Infested leaves and shoots should be clipped and burned, or burried deep in the mud."
        ]
      },
      {
        1: [
          "There are small wasps that attack the eggs and larvae",
          "A reduviid bug eats upon the adults.",
          "There are three fungal pathogens that attack the adults."
        ]
      },
      {
        2: [
          "Several chemical formulations containing the following active ingredients could be used to control populations: chlorpyriphos, malathion, cypermethrin, fenthoate.",
          "Avoid excessive nitrogen fertilization in infested fields."
        ]
      },
      {
        3: [
          "Avoid over fertilizing the field",
          "Close plant spacing results in greater leaf densities that can tolerate higher hispa numbers.",
          "To prevent egg laying of the pests, the shoot tips can be cut.",
          "Clipping and burying shoots in the mud can reduce grub populations by 75−92%."
        ]
      }
    ]
  },
  {
    "disease": "Leaf Blast",
    "control": [
      {
        0: [
          "Adjust planting time. Sow seeds early, when possible, after the onset of the rainy season.",
          "Flood the field as often as possible.",
          "Split nitrogen fertilizer application in two or more treatments. Excessive use of fertilizer can increase blast intensity."
        ]
      },
      {
        1: [
          "Systemic fungicides like triazoles and strobilurins can be used judiciously for control to control blast.",
          "A fungicide application at heading can be effective in controlling the disease",
          "Cheap sources of silicon, such as straws of rice genotypes with high silicon content, can be an alternative."
        ]
      },
      {
        2: [
          "Silicon fertilizers (e.g., calcium silicate) can be applied to soils that are silicon deficient to reduce blast. "
        ]
      },
      {
        3: [
          "Adjust planting time. Sow seeds early, when possible, after the onset of the rainy season.",
          "Flood the field as often as possible."
        ]
      }
    ]
  },
  {
    "disease": "Brown Spot",
    "control": [
      {
        0: [
          "monitor soil nutrients regularly",
          "apply required fertilizers",
          "for soils that are low in silicon, apply calcium silicate slag before planting"
        ]
      },
      {
        1: [
          "Use resistant varieties",
          "Sprayed with spore suspension of T. harzianum",
          "Trichoderma spp. has been shown to be effective for the control of brown spot disease and the increase of plant growth on rice"
        ]
      },
      {
        2: [
          "Use fungicides (e.g., iprodione, propiconazole, azoxystrobin, trifloxystrobin) as seed treatments."
        ]
      },
      {
        3: [
          "Treat seeds with hot water (53−54°C) for 10−12 minutes before planting, to control primary infection at the seedling stage.",
          "Use fungicides (e.g., iprodione, propiconazole, azoxystrobin, trifloxystrobin) as seed treatments.",
          "To improve the results, place the seeds for 8 hours in cold water before the hot water treatment."
        ]
      }
    ]
  }
]


let scoredLabel = "";
app.post("/upload", (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      res.render("prediction", {
        msg: err,
      });
    } else {
      if (req.file == undefined) {
        res.render("prediction", {
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
          var applicableControl = []

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
              diseaseControl.forEach(function (control) {
                if (disease == control.disease) {
                  applicableControl = control.control[scoredLabel]
                  console.log(applicableControl)
                  console.log("Hello")
                }
              })
                res.render("prediction", {
                  percentage: maxProb,
                  name: disease,
                  label: scoredLabel,
                  file: currentFileName,
                  controls: applicableControl
                });
              //res.send({ result: scoredLabel });
            })
            .catch((err) => {
              console.log("AXIOS ERR: ", err);
            });
        })();
      }
    }
  });
});
const port = process.env.PORT || 1337;
app.listen(port, function () {
  console.log("Server started on port 3000");
});
