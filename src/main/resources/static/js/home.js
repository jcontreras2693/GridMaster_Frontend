let home = (function(){
    const gameIdInput = document.getElementById('gameIdInput');
    const joinGameButton = document.getElementById('joinGameButton');

    const saveGameData = function(playerName, gameCode) {
        sessionStorage.setItem('playerName', playerName);
        sessionStorage.setItem('gameCode', gameCode);
    };

    var createGame = async function(playerName) {

        const errorMessageDiv = document.getElementById('error-message');
    
        errorMessageDiv.textContent = '';
        errorMessageDiv.style.display = 'none';
    
        if (!playerName.trim()) {
            errorMessageDiv.textContent = "Pls, enter your name before to create a game";
            errorMessageDiv.style.display = 'block';
            return;
        }

        saveGameData(playerName);

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
    };

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

        // Guarda el code_verifier para usarlo más adelante al intercambiar el código
        sessionStorage.setItem("codeVerifier", codeVerifier);

        return codeChallenge;
    };

    let joinButton = function(){
        gameIdInput.style.display = 'inline-block';
        joinGameButton.style.display = 'inline-block';
    }
    
    let joinGame = function(gameCode, playerName){
        localStorage.setItem('gameCode', gameCode);

        const errorMessageDiv = document.getElementById('error-message');
    
        errorMessageDiv.textContent = '';
        errorMessageDiv.style.display = 'none';
    
        if (!playerName.trim()) {
            errorMessageDiv.textContent = "Pls, enter your name before to create a game";
            errorMessageDiv.style.display = 'block';
            return;
        }

        if (!gameCode.trim()){
            errorMessageDiv.textContent = "Pls, enter the code of a game";
            errorMessageDiv.style.display = 'block';
            return;
        }

        if (gameCode.length !== 4 || !/^\d+$/.test(gameCode)) { 
            errorMessageDiv.textContent = "The game code must be exactly 4 digits";
            errorMessageDiv.style.display = 'block';
            return;
        }

        api.getGameByCode(gameCode)
            .then(function(game) {
                return api.addPlayer(gameCode, playerName)
                    .then(() => game); 
            })
            .then((game) => {
                saveGameData(playerName, gameCode);
                sessionStorage.setItem('role', "PLAYER");
                return game;
            })
            .then((game) => {
                console.log("gameeeeeeeeeee: ", game);
                let state = game.gameState;
                sessionStorage.setItem('rows', game.dimension[0]);
                sessionStorage.setItem('columns', game.dimension[1]);
                if (state == "STARTED"){
                    window.location.href = `game.html`;
                } else{
                    window.location.href = `lobby.html`;
                }
            })
            .catch(error => {
                console.log("Error recibido:", error); // Imprime el error completo

                const status = error.status || error.statusCode || (error.response && error.response.status);

                if (status === 404) {
                    errorMessageDiv.textContent = "Game not found. Pls check the code and try again.";
                    errorMessageDiv.style.display = 'block';
                } else if (status === 403) {
                    errorMessageDiv.textContent = "Name is in use. Pls change it.";
                    errorMessageDiv.style.display = 'block';
                } else if (status === 409) {
                    errorMessageDiv.textContent = "Game is full. Cannot join.";
                    errorMessageDiv.style.display = 'block';
                } else {
                    console.error("Error al agregar jugador al juego:", error);
                }
            });
    }

    return {
        createGame,
        joinGame,
        joinButton,
        generateCodeVerifierAndChallenge,
        saveGameData
    };

})();

module.exports = home;