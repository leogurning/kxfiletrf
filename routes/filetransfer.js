const config = require('../config');

const cloudinary = require('cloudinary');
//const uploadpath = "kaxet/images/genres/";
cloudinary.config({ 
    cloud_name: config.cloud_name, 
    api_key: config.api_key, 
    api_secret: config.api_secret
});

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
      const name = ts+oriname.substr(oriname.length - 4);  
      //const name = ts;  
      cloudinary.v2.uploader.upload_stream(
        {public_id: name, folder: uploadpath,invalidate: true,resource_type: 'raw'}, 
        function(err, result){
            if(err){
                console.log("Input File Upload Failed", err);
                return res.status(401).json({ success: false, 
                  message:'Input File Upload Failed.'
                });      
            }
            else {
                console.log("Input File Uploaded successfully",name);
                res.status(201).json({
                  success: true,
                  message: 'Input File is successfully uploaded.',
                  filedata : {filepath: result.secure_url,filename: result.public_id}
                });      
            }
        }).end(file.data);
    } else {
        return res.status(402).json({ success: false, 
            message:'No input file uploaded.',
            filedata : {filepath: "",filename: ""}
          });
    };
}

exports.inputfiledelete = function(req, res, next) {
    const uploadpath = req.body.uploadpath;
    const filename = req.body.filename;

    if(filename){
        cloudinary.v2.uploader.destroy(filename,
          {invalidate: true, resource_type: 'raw'},
        function(err, result){
          if(err){
            console.log("Delete Input file Failed",filename,err);
            res.status(401).json({ success: false, 
              message:'Delete Input file Failed.'
            });
          }
          else {
            console.log("Delete Input file Success",filename);
            res.status(201).json({
                success: true,
                message: 'Delete Input file successful.'});    
          }
        });
    }
    else {
        console.log("No File selected !");
        res.status(402).json({
            success: false,
            message: 'No File selected !'});    
    };
}