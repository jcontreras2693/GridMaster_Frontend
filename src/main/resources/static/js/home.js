let home = (function(){
    const gameIdInput = document.getElementById('gameIdInput');
    const joinGameButton = document.getElementById('joinGameButton');

    const saveGameData = function(playerName, gameCode) {
        sessionStorage.setItem('playerName', playerName);
        sessionStorage.setItem('gameCode', gameCode);
    };

    var createGame = function(playerName) {

        const errorMessageDiv = document.getElementById('error-message');
    
        errorMessageDiv.textContent = '';
        errorMessageDiv.style.display = 'none';
    
        if (!playerName.trim()) {
            errorMessageDiv.textContent = "Pls, enter your name before to create a game";
            errorMessageDiv.style.display = 'block';
            return;
        }

        sessionStorage.setItem("playerName", playerName);
    
        // Genera el `code_verifier` y `code_challenge`
        const codeVerifier = generateCodeVerifier();
        generateCodeChallenge(codeVerifier).then(codeChallenge => {
            // Guarda el `code_verifier` para usarlo más tarde en el intercambio
            sessionStorage.setItem("codeVerifier", codeVerifier);

            const baseUrl = "https://authenticationgr.b2clogin.com/authenticationGR.onmicrosoft.com/oauth2/v2.0/authorize";
            const params = new URLSearchParams({
                p: "B2C_1_LogIn-SignUp_GR",
                client_id: "03ace639-70be-422e-ae33-9c80e173acf4",
                nonce: "defaultNonce",
                redirect_uri: "https://gentle-coast-03f74f10f.5.azurestaticapps.net/lobby.html",
                scope: "openid",
                response_type: "code",
                prompt: "login",
                code_challenge_method: "S256",
                code_challenge: codeChallenge, // Aquí usas el `code_challenge` generado
                login_hint: playerName, // Aquí agregas el valor capturado
            });

            const loginUrl = `${baseUrl}?${params.toString()}`;
            window.location.href = loginUrl;
        });
    };

    let generateCodeVerifier = function() {
        const array = new Uint8Array(32);
        window.crypto.getRandomValues(array);
        return base64urlEncode(array);
    }
    
    let  generateCodeChallenge = function(codeVerifier) {
        return sha256(codeVerifier).then(hash => base64urlEncode(hash));
    }
    
    // Función para convertir un array de bytes en base64url (sin signos + y /)
    let base64urlEncode = function (array) {
        const base64 = btoa(String.fromCharCode.apply(null, array));
        return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    }
    
    // Función para hacer hash con SHA-256
    let sha256 = function (buffer) {
        return crypto.subtle.digest('SHA-256', buffer).then(hash => {
            return new Uint8Array(hash);
        });
    }



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

        api.addPlayer(gameCode, playerName)
            .then(() => {
                saveGameData(playerName, gameCode);
            })
            .then(() => {
                window.location.href = `lobby.html`;
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
        joinButton
    };

})();