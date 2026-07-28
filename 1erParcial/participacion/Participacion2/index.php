<?php

function contarOcurrencias($arreglo, $numero){
    //mi caso base si el arreglo esta vacio
    if (empty ($arreglo )){
        return 0;
    }
    //aqui tomamos el primero elemento 
    $primerElemento = array_shift($arreglo);
//aqui verifica si coincide con el numero buscado 
    if ($primerElemento == $numero) {
        return 1 + contarOcurrencias($arreglo, $numero);
    } else {
        return 0 + contarOcurrencias($arreglo, $numero);
    }
}
//esto ya es el ejemplo pero puede cambiar si cambiamos el contenido de la variable osea lo numero 
    $arreglo2 = [2, 3, 4, 6, 5, 2, 7, 7, 7, 7, 7, ];

    echo "el numero 7 aparece " . contarOcurrencias($arreglo2, 7) . "veces.";





?>