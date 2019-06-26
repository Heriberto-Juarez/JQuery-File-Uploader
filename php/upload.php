<?php


/*
 * Create upload directory if it does not exist
 **/
if (!file_exists('../upload')) {
    mkdir('../upload', 0777, true); //0777 is the octal representation of the rwx Read Write Execute file's permissions
}

$images = $_FILES['img'];
for($i = 0; $i<count($images['name']); $i++){
    move_uploaded_file($images['tmp_name'][$i], '../upload/' . $images['name'][$i]);
}