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
app.use(cookieParser());

// allowed origins 
const allowedOrigins = [
    'http://localhost:5174/',
    'http://localhost:5173/',
]

// CORS options
const corsOptions = (req, callback) => {
    let corsOptions;
    if(allowedOrigins.includes(req.header('Origin'))) {
        corsOptions = {
            origin: true,
            credentials: true, // Enable credentials for CMS site
        };
    } else {
        corsOptions = {
            origin: false, // Disable CORS for other origins
        };
    }
    callback(null, corsOptions);
}

// apply CORS middleware
app.use(cors(corsOptions));

app.use(express.json());



app.use('/cms', cors({ origin: 'http://localhost:5174/', credentials: true }), cmsRouter);
app.use('/posts', cors({ origin: 'http://localhost:5173/' }), blogRouter);

app.listen(port, () => {
    console.log(`Server started on port: ${port}`);
});