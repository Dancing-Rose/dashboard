// Create project
const util = require("util");
const fs = require("fs");
const TrainingApiClient = require("azure-cognitiveservices-customvision-training");
const PredictionApiClient = require("azure-cognitiveservices-customvision-prediction");

const setTimeoutPromise = util.promisify(setTimeout);

// Set up environment variables
const dotenv = require("dotenv");
dotenv.config();

const trainingKey = process.env.TRAINING_KEY;
const predictionKey = process.env.PREDICTION_KEY;
const predictionResourceId = process.env.PREDICTION_RESOURCE_ID;
const dataRoot = "./photos";

const endpoint = "https://leaf-disease.cognitiveservices.azure.com/";

const publishIterationName = "classifyModel";

const trainer = new TrainingApiClient(trainingKey, endpoint);

(async () => {
  console.log("Creating project...");
  const project = await trainer.createProject("Azure CV Demo");

  // Create, upload, and tag images
  const hispaTag = await trainer.createTag(project.id, "Hispa");
  const leafblastTag = await trainer.createTag(project.id, "Leafblast");
  const healthyTag = await trainer.createTag(project.id, "Healthy");
  const brownspotTag = await trainer.createTag(project.id, "Brownspot");

  console.log("Adding images...");
  let fileUploadPromises = [];

  const hispaDir = `${dataRoot}/hispa`;
  const hispaFiles = fs.readdirSync(hispaDir);
  hispaFiles.forEach((file) => {
    fileUploadPromises.push(
      trainer.createImagesFromData(
        project.id,
        fs.readFileSync(`${hispaDir}/${file}`),
        { tagIds: [hispaTag.id] }
      )
    );
  });

  const healthyDir = `${dataRoot}/healthy`;
  const healthyFiles = fs.readdirSync(healthyDir);
  healthyFiles.forEach((file) => {
    fileUploadPromises.push(
      trainer.createImagesFromData(
        project.id,
        fs.readFileSync(`${healthyDir}/${file}`),
        { tagIds: [healthyTag.id] }
      )
    );
  });

  const leafblastDir = `${dataRoot}/leafblast`;
  const leafblastFiles = fs.readdirSync(leafblastDir);
  leafblastFiles.forEach((file) => {
    fileUploadPromises.push(
      trainer.createImagesFromData(
        project.id,
        fs.readFileSync(`${leafblastDir}/${file}`),
        { tagIds: [leafblastTag.id] }
      )
    );
  });

  const brownspotDir = `${dataRoot}/brownspot`;
  const brownspotFiles = fs.readdirSync(brownspotDir);
  brownspotFiles.forEach((file) => {
    fileUploadPromises.push(
      trainer.createImagesFromData(
        project.id,
        fs.readFileSync(`${brownspotDir}/${file}`),
        { tagIds: [brownspotTag.id] }
      )
    );
  });

  await Promise.all(fileUploadPromises);

  //   // Train classifier
  //   console.log("Training...");
  //   let trainingIteration = await trainer.trainProject(project.id);

  //   console.log("Training started...");
  //   while (trainingIteration.status == "Training") {
  //     console.log("Training status: " + trainingIteration.status);
  //     await setTimeoutPromise(1000, null);
  //     trainingIteration = await trainer.getIteration(
  //       project.id,
  //       trainingIteration.id
  //     );
  //   }
  //   console.log("Training status: " + trainingIteration.status);

  // Publish the iteration to endpoint
  //   await trainer.publishIteration(
  //     project.id,
  //     trainingIteration.id,
  //     publishIterationName,
  //     predictionResourceId
  //   );

  const predictor = new PredictionApiClient(predictionKey, endpoint);
  const testFile = fs.readFileSync(`${dataRoot}/test/IMG_3177.jpg`);

  const results = await predictor.classifyImage(
    project.id,
    publishIterationName,
    testFile
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
