<?php

header("Content-Type: application/json");
include "conexion.php";
$metodo = $_SERVER["REQUEST_METHOD"];
if ($metodo == "GET") {
    $sql = "SELECT * FROM transferencias";
    $resultado = $conexion->query($sql);
    $transferencias = [];

    while ($fila = $resultado->fetch_assoc()) {
        $transferencias[] = $fila;
    }
    echo json_encode($transferencias);
} else {

    echo json_encode([
        "mensaje" => "Método no permitido"
    ]);
}

?>