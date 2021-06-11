
const mongoose = require('mongoose');
const URLSlugs = require('mongoose-url-slugs');

// add your schemas
const UserSchema = new mongoose.Schema({
    username: {
        type: String, 
        unique: true, 
        required: true
    },
    email: {
        type: String, 
        unique: true, 
        required: true
    },
    password: {
        type: String, 
        required: true
    }
});

const SongSchema = new mongoose.Schema({
    title: String,
    description: String,
    userId: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User'
    },
    fileName: String
});

SongSchema.plugin(URLSlugs('title')); 

// eslint-disable-next-line no-unused-vars
const User = mongoose.model('User', UserSchema);
// eslint-disable-next-line no-unused-vars
const Song = mongoose.model('Song', SongSchema);

// mongoose.connect('mongodb://localhost/hw06');
mongoose.connect('mongodb+srv://brandon:3C9F72B2293E1D6E@cluster0.inj6p.mongodb.net/myFirstDatabase?retryWrites=true&w=majority');
