var lobby = (function(){
    let urlParams = new URLSearchParams(window.location.search);
    let playerName = urlParams.get('playerName');
    let playerRole = "";
    let gameCode = urlParams.get('gameCode');
    let columns = 100;
    let rows = 100;
    let minutes = 5;
    let seconds = 0;
    let maxPlayer = 4;
    let validateInputs = true;
    // let stompConnection = "https://gridmasterbackend-cdezamajdeadcchu.eastus-01.azurewebsites.net"
    let stompConnection = "http://localhost:8080"
    let stompClient = null;

    var setGameCode = function(code){
        gameCode = code;
        const gameCodeHTML = document.getElementById('gameCodeDisplay');
        if (gameCodeHTML) {
            gameCodeHTML.textContent = `(${gameCode})`;
        }
    }

    var setPlayerName = function(name){
        playerName = name;

        api.getPlayer(gameCode, name)
            .then(function(player) {
                playerRole = player.playerRole;   
            })
            .then(() => {
                if (playerRole != "ADMIN"){
                    disableConfigurations();
                }
                connectAndSubscribe();
            });
            /*
            .then(() => {
                console.log("Enviando nuevo jugador:", playerName);  // Verificar que estamos enviando el nombre correcto
                stompClient.send(
                    '/topic/game/' + gameCode + "/NewPlayer",
                    {},
                    JSON.stringify({ name: playerName })
                );
            });*/
    }

    var sendSettingsToTopic = function (updatedSetting) {
        if (stompClient && stompClient.connected) {
            stompClient.send('/topic/game/' + gameCode + "/settings", {}, JSON.stringify(updatedSetting));
            console.log("Enviando configuración actualizada: ", updatedSetting);
        } else {
            console.error("No se pudo enviar la configuración. StompClient no está conectado.");
        }
    };

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

        sendSettingsToTopic({ dimension: { first: rows, second: columns } });
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

        sendSettingsToTopic({ minutes: minutes, seconds: seconds });
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

        sendSettingsToTopic({ maxPlayers: maxPlayer });
    };

    var startGame = function() {

        if (!validateInputs) {
            alert('Please fix the errors in the form before starting the game.');
            return;
        }
        
        api.updateGame(gameCode, minutes, seconds, rows, columns, maxPlayer)
            .then(() => {
                api.startGame(gameCode);    
            })
            .then(() => {
                const message = {
                    gameCode: gameCode,
                    rows: document.getElementById('rows').value,
                    columns: document.getElementById('columns').value
                };
                
                stompClient.send('/topic/game/' + gameCode + "/startGame", {}, JSON.stringify(message));
            })
            .then(() => {
                window.location.href = `game.html?playerName=${encodeURIComponent(playerName)}&gameCode=${encodeURIComponent(gameCode)}&rows=${rows}&columns=${columns}`;
            })
            .catch(error => {
                console.error("Error al iniciar el juego juego: ", error);
            });

    };

    var exitGame = function() {

        if (!validateInputs) {
            alert('Please fix the errors in the form before starting the game.');
            return;
        }
        
        api.deletePLayer(gameCode, playerName)
            .then(() => {
                window.location.href = `index.html`;
            })
            .catch(error => {
                console.error("Error al jugador del juego: ", error);
            });

    };

    var updateSettings = function (settings) {
        console.log("Configuraciones recibidas: ", settings);
    
        if (settings.dimension) {
            if('first' in settings.dimension){
                let rws = settings.dimension.first;
                const rowsHTML = document.getElementById('rows');
                rowsHTML.value = rws;
                console.log("rows =", rws);
            }

            if ('second' in settings.dimension){
                let colms = settings.dimension.second;
                const columnsHTML = document.getElementById('columns');
                columnsHTML.value = colms;
                console.log("columns =", colms);
            }
        }

        if ('minutes' in settings && 'seconds' in settings) {
            let min = settings.minutes;
            let sec = settings.seconds;
    
            const minutesHTML = document.getElementById('minutes');
            const secondsHTML = document.getElementById('seconds');
    
            minutesHTML.value = min;
            secondsHTML.value = sec;
    
            console.log("Actualizado tiempo: minutes =", min, ", seconds =", sec);
        }
    
        // Verificar si existe 'maxPlayers' y actualizar número máximo de jugadores
        if ('maxPlayers' in settings) {
            let maxP = settings.maxPlayers;
    
            const maxPlayersHTML = document.getElementById('maxPlayers');
            maxPlayersHTML.value = maxP;
    
            console.log("Actualizado número máximo de jugadores: maxPlayers =", maxP);
        }
    };

    var updatePlayersTable = function(players) {
        console.log("SE HA UNIDO ", playerName);
        const scoreTableBody = document.querySelector('#playersTable tbody'); 
        scoreTableBody.innerHTML = ""; // Limpia las filas anteriores

        Object.entries(players).forEach(([player, score], index) => {
            if (player != "EMPTY"){
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${player}</td>
                `;
                scoreTableBody.appendChild(row);  
            }  
        });
    };
    

    function connectAndSubscribe() {
        var socket = new SockJS(stompConnection + '/stompendpoint');
        stompClient = Stomp.over(socket);
        console.log("Connecting...");
        console.log(stompClient);
        stompClient.connect({}, function (frame) {
            console.log('Connected: ' + frame);
            stompClient.subscribe('/topic/game/' + gameCode + "/settings", function(data){
                settings = JSON.parse(data.body);
                updateSettings(settings);
            });

            stompClient.subscribe('/topic/game/' + gameCode + "/NewPlayer", function(data){
                player = JSON.parse(data.body);
                console.log("Nuevo jugador recibido: ", player);  // Verificar que los datos del jugador se reciben correctamente
                updatePlayersTable(player);
            });

            stompClient.subscribe('/topic/game/' + gameCode + "/startGame", function(data) {
                const startGameData = JSON.parse(data.body);
                console.log("Iniciando juego, redirigiendo a todos los jugadores...");
                window.location.href = `game.html?playerName=${encodeURIComponent(playerName)}&gameCode=${encodeURIComponent(startGameData.gameCode)}&rows=${startGameData.rows}&columns=${startGameData.columns}`;
            });
            
            api.getScore(gameCode).then(function(players) {
                console.log("Score", players);
                stompClient.send('/topic/game/' + gameCode + "/NewPlayer", {}, JSON.stringify(players));
            });

        });

    }

    function disableConfigurations() {
        const inputs = document.querySelectorAll('input');
    
        inputs.forEach(input => input.disabled = true); // Deshabilitar inputs

        // Deshabilitar el botón "Start Game"
        const startButton = document.getElementById('start');
        if (startButton) {
            startButton.disabled = true;
        }
    }

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
        startGame,
        exitGame,
        connectAndSubscribe
    };

})();

document.addEventListener('DOMContentLoaded', function() {
    // Llamar a setGameCode al cargar la página
    let urlParams = new URLSearchParams(window.location.search);
    let gameCode = urlParams.get('gameCode');
    let playerName = urlParams.get('playerName');

    lobby.setPlayerName(playerName);

    // Verificar que gameCode esté presente en la URL
    if (gameCode) {
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
