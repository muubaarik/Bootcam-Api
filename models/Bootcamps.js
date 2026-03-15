const mongoose = require('mongoose');
const slugify = require('slugify');
const geocoder = require('../utils/geocoder');

const BootcampSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name'],
        unique: true,
        trim: true,
        maxlength: [50, 'Name cannot be more than 50 characters']
    },
    slug: String,
    description: {
        type: String,
        required: [true, 'Please add a description'],
        maxlength: [500, 'Description cannot be more than 500 characters']
    },
    website: {
        type: String,
        match: [
            /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
            'Please use a valid URL with HTTP or HTTPS'
        ]
    },
    phone: {
        type: String,
        maxlength: [20, 'Phone number cannot be longer than 20 characters']
    },
    email: {
        type: String,
        match: [
            /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email'
        ]
    },
    address: {
        type: String,
        required: [true, 'Please add an address']
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number]
        },
        formattedAddress: String,
        street: String,
        city: String,
        state: String,
        zipcode: String,
        country: String
    },
    careers: {
        type: [String],
        required: true,
        enum: [
            'Web Development',
            'Mobile Development',
            'UI/UX',
            'Data Science',
            'Business',
            'Other'
        ]
    },
    averageRating: {
        type: Number,
        min: [1, 'Rating must be at least 1'],
        max: [10, 'Rating cannot be more than 10']
    },
    averageCost: {
        type: Number
    },
    photo: {
        type: String,
        default: 'no-photo.jpg'
    },
    housing: {
        type: Boolean,
        default: false
    },
    jobAssistance: {
        type: Boolean,
        default: false
    },
    jobGuarantee: {
        type: Boolean,
        default: false
    },
    acceptGi: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

BootcampSchema.index({ location: '2dsphere' });

// Reverse populate with virtuals
BootcampSchema.virtual('courses', {
    ref: 'Course',
    localField: '_id',
    foreignField: 'bootcamp',
    justOne: false
});

BootcampSchema.virtual('reviews', {
    ref: 'Review',
    localField: '_id',
    foreignField: 'bootcamp',
    justOne: false
});

// Middleware to create slug from the name before saving
BootcampSchema.pre('save', function(next) {
    this.slug = slugify(this.name, { lower: true, strict: true });
    next();
});


// Geocode & create location field
BootcampSchema.pre('save', async function(next) {
    try {
        const loc = await geocoder.geocode(this.address);

        if (loc && loc.length > 0 && loc[0].latitude && loc[0].longitude) {
            this.location = {
                type: 'Point',
                coordinates: [loc[0].longitude, loc[0].latitude],
                formattedAddress: loc[0].formattedAddress,
                street: loc[0].streetName,
                city: loc[0].city,
                state: loc[0].stateCode,
                zipcode: loc[0].zipcode,
                country: loc[0].countryCode
            };
            // Do not save the raw address in the database
            this.address = undefined;
        } else {
            // Geocoding returned no results — clear location so 2dsphere index stays valid
            this.location = undefined;
            console.log('Geocoding returned no results for address:', this.address);
        }

        next();
    } catch (err) {
        // Geocoding failed — clear partial location so 2dsphere index stays valid
        this.location = undefined;
        console.log('Geocoding failed, saving without location:', err.message);
        next();
    }
});

module.exports = mongoose.model('Bootcamp', BootcampSchema);










































/*const mongoose = require('mongoose');
const slugify = require('slugify');
const geocoder = require('../utilts/geocoder')

const BootcampSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name'],
        unique: true,
        trim: true,
        maxlength: [50, 'Name cannot be more than 50 characters']
    },
    slug: String,
    description: {
        type: String, // Added missing 'type: String'
        required: [true, 'Please add a description'],
        maxlength: [500, 'Description cannot be more than 500 characters'] // Fixed typo 'maxLengh' to 'maxlength'
    },
    website: {
        type: String,
        match: [
            /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
            'Please use a valid URL with HTTP or HTTPS'
        ]
    },
    phone: {
        type: String,
        maxlength: [20, 'Phone number cannot be longer than 20 characters'] // Fixed typo 'maxlengh' to 'maxlength'
    },
    email: {
        type: String,
        match: [
            /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email'
        ]
    },
    address: {
        type: String,
        required: [true, 'Please add an address']
    },
    location: {
        type: {
            type: String,
            enum: ['Point'], // Fixed typo 'emum' to 'enum', corrected case to 'Point'
            required: true
        },
        coordinates: {
            type: [Number],
            required: true,
            index: '2dsphere'
        },
        formattedAddress: String,
        street: String,
        city: String,
        state: String,
        zipcode: String,
        country: String
    },
    careers: {
        type: [String], // Array of strings
        required: true,
        enum: [
            'Web Development',
            'Mobile Development',
            'UI/UX',
            'Data Science',
            'Business',
            'Other'
        ]
    },
    averageRating: { // Fixed typo 'avaregeRating' to 'averageRating'
        type: Number,
        min: [1, 'Rating must be at least 1'],
        max: [10, 'Rating cannot be more than 10']
    },
    averageCost: { // Fixed typo 'avaregeCost' to 'averageCost'
        type: Number
    },
    photo: {
        type: String,
        default: 'no-photo.jpg' // Fixed typo 'no-photo.jpq' to 'no-photo.jpg'
    },
    housing: {
        type: Boolean,
        default: false
    },
    jobAssistance: {
        type: Boolean,
        default: false
    },
    jobGuarantee: {
        type: Boolean,
        default: false
    },
    acceptGi: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Middleware to create slug from the name before saving
BootcampSchema.pre('save', async function(next) {
    try {
        const loc = await geocoder.geocode(this.address);

        if (!loc || loc.length === 0) {
            throw new Error('Invalid address for geocoding');
        }

        this.location = {
            type: 'Point',
            coordinates: [loc[0].longitude, loc[0].latitude],
            formattedAddress: loc[0].formattedAddress,
            street: loc[0].streetName,
            city: loc[0].city,
            state: loc[0].stateCode,
            zipcode: loc[0].zipcode,
            country: loc[0].countryCode
        };

        this.address = undefined;
        next();
    } catch (err) {
        next(err);
    }
});



module.exports = mongoose.model('Bootcamp', BootcampSchema);*/

