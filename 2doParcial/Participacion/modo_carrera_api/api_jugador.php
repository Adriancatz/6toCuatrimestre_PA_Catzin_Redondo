<?php

header("Content-Type: application/json");

include "conexion.php";

$metodo = $_SERVER["REQUEST_METHOD"];

if ($metodo == "GET") {
    if (isset($_GET["id"])) {

        $id = $_GET["id"];

        $sql = "SELECT * FROM jugadores WHERE id = $id";

        $resultado = $conexion->query($sql);

        if ($resultado->num_rows > 0) {

            $jugador = $resultado->fetch_assoc();

            echo json_encode($jugador);

        } else {

            echo json_encode([
                "mensaje" => "Jugador no encontrado"
            ]);
        }
    }
    elseif (isset($_GET["nombre"])) {

        $nombre = $_GET["nombre"];

        $sql = "SELECT * FROM jugadores 
                WHERE nombre LIKE '%$nombre%'";

        $resultado = $conexion->query($sql);

        $jugadores = [];

        while ($fila = $resultado->fetch_assoc()) {
            $jugadores[] = $fila;
        }

        echo json_encode($jugadores);
    }
    else {

        $sql = "SELECT * FROM jugadores";

        $resultado = $conexion->query($sql);

        $jugadores = [];

        while ($fila = $resultado->fetch_assoc()) {
            $jugadores[] = $fila;
        }

        echo json_encode($jugadores);
    }
}
elseif ($metodo == "POST") {

    $datos = json_decode(
        file_get_contents("php://input"),
        true
    );

    $nombre = $datos["nombre"];
    $posicion = $datos["posicion"];
    $valorMercado = $datos["valor_mercado"];
    $mediaGlobal = $datos["media_global"];
    $equipoId = $datos["equipo_id"];

    $sql = "INSERT INTO jugadores
            (nombre, posicion, valor_mercado, media_global, equipo_id)
            VALUES
            ('$nombre', '$posicion', '$valorMercado', '$mediaGlobal', '$equipoId')";

    if ($conexion->query($sql)) {

        echo json_encode([
            "mensaje" => "Jugador agredado"
        ]);

    } else {

        echo json_encode([
            "mensaje" => "Error al agregar al jugador"
        ]);
    }
}
elseif ($metodo == "PATCH") {

    if (!isset($_GET["id"])) {

        echo json_encode([
            "mensaje" => "falta la ID"
        ]);

        exit;
    }

    $id = $_GET["id"];

    $datos = json_decode(
        file_get_contents("php://input"),
        true
    );

    $valorMercado = $datos["valor_mercado"];
    $mediaGlobal = $datos["media_global"];

    $sql = "UPDATE jugadores
            SET valor_mercado = '$valorMercado',
                media_global = '$mediaGlobal'
            WHERE id = $id";

    if ($conexion->query($sql)) {

        echo json_encode([
            "mensaje" => "se actualizo el jugador"
        ]);

    } else {

        echo json_encode([
            "mensaje" => "Error al actualizar al jugador"
        ]);
    }
}

else {

    echo json_encode([
        "mensaje" => "Método no permitido"
    ]);
}

?>