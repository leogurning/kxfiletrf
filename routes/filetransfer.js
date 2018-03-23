const config = require('../config');
// Imports the Google Cloud client library
const Storage = require('@google-cloud/storage');

// Creates a client gcp storage
const storage = new Storage({
    projectId: config.GCLOUD_PROJECT
});
const bucket = storage.bucket(config.CLOUD_BUCKET);
var getPublicUrl = function(gcsuploadpath,filename) {
    return `https://storage.googleapis.com/${config.CLOUD_BUCKET}/${gcsuploadpath}${filename}`;
}

exports.inputfileupload = function(req, res, next){
    const uploadpath = req.body.uploadpath;
    var stats;
    const d = new Date();
    const ts = ("0" + d.getDate()).slice(-2) + ("0"+(d.getMonth()+1)).slice(-2) + 
                d.getFullYear() + ("0" + d.getHours()).slice(-2) + 
                ("0" + d.getMinutes()).slice(-2) + ("0" + d.getSeconds()).slice(-2);
    var file = req.files.fileinputsrc,
        oriname = file.name;
    if(file){
        const gcsname = ts+oriname.substr(oriname.length - 4);;
        const gcsfile = bucket.file(uploadpath+gcsname);
        const stream = gcsfile.createWriteStream({
            metadata: {
              contentType: file.mimetype
            }
          });

        stream.on('error', (err) => {
            file.cloudStorageError = err;
            console.log("File Upload Failed", err);
            return res.status(401).json({ success: false, 
                message:'File Upload Failed on streaming upload.'
            });      
          });

        stream.on('finish', () => {
            file.cloudStorageObject = gcsname;
            gcsfile.makePublic().then(() => {
                file.cloudStoragePublicUrl = getPublicUrl(uploadpath,gcsname);
                console.log("File Uploaded successfully",gcsname);
                res.status(201).json({
                  success: true,
                  message: 'Input file is successfully uploaded.',
                  filedata : {
                        filepath: file.cloudStoragePublicUrl,
                        filename: file.cloudStorageObject
                    }
                });
                next();
            })
            .catch(err => {
                return res.status(401).json({ success: false, 
                    message:'File Upload Failed on making public URL.'
                });      
            });
        });
        
        stream.end(file.data); 
    }    
}

exports.inputfiledelete = function(req, res, next) {
    const uploadpath = req.body.uploadpath;
    const filename = req.body.filename;

    if(filename){
        const gcsfile = bucket.file(uploadpath+filename);
        gcsfile.delete()
        .then(() => {
            console.log("Delete input file Success",filename);
            res.status(201).json({
                success: true,
                message: 'Input file Deleted successfully.'});    
        })
        .catch(err => {
            console.log("Delete input file Failed",filename,err);
            res.status(401).json({ success: false, 
              message:'Delete input file Failed.'
            });
        });
    }
    else {
        console.log("No File selected !");
        res.status(402).json({
            success: false,
            message: 'No File selected !'});    
    };
}