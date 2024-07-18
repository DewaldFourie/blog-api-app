const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const blogRouter = require('./routes/blogRoutes');
const cmsRouter = require('./routes/cmsRoutes');

const app = express();
const port = process.env.PORT || 3000;


// DB setup
const mongoose = require('mongoose');
mongoose.set('strictQuery', false);
const mongoDB = process.env.MONGODB_URI;
main().catch((err) => console.log(err));
async function main() {
    await mongoose.connect(mongoDB);
}


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors({
    origin: 'http://localhost:5174',
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());


app.use('/cms', cmsRouter);
app.use('/posts', blogRouter);

app.listen(port, () => {
    console.log(`Server started on port: ${port}`);
});