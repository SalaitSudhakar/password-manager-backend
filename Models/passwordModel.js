import mongoose from "mongoose";

const passwordSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    siteName: {
        type: String,
        required: true
    },
    siteUrl: {
        type: String,
    },
    username: {
        type:String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    notes: {
        type: String
    }

}, {timestamps: true});

const Password = mongoose.model('Password', passwordSchema);

export default Password;