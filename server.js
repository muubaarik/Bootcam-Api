const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const colors = require('colors');
const fileupload = require('express-fileupload');
const path = require('path');
const helmet = require('helmet');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const errorHandler = require('./middleware/error');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config({ path: './config/config.env' });

// Connect to Database
connectDB();

const app = express();

// Body parser middleware
app.use(express.json());

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// File uploading
app.use(fileupload());

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

// Security: Set security headers
app.use(helmet());

// Security: Prevent XSS attacks
app.use(xss());

// Security: Rate limiting — 100 requests per 10 minutes per IP
const limiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 100,
    message: { success: false, error: 'Too many requests, please try again later' }
});
app.use(limiter);

// Security: Prevent HTTP param pollution
app.use(hpp());

// Security: Enable CORS
app.use(cors());

// Swagger Docs
const swaggerDoc = YAML.load('./swagger.yaml');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc));

// Route Files
const bootcamps = require('./routes/bootcams');
const courses = require('./routes/courses');
const auth = require('./routes/auth');
const reviews = require('./routes/reviews');
const users = require('./routes/users');

// Mount Routers
app.use('/api/v1/bootcamps', bootcamps);
app.use('/api/v1/courses', courses);
app.use('/api/v1/auth', auth);
app.use('/api/v1/reviews', reviews);
app.use('/api/v1/users', users);
app.use(errorHandler);

const PORT = process.env.PORT || 5001;

const server = app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`.red);
    server.close(() => process.exit(1));
});














//const express = require('express');  // Correctly require express















/*const dotenv = require('dotenv');    // Correctly require dotenv
const morgan = require('morgan')
const colores = require('colors')
const connectDB = require('./config/db')
//const morgan = require('morgan');
const logger = require('./middleware/logger')
const result = dotenv.config({ path: './config/config.env' });
connectDB();
if (result.error) {
    console.log("Error loading environment variables:", result.error);
} else {
    console.log("Environment variables loaded successfully");
}

// Load environment variables

const app = express();

// Body parser
app.use(express.json)
/*const logger = (req,res,next)=>{
   // req.hello = 'hello world';
    console.log(`${req.method} ${req.protocol}://${req.get('host')}${req.originalUrl}`);
    next();
};*/
//Dev logging middlewere
/*console.log(`NODE_ENV is set to: ${process.env.NODE_ENV}`);
console.log(`PORT is set to: ${process.env.PORT}`);

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}


//app.use(logger);
//Rout File
const bootcamps = require('./routes/bootcams');



/*app.get('/api/vi/bootcamps',(req,res)=>{
   res.status(200).json({success: true,  msg: 'show all bootcams'})

})

app.get('/api/vi/bootcamps/:id',(req,res)=>{
    res.status(200).json({success: true,  msg: `show bootcams ${req.params.id}`})
 
 })

app.post('/api/vi/bootcamps',(req,res)=>{
    res.status(200).json({success: true,  msg: 'Create  all bootcam'})
 
 })

 app.put('/api/vi/bootcamps/:id',(req,res)=>{
    res.status(200).json({success: true,  msg: `update  all bootcams ${req.params.id}`})
 
 })

 app.delete('/api/vi/bootcamps/:id',(req,res)=>{
    res.status(200).json({success: true,  msg: `delet all bootcams ${req.params.id}`})
 
 })*/
 // Mount Router
/* app.use('/api/v1/bootcamps',bootcamps);
const PORT = process.env.PORT || 5001;



const server =app.listen(PORT, console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold));

//Handle unhandled promise rejections
process.on('unhandledRejection',(err, promise) =>{
    console.log(`Error: ${err.message}`.red);
    server.close(()=> process.exit(1));
})*/

