const axios = require("axios").default;
const express = require("express")

const app = express();

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.post('/requestCounterMeasure', (req, res) => {
    console.log(req.body);

    let axiosConfig = {
        headers: {
            'Authorization': 'Bearer bBeGmd3Gi1H4f9tfH5XcnaAfwsf3yQCj',
        }
    };

    axios.post("http://20.197.106.3:80/api/v1/service/finaloutput/score", req.body, axiosConfig)
        .then((response) => {
            var scoredLabel = response.data.Results.WebServiceOutput0[0]['ControlPrediction']
            res.set('Access-Control-Allow-Origin', '*')
            res.send({ 'result': scoredLabel })

        })
        .catch((err) => {
            console.log("AXIOS ERR: ", err);
        })
})

app.post('/classifyPaddyDisease', (req, res) => {
    console.log(req.body);

    let axiosConfig = {
        headers: {
            "Prediction-Key": "aa23d495840d462a85d41070caf76db0",
            "Content-Type": "application/octet-stream",
        }
    };

    axios.post("https://umhackcustomvision-prediction.cognitiveservices.azure.com/customvision/v3.0/Prediction/99577d8b-8508-450e-ae77-c6adf0fbaabb/classify/iterations/Iteration1/image", req.body, axiosConfig)
        .then((response) => {
            
            res.send({ 'results': response.data['predictions'] })

        })
        .catch((err) => {
            console.log("AXIOS ERR: ", err);
        })
})

app.listen(3000, function () {
    console.log("Server started on port 3000")
    console.log("Goto http://localhost:3000")
    console.log("Test /requestCounterMeasure api on http://localhost:3000/requestCounterMeasure");
    console.log("Test /classifyPaddyDisease api on http://localhost:3000/classifyPaddyDisease");
})

