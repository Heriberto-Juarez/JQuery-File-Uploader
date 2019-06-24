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

            if (!settings.validate) {
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
                    settings.maxSize = 5242880 * 30; //+100MB
                }
            }

            if (settings.validate) {
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

            that.settings = settings;

            if (!settings.allowedFormats && settings.validate) {
                settings.allowedFormats = ["image/jpeg", "image/jpg", "image/png"];
                that.setInputFormats();
            }

            if (!settings.messages) {
                that.setMessages();
            }

            that.validateOnChange();

        } else {
            this.container = null;
        }

    }

    setMessages() {
        let that = this;
        this.settings.messages = {
            es: {
                "invalidFileType": "El archivo \"" + that.fileInfo.name + "\" tiene formato invalido. Los formatos admitidos son: " + that.settings.allowedFormats.join(", "),
                "maxSizeExceded": "El archivo  \"" + that.fileInfo.name + "\" sobrepasó el tamaño de archivos permitido de " + that.settings.maxSize + " bytes"
            },
            en: {
                "invalidFileType": "The file \"" + that.fileInfo.name + "\" has an invalid type. Allowed file types are: " + that.settings.allowedFormats.join(", "),
                "maxSizeExceded": "The file \"" + that.fileInfo.name + "\" excedes the maximum size of " + that.settings.maxSize + " bytes"
            }
        };
    }

    setInputFormats() {
        let that = this, finalStr = '';
        for (let i = 0; i < that.settings.allowedFormats.length; i++) {
            finalStr += that.settings.allowedFormats[i].toLowerCase();
            if (i >= 0 && i < that.settings.allowedFormats.length - 1)
                finalStr += ',';
        }
        //Next line commented to test the validation process
        //that.input.attr("accept", finalStr);

    }

    validateOnChange() {
        let that = this;
        if (this.input !== undefined && this.input.length > 0 && that.settings.validate) {
            that.input.on("change", () => {

                that.isValid = true; //reset every file change

                if (that.messageContainerIsValid()) {
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
                if (that.isValid) {
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
        if (this.input !== undefined && this.input.length > 0)
            that.input.on("change", () => that.upload());
    }

    upload() {
        let that = this;
        if (this.request !== null && this.container !== null && that.input[0].files) {
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
            that.request.addEventListener("load", () => that.settings.done());
            if (that.request.upload) {
                that.request.upload.addEventListener("progress", (e) => {
                    that.progressBar.attr("value", Math.round((e.loaded / e.total) * 100));
                    console.log(that.progressBar.attr("value"), Math.round((e.loaded / e.total) * 100));
                });
            } else {
                that.progressBar.removeAttr("value"); //let it move automatically
            }
            that.request.addEventListener("error", that.settings.error);
            that.request.addEventListener("abort", that.settings.abort);
            that.request.open(that.settings.method, that.settings.url);
            that.request.send(data);
        }
    }
}

function request() {
    let peticion = null;
    try {
        peticion = new XMLHttpRequest();
    } catch (IntentarMs) {
        try {
            peticion = new ActiveXObject("Msxml2.XMLHTTP");
        } catch (OtroMs) {
            try {
                peticion = new ActiveXObject("Microsoft.XMLHTTP");
            } catch (fallo) {
                peticion = null;
            }
        }
    }
    return peticion;
}