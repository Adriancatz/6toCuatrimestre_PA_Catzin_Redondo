<?php

$conexion = new mysqli(
    "localhost",
    "root",
    "",
    "modo_carrera"
);

if ($conexion->connect_error) {
    die("Error de conexión");
}

?>