<?php

$images = $_FILES['img'];
for($i = 0; $i<count($images['name']); $i++){
    move_uploaded_file($images['tmp_name'][$i], '../upload/' . $images['name'][$i]);
}