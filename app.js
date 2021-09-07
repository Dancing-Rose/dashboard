// const express = require("express");


// const app = express();
// app.use(express.urlencoded({ extended: true }))

// app.get("/", function (req, res) {
//     res.sendFile(__dirname + "/index.html");
// });

// app.listen(3000, function () {
//     console.log("Server started on port 3000")
// })

const axios = require("axios").default;

function callApi() {

    let headersList = {
        "Accept": "*/*",
        "Authorization": "Bearer SpVtwFtX2xKjNScdZ4kCyHVr6cPZ3BDH",
        "Content-Type": "application/json"
    }

    let reqOptions = {
        url: "http://40.119.238.158:80/api/v1/service/automobile-endpoint/score",
        method: "POST",
        headers: headersList,
        data: "{\n    \"Inputs\": {\n        \"WebServiceInput0\":\n        [\n            {\n                \"symboling\": \"3\",\n                \"normalized-losses\": \"1\",\n                \"make\": \"alfa-romero\",\n                \"fuel-type\": \"gas\",\n                \"aspiration\": \"std\",\n                \"num-of-doors\": \"two\",\n                \"body-style\": \"convertible\",\n                \"drive-wheels\": \"rwd\",\n                \"engine-location\": \"front\",\n                \"wheel-base\": \"88.6\",\n                \"length\": \"168.8\",\n                \"width\": \"64.1\",\n                \"height\": \"48.8\",\n                \"curb-weight\": \"2548\",\n                \"engine-type\": \"dohc\",\n                \"num-of-cylinders\": \"four\",\n                \"engine-size\": \"130\",\n                \"fuel-system\": \"mpfi\",\n                \"bore\": \"3.47\",\n                \"stroke\": \"2.68\",\n                \"compression-ratio\": \"9\",\n                \"horsepower\": \"111\",\n                \"peak-rpm\": \"5000\",\n                \"city-mpg\": \"21\",\n                \"highway-mpg\": \"27\",\n                \"price\": \"13495\"\n            }\n        ]\n    },\n    \"GlobalParameters\": {\n    }\n}",
    }

    axios.request(reqOptions).then(function (response) {
        console.log(response.data);
    })
}