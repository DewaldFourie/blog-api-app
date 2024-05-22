const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');


const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());


app.get("/", (req, res) => {
    res.send("Welcome to the express server!");
});


app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});