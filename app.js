const axios = require("axios").default;
const express = require("express")

const app = express();

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.post('/requestCounterMeasure', (req, res) => {

    let axiosConfig = {
        headers: {
            'Authorization': 'Bearer SpVtwFtX2xKjNScdZ4kCyHVr6cPZ3BDH',
        }
    };

    axios.post("http://40.119.238.158:80/api/v1/service/automobile-endpoint/score", req.body, axiosConfig)
        .then((response) => {
            var scoredLabel = response.data.Results.WebServiceOutput0[0]['Scored Labels']
            res.send({'result': scoredLabel})
            
        })
        .catch((err) => {
            console.log("AXIOS ERR: ", err);
        })
})

app.listen(3000, function () {
    console.log("Server started on port 3000")
    console.log("Goto http://localhost:3000")
    console.log("Test /requestCounterMeasure api on http://localhost:3000/requestCounterMeasure");
})

