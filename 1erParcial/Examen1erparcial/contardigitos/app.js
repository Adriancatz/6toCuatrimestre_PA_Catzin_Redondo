function contarDigitos(numero){
    numero = Math.abs(numero);

    if (numero < 10){
        return 1;
    } 
    return 1 + contarDigitos(Math.floor(numero / 10));
}


document.getElementById ('btnContar').addEventListener('click', function() {
    let valorInput = document.getElementById('inputNumero').value;

    let numero = parseInt(valorInput);

    if (isNaN(numero)) {
        document.getElementById('resultado').innerText = "ingresa un numero valido";
        return;
    }
    let totalDigitos = contarDigitos(numero);

    document.getElementById('resultado').innerText = "Digitos: " + totalDigitos;
});
