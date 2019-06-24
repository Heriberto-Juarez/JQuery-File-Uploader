# JQuery File Uploader Class

![FileUploaderGif](https://user-images.githubusercontent.com/20604217/59996018-b583a680-961e-11e9-8758-b1808ccfbfd8.gif)

This class is a very easy to use and customize File uploader. 

It currently supports 2 languages:
* English
* Spanish

## Features:

**Note:** _Many of the features can be disabled/enabled and/or customized easily_

 * Progesssbar 
 * Allow certain file types only 
 * Limit file sizes
 * Add custom actions when the file is valid
 * Add custom actions when the file is invalid
 * You could simply upload a file with no validation if you want to
 * Display default messages or customize the messages for your needs
 * Upload as many files as you want
 * Limit the maximum amount of files to upload
 * Autoupload or do it whenever you indicate to the FileUploader throug upload Method
    
    
# Working Version
The current version of this branch has a working code but we still ned to write a manual and complete an example before merging the branch with master. 
However you are free to use the code.   


# Quick Manual

**The following code was taken from the working example you can see in the gif.**

### HTML needed:
A container with an identifier such as an ID or a class is important for the code to work.
Inside the container we must have a progressbar and a input of type file
```
<div class="file-uploader">
    <label for="img">Agregar imagen <i class="fas fa-cloud-upload-alt"></i></label>
    <progress value="0"></progress>
    <input type="file" name="img" id="img" data-url="<?= base_url() ?>Admin/actualizar_imagen_prod/">
</div>
```
### Javascript
```
let file_uploader = new FileUploader($(".file-uploader"), {
    lan: "es", //language 
    onValid: () => {
        //Here goes code you want to excecute when the validation is successful
        upload_btn.removeClass("disabled");
    },
    onInvalid: () => {
        //Here goes code you want to excecute when the validation isn't successful
        upload_btn.addClass("disabled");
    }
});

/**
* Depending on your needs you can upload a file manually 
*/
file_uploader.upload();

/**
* Or you can auto-upload the file as soon as it is selected by calling the next method after the object instantiation
*/
file_uploader.uploadOnChange();

```
