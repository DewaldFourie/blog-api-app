const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const blogRouter = require('./routes/blogRoutes');
const cmsRouter = require('./routes/cmsRoutes');

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());


app.use('/cms', cmsRouter);
app.use('/posts', blogRouter);

app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});