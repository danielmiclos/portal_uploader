const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs');

module.exports = {
    dest: path.resolve(__dirname, '..', '..', 'tmp', 'uploads'),
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            // cb(null, path.resolve(__dirname, '..', 'tmp', 'uploads'));
            console.log('req.body', req.body);
            console.log('file: ', req.file);

            if(!fs.existsSync(`${process.env.UPLOADPATH}/${req.body._id}`)) {
                console.log("pasta não existe");
                fs.mkdirSync(`${process.env.UPLOADPATH}/${req.body._id}`);

            } else {
                console.log("pasta existe");

            }
            cb(null, `${process.env.UPLOADPATH}/${req.body._id}`);
        },
        filename: (req, file, cb) => {
            crypto.randomBytes(16, (err, hash) => {
                if(err) cb(err);

                const fileName = `${hash.toString('hex')}-${file.originalname}`;

                cb(null, fileName);

            });
        }
    }),
    limits: {
        fileSize: 5 * 1024 * 1024 * 1024,
    },
    fileFilter: (req, file, cb) => {
        const allowedMimes = [
            'image/jpeg',
            'image/pjpeg',
            'image/png',
            'image/gif',
            'video/mp4',
            'video/mkv',
            'video/quicktime',
            'video/x-matroska',
            'video/*'
        ];

        if(allowedMimes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error("Invalid file type"));
        }
    }
};