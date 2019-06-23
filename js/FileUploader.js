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

            if (settings.hasOwnProperty("url")) {
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

            if(!settings.validate) {
                settings.validate = true;
                if(!settings.onValid) {
                    settings.onValid = () =>{}
                }
                if(!settings.onInvalid) {
                    settings.onInvalid = () =>{}
                }
                if(!settings.maxSize) {
                    settings.maxSize = 5242880; //5MB
                }
            }
            that.settings = settings;
            /*
            * Its important to keep the next conditional and its content after this.settings= settings because
            * allowedFormats method needs to access allowed formats as a class variable.
            * */
            if (!settings.allowedFormats && settings.validate) {
                settings.allowedFormats = ["image/jpeg", "image/jpg", "image/png"];
                that.setInputFormats();
            }



        } else {
            this.container = null;
        }


        console.log(this);

    }

    setInputFormats() {
        let that = this, finalStr = '';
        for (let i = 0; i < that.settings.allowedFormats.length; i++) {
            finalStr += that.settings.allowedFormats[i];
            if (i >= 0 && i < that.settings.allowedFormats.length - 1)
                finalStr += ',';
        }
        that.input.attr("accept", finalStr);
    }

    uploadOnChange() {
        let that = this;
        if (this.input !== undefined && this.input.length > 0)
            that.input.on("change", () => that.upload($(this)));
    }

    validateOnChange() {
        this.input.on("change", function () {
        });
    }

    upload() {
        let that = this;
        if (this.request !== null && this.container !== null && that.input.files && that.input.files.length > 0) {
            let data = new FormData();
            let append = '';
            for (let i = 0; i < that.input.files.length; i++) {
                if (that.input.attr("name") === '') {
                    that.input.attr("name", "file_");
                }
                if (that.input.attr("multiple"))
                    append = "[]";
                else if (that.input.files.length !== 1)
                    append = i;
                data.append((input.attr("name") + append), input.files[i]);
            }
            that.request.addEventListener("load", () => {
                that.progressBar.attr("value", 0);
            });
            if (that.request.hasOwnProperty("upload"))
                that.request.addEventListener("progress", (e) => that.progressBar.attr("value", Math.round((e.loaded / e.total) * 100)));
            else
                that.progressBar.removeAttr("value"); //let it move automatically
            that.request.addEventListener("error", that.settings.error);
            that.request.addEventListener("abort", that.settings.abort);
            that.request.open(that.settings.method, that.settings.url);
            that.request.onreadystatechange = (e) => {
                if (that.request.readyState === 4) {
                    if (that.request.status === 200)
                        that.settings.done();
                    else
                        that.settings.error();
                }
            };
            that.request.send(data);
        }
    }
}