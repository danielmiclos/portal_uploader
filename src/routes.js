const routes = require('express').Router();
const multer = require('multer');
const multerConfig = require('./config/multer');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs')
const crypto = require('crypto');

const Project = require('./models/project');
const ProjectItem = require('./models/projectItem');
const Episode = require('./models/episode');
const mongoose = require('mongoose');

routes.get('/', (req, res) => {
    return res.json({hello : "OK!"});
});

routes.get('/api', (req, res) => {
    return res.json({hello : "Hello api"});
});

routes.post(["/api/createproject", "/createproject"], (req, res) => {

    const {title, date, jobid, bidid} = req.body;

    console.log(title, date, jobid, bidid);

    const postData = {
        name: title,
        jobID:jobid || "",
        bidId:bidid || "",
        createdAt: date || Date.now(),
        modifiedAt: date || Date.now(),
        // _id: new mongoose.Types.ObjectId()
    }

    const project = new Project(postData);
    project.save().then(result => {
        console.log(result);
        console.log(result._id);
        console.log(process.env.UPLOADPATH);
        if(!fs.existsSync(`${process.env.UPLOADPATH}${result._id}`)) {
            try {
                fs.mkdirSync(`${process.env.UPLOADPATH}${result._id}`);
            } catch (err) {
                throw Error(err);
            }
        }
    })
        .catch(err => console.log(err));

    return res.status(200).json(project);
})

routes.post(["/api/createepisode", "/createepisode"], async (req, res) => {
    const {title, parentid} = req.body;

    console.log(title, parentid);

    if(parentid) {
        await Project.findById(parentid, (err, project) => {
            if(err) {
                console.error(err)
                return res.status(400).json({message: 'not found'});
            } else {

                console.log("project", project);

                // cria o episódio
                const episode = new Episode({
                    name: title,
                    parentId: parentid,
                    createdAt:  Date.now(),
                    modifiedAt: Date.now(),
                });

                episode.save()
                    .then(result => {
                    console.log(result);
                    return res.status(200).json(result)
                    })
                    .catch(err => {
                        console.log(err);
                        return res.status(400).json(error);
                    })

                // return res.status(200).json(project);
            }
        })
    } else {
        return res.status(400).send("parameter \'parentid\' missing. Check your request");
    }

});

routes.get("/getproject/:id", async(req, res) => {

    //pegando o parametro id
    const {id} = req.params;
    console.log(id);

        if (id) {
                await Project.findById(id, (err, project) => {
                    if(err) {
                        console.error(err)
                        return res.status(400).json({message: 'not found'});
                    } else {
                        return res.status(200).json(project);
                    }
                })


        } else {
            return res.status(400).send("parameter \'id\' missing. Check your request");
        }

})

routes.get(["/getprojects", "/api/getprojects"], async (req, res) => {
    await Project.find({}, (err, projects) => {
        if(err) {
            console.error(err)
            return res.status(400).json({message: 'not found'});
        } else {
            return res.status(200).json(projects);
        }
    });
});

routes.get(["/getprojectitems/:id", "/api/getprojectitems/:id"], async (req, res) => {
    //pegando o parametro id
    const {id} = req.params;
    console.log(id);
        if(id) {
            await ProjectItem.find({parentId: id}, (err, items) => {
                if(err) {
                    console.error(err)
                    return res.status(404).json({message: 'not found'});
                } else {
                    console.log(items);
                    return res.status(200).json(items);
                }
            })
        } else {
            return res.status(400).send("parameter \'id\' missing. Check your request");
        }
});

routes.get(["/api/getepisodes/:id", "/getepisodes/:id"], async (req, res) => {
    const {id} = req.params;
    console.log(id);
    if(id) {
        await Episode.find({parentId: id}, (err, items) => {
            if(err) {
                console.log(err);
                return res.status(400).json({message: "not found"});
            } else {
                console.log(items);
                return res.status(200).json(items);
            }
        })
    } else {
        return res.status(400).send("parameter \'id\' is missing. Check your request");
    }
})



routes.post(["/post/video", "/api/post/video"], multer(multerConfig).single('file'), (req, res) => {

    console.log(req.file);
    console.log("BODY: ", req.body);

    const itemData = {
        //_id: mongoose.Schema.Types.ObjectId,
        parentId: req.body._id,
        type: "video",
        name: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        path: req.file.path,
        createdAt: Date.now(),
        modifiedAt: Date.now()
    };

    const projectItem = new ProjectItem(itemData);
    projectItem.save().then(result => {
        console.log(result);
        console.log(result._id);
    })
        .catch(err => console.log(err));

    return res.status(200).json(projectItem);
});


/**
 *  edkConfig
 * */

const edlConfig = multer({
    // dest: "/tmp/uploads",
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            // cb(null, path.resolve(__dirname, '..', 'tmp', 'uploads'));
            console.log('req.body', req.body);
            console.log('file: ', req.file);

            if(!fs.existsSync(`${process.env.UPLOADPATH}${req.body._id}`)) {
                fs.mkdirSync(`${process.env.UPLOADPATH}${req.body._id}`);
            }

            cb(null, `${process.env.UPLOADPATH}${req.body._id}`);
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
        fileSize: 5 * 1024 * 1024,
    },
    fileFilter: (req, file, cb) => {
        const allowedMimes = [
            'text/*',
            'text/plain',
            'application/octet-stream'
        ];

        if(allowedMimes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error("Invalid file type"));
        }
    }
});

routes.post(['/post/edl', '/api/post/edl'], multer(edlConfig).single('file'), (req, res) => {
    // console.log('body._id: ', req.body._id);
    console.log('file: ', req.file);
    console.log('body: ', req.body);

    const itemData = {
        //_id: mongoose.Schema.Types.ObjectId,
        parentId: req.body._id,
        type: "edl",
        name: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        path: req.file.path,
        createdAt: Date.now(),
        modifiedAt: Date.now()
    };

    const projectItem = new ProjectItem(itemData);
    projectItem.save().then(result => {
        console.log(result);
        console.log(result._id);
    })
        .catch(err => console.log(err));

    return res.status(200).json(projectItem);
});



/**
 *  cutConfig
 * */

const cutConfig = multer({
    // dest: "/tmp/uploads",
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            // cb(null, path.resolve(__dirname, '..', 'tmp', 'uploads'));
            console.log('req.body', req.body);
            console.log('file: ', req.file);

            if(!fs.existsSync(`${process.env.UPLOADPATH}${req.body._id}`)) {
                fs.mkdirSync(`${process.env.UPLOADPATH}${req.body._id}`);
            }

            cb(null, `${process.env.UPLOADPATH}${req.body._id}`);
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
        fileSize: 5 * 1024 * 1024,
    },
    fileFilter: (req, file, cb) => {
        const allowedMimes = [
            'text/*',
            'text/plain',
            'text/csv',
            'application/msword',
            'application/octet-stream'
        ];

        if(allowedMimes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error("Invalid file type"));
        }
    }

});

routes.post(['/post/cut', '/api/post/cut'], multer(cutConfig).single('file'), (req, res) => {
    // console.log('body._id: ', req.body._id);
    console.log('file: ', req.file);
    console.log('body: ', req.body);

    const itemData = {
        //_id: mongoose.Schema.Types.ObjectId,
        parentId: req.body._id,
        type: "cut",
        name: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        path: req.file.path,
        createdAt: Date.now(),
        modifiedAt: Date.now()
    };

    const projectItem = new ProjectItem(itemData);
    projectItem.save().then(result => {
        console.log(result);
        console.log(result._id);
    })
        .catch(err => console.log(err));

    return res.status(200).json(projectItem);
});


module.exports = routes;