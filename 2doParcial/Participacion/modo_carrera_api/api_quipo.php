<?php

header("Content-Type: application/json");

include "conexion.php";

$metodo = $_SERVER["REQUEST_METHOD"];

if ($metodo == "GET") {
    if (isset($_GET["id"])) {

        $id = $_GET["id"];

        $sql = "SELECT * FROM equipos WHERE id = $id";

        $resultado = $conexion->query($sql);

        if ($resultado->num_rows > 0) {
            $equipo = $resultado->fetch_assoc();
            echo json_encode($equipo);
        } else {
            echo json_encode([
                "mensaje" => "Equipo no encontrado"
            ]);
        }
    }
    else {
        $sql = "SELECT * FROM equipos";
        $resultado = $conexion->query($sql);
        $equipos = [];          
        while ($fila = $resultado->fetch_assoc()) {
            $equipos[] = $fila;
        }

        echo json_encode($equipos);
    }
}
elseif ($metodo == "POST") {

    $datos = json_decode(
        file_get_contents("php://input"),
        true
    );

    $nombre = $datos["nombre"];
    $liga = $datos["liga"];
    $presupuesto = $datos["presupuesto"];

    $sql = "INSERT INTO equipos
            (nombre, liga, presupuesto)
            VALUES
            ('$nombre', '$liga', '$presupuesto')";

    if ($conexion->query($sql)) {

        echo json_encode([
            "mensaje" => "Equipo agregado"
        ]);

    } else {

        echo json_encode([
            "mensaje" => "Error al agregar equipo"
        ]);
    }
}
elseif ($metodo == "PATCH") {

    if (!isset($_GET["id"])) {

        echo json_encode([
            "mensaje" => "Falta el ID"
        ]);

        exit;
    }

    $id = $_GET["id"];

    $datos = json_decode(
        file_get_contents("php://input"),
        true
    );

    $presupuesto = $datos["presupuesto"];

    $sql = "UPDATE equipos
            SET presupuesto = '$presupuesto'
            WHERE id = $id";

    if ($conexion->query($sql)) {

        echo json_encode([
            "mensaje" => "Equipo actualizado"
        ]);

    } else {

        echo json_encode([
            "mensaje" => "Error al actualizar equipo"
        ]);
    }
}

else {

    echo json_encode([
        "mensaje" => "Método no permitido"
    ]);
}

?>