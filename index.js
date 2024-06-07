const express = require("express");
const bodyParser = require("body-parser");

const fetchItem = require("./routes/fetchItem");
const searchStyle = require("./routes/searchStyle");

const app = express();
const http = require("http").Server(app);
app.use(bodyParser.text({ limit: "512mb", extended: true }));
app.use(bodyParser.json({ limit: "512mb", extended: true }));

// global.DB_name = "";

app.use("/fetchItem", fetchItem);
app.use("/searchStyle", searchStyle);

http.listen(8002, () => {
  // Previous 8002
  console.log("Server started running...");
});
