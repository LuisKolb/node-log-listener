var express = require("express"),
    fs = require("fs"),
    url = require("url");
var app = express();
var cors = require('cors')

app.use(cors())

app.use("/logs", express.static(__dirname + "/logs"));
app.use(express.static(__dirname + "/logs"));

app.post("/receive-*", function (request, respond) {
    var userHash = request.url.split("-")[1];
    let body = "";

    filePath = __dirname + "/logs/" + userHash + ".txt";

    request.on("data", (chunk) => {
        body += chunk.toString();
    });

    request.on("end", function () {
        fs.access(filePath, fs.F_OK, (err) => {
            // if the file doesn't exist, create a new one
            if (err) {
                var newBody = { userID: userHash, logs: [] };
                fs.writeFileSync(filePath, JSON.stringify(newBody), (err) => {
                    if (err) console.log(err);
                });
                console.info("new logfile created for " + userHash);
            }

            fs.readFile(filePath, (err, data) => {
                if (err) console.log(err);
                dataJson = JSON.parse(data);
                postData = JSON.parse(body);
                dataJson.logs.push(postData);

                fs.writeFile(filePath, JSON.stringify(dataJson), (err) => {
                    if (err) console.log(err);
                    respond.end();
                });
            });
        });
    });
});

app.listen(8080);
