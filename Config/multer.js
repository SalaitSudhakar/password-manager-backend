import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from './coudinary.js';

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'password-manager',
        allowedFormats: ['jpg', 'png', 'jpeg']
    }
})

const upload = multer({ storage: storage});

export default upload;