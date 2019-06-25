/**
* MIT License
* Copyright (c) 2019 Heriberto Juárez Jaimes
*
* Permission is hereby granted, free of charge, to any person obtaining a copy
* of this software and associated documentation files (the "Software"), to deal
* in the Software without restriction, including without limitation the rights
* to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
* copies of the Software, and to permit persons to whom the Software is
* furnished to do so, subject to the following conditions:
*
* The above copyright notice and this permission notice shall be included in all
* copies or substantial portions of the Software.
*
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
* IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
* FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
* AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
* LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
* OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
* SOFTWARE.
* */
class FileUploader {
    constructor(container, settings) {
        let that = this;
        container = container || null;
        settings = settings || {};
        this.request = request();

        if (container.length) {

            that.input = container.find("input[type='file']");
            that.progressBar = container.find("progress");
            that.container = container;
            if (!settings.hasOwnProperty("url")) {
                if (that.input.data("url"))
                    settings.url = that.input.data("url");
            }
            if (!settings.error)
                settings.error = () => {
                };
            if (!settings.done)
                settings.done = () => {
                };
            if (!settings.abort)
                settings.abort = () => {
                };
            if (!settings.method)
                settings.method = 'POST';

            if (!settings.hasOwnProperty("validate")) {
                settings.validate = true;
                if (!settings.onValid) {
                    settings.onValid = () => {
                    }
                }
                if (!settings.onInvalid) {
                    settings.onInvalid = () => {
                    }
                }
                if (!settings.maxSize) {
                    settings.maxSize = 5242880; //5MB
                }
            }

            if (settings.validate || settings.maxSize !== -1) {
                that.messageContainer = $("<p style='display: none; color: red;' '></p>");
                that.input.after(that.messageContainer);
                that.isValid = true;
            }


            if (!that.fileInfo) {
                that.fileInfo = {name: "unknown", type: "unknown", size: "unkwown"};
            }

            if (!settings.lan) {
                settings.lan = "en";
            }

            if(!settings.data) {
                settings.data = {};
            }

            that.settings = settings;

            if (that.settings.validate && !that.settings.allowedFormats) {
                that.settings.allowedFormats = ["image/jpeg", "image/jpg", "image/png"];
                that.setInputFormats();
            }

            if(!that.settings.maxFiles){
                that.settings.maxFiles = -1; // -1 will be taken as no limit.
            }else{
                that.validateMaxFiles();
            }

            if (!that.settings.messages) {
                that.setMessages();
            }

            if (!that.settings.hasOwnProperty("autoSend")) {
                that.settings.autoSend = false;
            }

            if (that.settings.autoSend) {
                that.uploadOnChange();
            }
            if(that.settings.validate) {
                that.validateOnChange();
            }
            that.allowUpload = true; //flag variable


        } else {
            this.container = null;
        }

    }

    validateMaxFiles() {
        let that = this;
        this.input.on("change", function () {
            if (that.messageContainerIsValid && that.isValid) {
                that.messageContainer.stop(true, false).slideUp().html("");
            }
            if(that.settings.maxFiles !== -1 && that.input[0].files.length > that.settings.maxFiles){
                that.setMessages();
                if (that.messageContainerIsValid) {
                    that.messageContainer.html(that.settings.messages[that.settings.lan].maxFiles).slideDown();
                }
                that.settings.onInvalid();
                that.allowUpload = false;
            }else{
                that.allowUpload = true;
            }
        });
    }

    setMessages() {
        let that = this;

        if(!that.settings.messages) {
            that.settings.messages = {};
        }

        if(!that.settings.messages.es){
            that.settings.messages.es ={};
        }
        if(!that.settings.messages.en){
            that.settings.messages.en ={};
        }
        if(that.settings.validate){
            that.settings.messages.es.invalidFileType = "El archivo \"" + that.fileInfo.name + "\" tiene formato invalido. Los formatos admitidos son: " + that.settings.allowedFormats.join(", ");
            that.settings.messages.es.maxSizeExceded = "El archivo  \"" + that.fileInfo.name + "\" sobrepasó el tamaño de archivos permitido de " + that.settings.maxSize + " bytes";

            that.settings.messages.en.invalidFileType = "The file \"" + that.fileInfo.name + "\" has an invalid type. Allowed file types are: " + that.settings.allowedFormats.join(", ");
            that.settings.messages.en.maxSizeExceded = "The file \"" + that.fileInfo.name + "\" excedes the maximum size of " + that.settings.maxSize + " bytes";
        }

        if(that.settings.maxFiles !== -1){
            that.settings.messages.es.maxFiles = "Seleccione un maximo de " + that.settings.maxFiles + " archivos.";
            that.settings.messages.en.maxFiles = "Select a maximum of " + that.settings.maxFiles + " files";
        }

    }

    setInputFormats() {
        let that = this, finalStr = '';
        for (let i = 0; i < that.settings.allowedFormats.length; i++) {
            finalStr += that.settings.allowedFormats[i].toLowerCase();
            if (i >= 0 && i < that.settings.allowedFormats.length - 1)
                finalStr += ',';
        }
        that.input.attr("accept", finalStr);
    }

    validateOnChange() {
        let that = this;
        if (this.input !== undefined && this.input.length > 0) {
            that.input.on("change", () => {
                that.isValid = true; //reset every file change
                /* If allowUpload is false we don't need to hide the message
                 * Actually, if its false, the maximum files allowed was exceeded, hence an error message was displayed.
                 */
                if (that.messageContainerIsValid() && that.allowUpload) {
                    that.messageContainer.stop(true, false).slideUp().html("");
                }
                if (window.FormData && window.Blob) {
                    for (let i = 0; i < that.input[0].files.length; i++) {
                        that.fileInfo.type = that.input[0].files[i].type;
                        that.fileInfo.name = that.input[0].files[i].name;
                        that.fileInfo.size = that.input[0].files[i].size;
                        that.setMessages(); // reset the messages content, so type, name and size of the file that caused an error will be shown
                        if (!that.settings.allowedFormats.includes(that.fileInfo.type)) {
                            if (that.messageContainerIsValid) {
                                that.messageContainer.html(that.settings.messages[that.settings.lan].invalidFileType).slideDown();
                            }
                            that.isValid = false;
                            break;
                        }

                        if (that.fileInfo.size > that.settings.maxSize) {
                            if (that.messageContainerIsValid) {
                                that.messageContainer.html(that.settings.messages[that.settings.lan].maxSizeExceded).slideDown();
                            }
                            that.isValid = false;
                            break;
                        }
                    }
                } else {
                    that.isValid = false;
                }
                if (that.isValid && that.allowUpload) {
                    if(that.settings.autoSend) {
                        that.upload();
                    }
                    that.settings.onValid();
                } else {
                    that.settings.onInvalid();
                }
            });
        }
    }

    messageContainerIsValid() {
        return (this.messageContainer !== null && this.messageContainer.hasOwnProperty(0) && $(this.messageContainer[0]).is("p"));
    }

    uploadOnChange() {
        let that = this;
        if (this.input !== undefined && this.input.length > 0){
            if(!that.settings.validate){
                that.input.on("change", function () {
                    that.upload();
                });
            }
        }
    }

    setData(data){
        this.settings.data =data;
    }

    upload() {
        let that = this;
        if (that.allowUpload && this.request !== null && this.container !== null && that.input[0].files && that.input[0].files.length>0) {
            let data = new FormData();
            let append = '';
            for (let i = 0; i < that.input[0].files.length; i++) {
                if (that.input.attr("name") === '') {
                    that.input.attr("name", "file_");
                }
                if (that.input.attr("multiple"))
                    append = "[]";
                else if (that.input[0].files.length !== 1)
                    append = i;
                data.append((that.input.attr("name") + append), that.input[0].files[i]);
            }
            //Append the data found in settings if available
            if ((typeof that.settings.data) === 'object') {
                $.each(that.settings.data, function (k, v) {
                    data.append(k, v);
                });
            }
            that.request.addEventListener("load", () => that.settings.done());
            if (that.request.upload) {
                that.request.upload.addEventListener("progress", (e) => {
                    that.progressBar.attr("value", Math.round((e.loaded / e.total) * 100));
                });
            } else {
                /*
                * If request.upload is not available, progress event isn't too.
                * So we remove progress bar's value because in some browsers when the value is not present
                * the progressbar moves from star to end, hence giving the effect of loading.
                **/
                that.progressBar.removeAttr("value");
            }
            that.request.addEventListener("error", that.settings.error);
            that.request.addEventListener("abort", that.settings.abort);
            that.request.open(that.settings.method, that.settings.url);
            that.request.send(data);
        }
    }
}

/*
* @return mixed req
* Returns the request available for different browsers, if no request is available 'null' is returned
* */
function request() {
    let req = null;
    try {
        req = new XMLHttpRequest();
    } catch (tryMS) {
        try {
            req = new ActiveXObject("Msxml2.XMLHTTP");
        } catch (otherMs) {
            try {
                req = new ActiveXObject("Microsoft.XMLHTTP");
            } catch (failed) {
                req = null;
            }
        }
    }
    return req;
}