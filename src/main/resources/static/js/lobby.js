var lobby = (function(){
    let playerName = sessionStorage.getItem('playerName');
    let playerRole = "";
    let gameCode = sessionStorage.getItem('gameCode');
    let columns = 100;
    let rows = 100;
    let minutes = 5;
    let seconds = 0;
    let maxPlayer = 4;
    let validateInputs = true;
    let stompConnection = "http://4.156.250.133"
    //let stompConnection = "https://gridmasterbackend-cdezamajdeadcchu.eastus-01.azurewebsites.net"
    //let stompConnection = "http://localhost:8080"
    let stompClient = null;


    var getDimensions = function() {
        return {
            columns: columns,  // Acceder directamente a las variables internas
            rows: rows
        };
    }

    var getMaxPlayer = function() {
        return maxPlayer;
    }

    var getMinutes = function() {
        return minutes;
    }

    var getSeconds = function() {
        return seconds;
    }

    var setGameCode = function(){
        const gameCodeHTML = document.getElementById('gameCodeDisplay');
        if (gameCodeHTML) {
            gameCodeHTML.textContent = `(${gameCode})`;
        }
    }
    
    var setPlayerName = function(){
        gameCode = sessionStorage.getItem('gameCode');
        api.getPlayer(gameCode, playerName)
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

    const saveGameData = function(rows, columns) {
        sessionStorage.setItem('rows', rows);
        sessionStorage.setItem('columns', columns);
    };


    let sendSettingsToTopic = function (updatedSetting) {
        if (stompClient && stompClient.connected) {
            stompClient.send('/topic/game/' + gameCode + "/settings", {}, JSON.stringify(updatedSetting));
            console.log("Enviando configuración actualizada: ", updatedSetting);
        } else {
            console.error("No se pudo enviar la configuración. StompClient no está conectado.");
        }
    };

    let setDimensions = function(cols, rws) {
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

    let setTime = function(min, sec) {
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

    let setMaxPlayer = function(maxP) {
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

    let startGame = function() {

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
                saveGameData(rows, columns);
            })
            .then(() => {
                window.location.href = `game.html`;
            })
            .then(() => {
                disconnect();
            })
            .catch(error => {
                console.error("Error al iniciar el juego juego: ", error);
            });
    };

    let exitGame = function() {

        if (!validateInputs) {
            alert('Please fix the errors in the form before starting the game.');
            return;
        }
        
        api.deletePLayer(gameCode, playerName)
            .then(() => {
                window.location.href = `index.html`;
            })
            .then(() => {
                disconnect();
            })
            .catch(error => {
                console.error("Error al jugador del juego: ", error);
            });

    };

    let updateSettings = function (settings) {
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

    let updatePlayersTable = function(players) {
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
        let socket = new SockJS(stompConnection + '/stompendpoint');
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
                saveGameData(rows, columns);
                window.location.href = `game.html`;
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

    function disconnect() {
        if (stompClient != null) {
            stompClient.disconnect();
        }
        console.log("Disconnected");
    }

    // Agregar eventos de cambio a los inputs
    document.getElementById('columns').addEventListener('input', function() {
        let cols = parseInt(document.getElementById('columns').value);
        let rws = parseInt(document.getElementById('rows').value);
        setDimensions(cols, rws);
    });

    document.getElementById('rows').addEventListener('input', function() {
        let cols = parseInt(document.getElementById('columns').value);
        let rws = parseInt(document.getElementById('rows').value);
        setDimensions(cols, rws);
    });

    document.getElementById('minutes').addEventListener('input', function() {
        let min = parseInt(document.getElementById('minutes').value);
        let sec = parseInt(document.getElementById('seconds').value);
        setTime(min, sec);
    });
    
    document.getElementById('seconds').addEventListener('input', function() {
        let min = parseInt(document.getElementById('minutes').value);
        let sec = parseInt(document.getElementById('seconds').value);
        setTime(min, sec);
    });

    document.getElementById('maxPlayers').addEventListener('input', function() {
        let maxP = parseInt(document.getElementById('maxPlayers').value, 10);
        setMaxPlayer(maxP);
    });

        return {
            setGameCode,
            setDimensions,
            setTime,
            setPlayerName,
            startGame,
            exitGame,
            connectAndSubscribe,
            saveGameData,
            getDimensions,
            setMaxPlayer,
            getMaxPlayer,
            getMinutes,
            getSeconds,
            updateSettings
        };

    })();

//module.exports = lobby;

document.addEventListener('DOMContentLoaded', function () {

    document.getElementById('columns').value = 100;
    document.getElementById('rows').value = 100;
    document.getElementById('minutes').value = 5;
    document.getElementById('seconds').value = 0;
    document.getElementById('maxPlayers').value = 4;

    let playerName = sessionStorage.getItem('playerName');
    let role = sessionStorage.getItem('role');
    console.log("rol del jugador: ", role);

    if (role != "PLAYER"){
        const params = new URLSearchParams(window.location.search);
        const authCode = params.get("code");
        console.log("codigo de acceso: ", authCode);
        if (!authCode) {
            alert("No authorization code found. Redirecting to login...");
            redirectToAuthentication(playerName);
        }
        api.createGame(playerName)
            .then(code => {
                let gameCode = code;
                sessionStorage.setItem('gameCode', gameCode);
                return api.addPlayer(gameCode, playerName);
            })
            .then(() => {
                lobby.setPlayerName();
                lobby.setGameCode(); 
            })
            .catch(error => {
                console.error("Error al crear el juego o añadir el jugador:", error);
            });
    } else{
        lobby.setPlayerName();
        lobby.setGameCode(); 
    }

    //exchangeCodeForToken(authCode);

});

async function redirectToAuthentication(playerName) {
    
    const codeChallenge = await generateCodeVerifierAndChallenge();
    
    const baseUrl = "https://authenticationGR.b2clogin.com/authenticationGR.onmicrosoft.com/oauth2/v2.0/authorize";
    const params = new URLSearchParams({
        p: "B2C_1_LogIn-SignUp_GR",
        client_id: "03ace639-70be-422e-ae33-9c80e173acf4",
        nonce: "defaultNonce",
        redirect_uri: "https://gentle-coast-03f74f10f.5.azurestaticapps.net/lobby.html",
        scope: "openid",
        response_type: "code",
        prompt: "login",
        code_challenge_method: "S256",
        code_challenge: codeChallenge,
        login_hint: playerName, // Aquí agregas el valor capturado
    });

    const loginUrl = `${baseUrl}?${params.toString()}`;
    window.location.href = loginUrl;
}

var generateCodeVerifierAndChallenge = async function() {
    const generateCodeVerifier = () => {
        const array = new Uint8Array(32);
        window.crypto.getRandomValues(array);
        let base64String = btoa(String.fromCharCode(...array));

        // Eliminar los signos '=' al final sin usar expresión regular
        while (base64String.endsWith('=')) {
            base64String = base64String.slice(0, -1);
        }

        // Sustituir los caracteres '+' por '-' y '/' por '_'
        base64String = base64String.replace(/\+/g, '-').replace(/\//g, '_');

        return base64String;
    };

    const generateCodeChallenge = async (codeVerifier) => {
        const encoder = new TextEncoder();
        const data = encoder.encode(codeVerifier);
        const digest = await crypto.subtle.digest("SHA-256", data);
        let base64String = btoa(String.fromCharCode(...new Uint8Array(digest)));

        // Eliminar los signos '=' al final sin usar expresión regular
        while (base64String.endsWith('=')) {
            base64String = base64String.slice(0, -1);
        }

        // Sustituir los caracteres '+' por '-' y '/' por '_'
        base64String = base64String.replace(/\+/g, '-').replace(/\//g, '_');

        return base64String;
    };

    const codeVerifier = generateCodeVerifier();
    const codeChallenge = await generateCodeChallenge(codeVerifier);

    // Guarda el code_verifier para usarlo más adelante al intercambiar el código.
    sessionStorage.setItem("codeVerifier", codeVerifier);

    return codeChallenge;
}

async function exchangeCodeForToken(authCode) {
    const tokenEndpoint = "https://authenticationgr.b2clogin.com/authenticationGR.onmicrosoft.com/B2C_1_LogIn-SignUp_GR/oauth2/v2.0/token";

    // Recuperar el code_verifier del sessionStorage
    const codeVerifier = sessionStorage.getItem("codeVerifier");
    if (!codeVerifier) {
        console.error("Code verifier not found. Authorization flow might not have been initiated correctly.");
        return null;
    }

    const params = new URLSearchParams({
        grant_type: "authorization_code",
        client_id: "03ace639-70be-422e-ae33-9c80e173acf4",
        code: authCode,
        redirect_uri: "https://gentle-coast-03f74f10f.5.azurestaticapps.net/lobby.html",
        code_verifier: codeVerifier, // Recuperado del sessionStorage
    });

    const response = await fetch(tokenEndpoint, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params.toString(),
    });

    if (!response.ok) {
        console.error("Error exchanging code for token:", response.status, await response.text());
        return null;
    }

    const data = await response.json();
    console.log("Data responce", data);

    // Devuelve el token o guárdalo en el sessionStorage si lo necesitas
    sessionStorage.setItem("accessToken", data.access_token);
    return data.access_token;
}

function createGameForPlayer(playerName, accessToken) {

    console.log("accessToken: ", accessToken);
    api.createGame(playerName, accessToken)
        .then((gameCode) => {
            // Guarda los datos del juego
            lobby.setGameCode(gameCode);

            alert(`Game created successfully! Game code: ${gameCode}`);
        })
        .catch((error) => {
            console.error("Error creating game:", error);
            alert("Failed to create the game. Please try again.");
        });
}
