# JQuery File Uploader

This is a javascript class that provides the ability to upload files through ajax and show the progress in an html progress bar

![JqueryFileUploaderGif](https://user-images.githubusercontent.com/20604217/60099872-278ee500-971e-11e9-9dab-d8bcc430118a.gif)



## Features:

* Display the upload progress in a progress bar
* Files custom/default validation
* Automatic/Manual upload
* Single/Multiple files upload
* Optional files limit
* Custom actions when a validation is succesful or not
* Custom actions on a request error/success/abort
* Enable/disable many of the features


## Installation

You can install this package via 

    npm i @herii/jquery-file-uploader  

Or you can clone this repo here:

https://github.com/Heriberto-Juarez/JQuery-File-Uploader.git

You will need to call jQuery and the **FileUploader.js** file for the code to work.
You will also need a way to upload files, for this project you can find 
**upload.php** file in php folder. Its a simple script that uploads files.


## Usage:

## Basic HTML

You will need a container *The container is essential* for the functionality. Inside the container
there must be a input of type *file* and a progressbar.

Example: 
````
<div id="container-test" class="custom-styles">
    <label for="img">Select File</label>
    <input type="file" name="img" id="img" data-url="php/upload.php" multiple>
    <progress value="0"></progress>
</div>
````

## Javascript

For the javascript class to work, we need to identify the previously
created container, ours have the id **container-test**

An object must be created an as a first argument the container must be passed, a second an optional argument is an object with settings.
````
let container = $("#container-test");
let my_file_uploader = new FileUploader(container, {autoSend: true});
````


## Settings
| Property      | Default value | Description          | Optional Example |
| ------------- |:-------------:  | -----:|---:|
| error         | `empty function`  | A function executed in case of upload error             |         |
| done          | `empty function`  | A function executed in case of successful upload        |         |
| abort         | `empty function`  | A function executed in case of an aborted upload        |         |
| method        | `POST`            | Ajax method used to send files                          |         |
| validate      | `true`            | Indicates whether the files should be validated         |         |
| autoSend      | `false`           | Indicates whether the files should be sent automatically|         |
| onValid       | `empty function`  | A function executed in case of valid files selected     |         |
| onInvalid     | `empty function`  | A function executed in case of invalid files selected   |         |
| onInvalid     | `empty function`  | A function executed in case of invalid files selected   |         |
| maxSize       | `5242880`         | The maximum size allowed for each file in bytes         |         |
| maxFiles      | -1                | The maximum amount of files allowed, if the value is -1 then the script will allow unlimited files         |         |
| data          | `Object`   | The maximum size allowed for each file in bytes         | `{key:value, key2: value}`        |


## Manipulate formats
Different projects require different file types, so you may want 
to allow different sets of file formats or types.

The next methods will allow you to manipulate the formats you allow.

The file types or formats are the file MIME Types:
For example: *image/png*

* `.addFormat(f);` Add the format *f*
* `.removeFormat(f);` Remove the format *f*
* `setAllFormats(array_of_formats);` Set the allowed formats to the ones contained inside the array


## Tips:

* Assign values to `onValid` and `onInvalid` callback functions to enable and disable a button such as in the example found at *index.html*
* Check the example at *index.html* to understand the File uploader use.
