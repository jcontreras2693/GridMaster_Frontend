var lobby = (function(){
    let urlParams = new URLSearchParams(window.location.search);
    let playerName = urlParams.get('playerName');
    let gameCode = urlParams.get('gameCode');
    let columns = 100;
    let rows = 100;
    let minutes = 5;
    let seconds = 0;
    let maxPlayer = 4;
    let validateInputs = true;

    var setGameCode = function(code){
        gameCode = code;
        console.log("se intenta cambiar el valor del código por: ", code);
        const gameCodeHTML = document.getElementById('gameCodeDisplay');
        if (gameCodeHTML) {
            console.log("se cambia el código");
            gameCodeHTML.textContent = `(${gameCode})`;
        }
    }

    var setPlayerName = function(name){
        playerName = name;
    }

    var setDimensions = function(cols, rws) {
        const errorMessageDiv = document.getElementById('error-message');
        errorMessageDiv.textContent = '';  // Limpiar mensaje anterior
        errorMessageDiv.style.display = 'none';  // Ocultar mensaje

        // Validar las dimensiones
        if (cols < 20 || cols > 100 || rws < 20 || rws > 100) {
            // Mostrar mensaje de error
            errorMessageDiv.textContent = 'Board dimensions must be between 20x20 and 100x100.';
            errorMessageDiv.style.display = 'block';
            validateInputs = false;
            return; // No establecer las dimensiones si son inválidas
        }

        columns = cols;
        rows = rws;
        validateInputs = true;
    };

    var setTime = function(min, sec) {
        const errorMessageDiv = document.getElementById('error-message');
        errorMessageDiv.textContent = '';  // Limpiar mensaje anterior
        errorMessageDiv.style.display = 'none';  // Ocultar mensaje

        // Validar las dimensiones
        if (min < 1 || min > 5 || sec < 0 || sec > 59) {
            // Mostrar mensaje de error
            errorMessageDiv.textContent = 'Time must be between 1:00 and 5:59';
            errorMessageDiv.style.display = 'block';
            validateInputs = false;
            return; // No establecer las dimensiones si son inválidas
        }

        minutes = min;
        seconds = sec;
        validateInputs = true;
    };

    var setMaxPlayer = function(maxP) {
        const errorMessageDiv = document.getElementById('error-message');
        errorMessageDiv.textContent = '';  // Limpiar mensaje anterior
        errorMessageDiv.style.display = 'none';  // Ocultar mensaje

        // Validar las dimensiones
        if (maxP < 2 || maxP > 10) {
            // Mostrar mensaje de error
            errorMessageDiv.textContent = 'The maximum number of players must be between 2 and 10';
            errorMessageDiv.style.display = 'block';
            validateInputs = false;
            return; // No establecer las dimensiones si son inválidas
        }

        maxPlayer = maxP;
        validateInputs = true;
    };

    var startGame = function() {

        if (!validateInputs) {
            alert('Please fix the errors in the form before starting the game.');
            return;
        }

        api.updateGame(gameCode, minutes, seconds, rows, columns, maxPlayer);

        //window.location.href = `game.html?playerName=${encodeURIComponent(playerName)}&gameCode=${encodeURIComponent(gameCode)}&rows=${rows}&columns=${columns}`;

        
        api.startGame(gameCode)
            .then(() => {
                window.location.href = `game.html?playerName=${encodeURIComponent(playerName)}&gameCode=${encodeURIComponent(gameCode)}&rows=${rows}&columns=${columns}`;
            })
            .catch(error => {
                console.error("Error al iniciar el juego juego: ", error);
            });

    };

    // Agregar eventos de cambio a los inputs
    document.getElementById('columns').addEventListener('input', function() {
        var cols = parseInt(document.getElementById('columns').value);
        var rws = parseInt(document.getElementById('rows').value);
        setDimensions(cols, rws);
    });

    document.getElementById('rows').addEventListener('input', function() {
        var cols = parseInt(document.getElementById('columns').value);
        var rws = parseInt(document.getElementById('rows').value);
        setDimensions(cols, rws);
    });

    document.getElementById('minutes').addEventListener('input', function() {
        var min = parseInt(document.getElementById('minutes').value);
        var sec = parseInt(document.getElementById('seconds').value);
        setTime(min, sec);
    });
    
    document.getElementById('seconds').addEventListener('input', function() {
        var min = parseInt(document.getElementById('minutes').value);
        var sec = parseInt(document.getElementById('seconds').value);
        setTime(min, sec);
    });

    document.getElementById('maxPlayers').addEventListener('input', function() {
        var maxP = parseInt(document.getElementById('maxPlayers').value, 10);
        setMaxPlayer(maxP);
    });

    return {
        setGameCode,
        setDimensions,
        setTime,
        setPlayerName,
        startGame
    };

})();

document.addEventListener('DOMContentLoaded', function() {
    // Llamar a setGameCode al cargar la página
    const urlParams = new URLSearchParams(window.location.search);
    const gameCode = urlParams.get('gameCode');

    // Verificar que gameCode esté presente en la URL
    if (gameCode) {
        console.log("Entra a la funcion para enviar el cambio del código");
        lobby.setGameCode(gameCode);  // Llamar a setGameCode con el código del juego
    } else {
        console.error("El parámetro 'gameCode' no está presente en la URL.");
    }

    // Establecer los valores predeterminados de la configuración en los inputs
    document.getElementById('columns').value = 100; 
    document.getElementById('rows').value = 100;    
    document.getElementById('minutes').value = 5;   
    document.getElementById('seconds').value = 0;  
    document.getElementById('maxPlayers').value = 4; 
});
