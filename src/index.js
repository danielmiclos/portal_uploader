require('dotenv').config();
const mongoose = require('mongoose');
const {app} = require('./app');
const fs = require('fs');

const start = async () => {
    try {
        await mongoose.connect(process.env.DB_CONNECTION, {
            useNewUrlParser: true,
            auth: {authSource: "admin"}
        });
        console.log("connected to mongodb");
    } catch (err) {
        console.error(err);
    }

    const appPort = process.env.PORT || 3001;

    app.listen(process.env.PORT, () => {
        console.log(`Listening on port ${appPort}`)
    });

    const uploadPath = process.env.UPLOADPATH || '../tmp/uploads';

    if(!fs.existsSync(uploadPath)) {
        try {
            fs.mkdirSync(uploadPath);
        } catch (err) {
            throw Error("O diretório de uploads não existe e não é possível cria-lo. Veja as configurações do variável UPLOADPATH e as permissões do sistema.");
        }
    }

}


start();