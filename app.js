// const express = require("express");


// const app = express();
// app.use(express.urlencoded({ extended: true }))

// app.get("/", function (req, res) {
//     res.sendFile(__dirname + "/index.html");
// });

// app.listen(3000, function () {
//     console.log("Server started on port 3000")
// })

document.getElementById("testbtn").addEventListener("click", function (event) {
    event.preventDefault()

    const body = {
        "Inputs": {
            "WebServiceInput0":
                [
                    {
                        "symboling": "3",
                        "normalized-losses": "1",
                        "make": "alfa-romero",
                        "fuel-type": "gas",
                        "aspiration": "std",
                        "num-of-doors": "two",
                        "body-style": "convertible",
                        "drive-wheels": "rwd",
                        "engine-location": "front",
                        "wheel-base": "88.6",
                        "length": "168.8",
                        "width": "64.1",
                        "height": "48.8",
                        "curb-weight": "2548",
                        "engine-type": "dohc",
                        "num-of-cylinders": "four",
                        "engine-size": "130",
                        "fuel-system": "mpfi",
                        "bore": "3.47",
                        "stroke": "2.68",
                        "compression-ratio": "9",
                        "horsepower": "111",
                        "peak-rpm": "5000",
                        "city-mpg": "21",
                        "highway-mpg": "27",
                        "price": "13495"
                    }
                ]
        },
        "GlobalParameters": {
        }
    }
    const headers = {
        // 'Access-Control-Allow-Origin': '*',
        'Authorization': 'Bearer SpVtwFtX2xKjNScdZ4kCyHVr6cPZ3BDH',
    }

    callFetch(headers, JSON.stringify(body));
    // callAxios(headers, JSON.stringify(body));
});

function callFetch(header, body) {
    console.log('Try with fetch');

    fetch("http://40.119.238.158:80/api/v1/service/automobile-endpoint/score", {
        method: "POST",
        headers: header,
        body: body,
    }).then(function (response) {
        return response.text();
    }).then(function (data) {
        console.log(data);

        // show text on UI
        var paragraph = document.getElementById("result");
        var text = document.createTextNode(data);
        paragraph.appendChild(text);
    })
}

function callAxios(header, body) {
    console.log('Try with AXIOS');

    let reqOptions = {
        url: "http://40.119.238.158:80/api/v1/service/automobile-endpoint/score",
        method: "POST",
        headers: header,
        data: body,
    }

    axios.request(reqOptions).then(function (response) {
        console.log(response.data);

        // show text on UI
        var paragraph = document.getElementById("result");
        var text = document.createTextNode(response.data);
        paragraph.appendChild(text);
    })
}