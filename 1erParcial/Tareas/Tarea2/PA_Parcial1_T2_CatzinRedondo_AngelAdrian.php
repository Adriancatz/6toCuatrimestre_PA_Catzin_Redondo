<?php
function multiplicar($a, $b) {
    if ($b = 0) {
        return 0;
    } else {
        return $a + multiplicar($a, $b - 1);
    }
}


echo "multiplicar 4 * 3 = " . multiplicar(4, 3) . "<br>";



?>