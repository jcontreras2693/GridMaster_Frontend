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

        saveGameData(playerName);

        let gameCode;
    
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
            code_challenge: "HMxtVf4UJVl8TOewidP9OkjewYFULC8l2niNRpPRLp4",
            login_hint: playerName, // Aquí agregas el valor capturado
        });

        const loginUrl = `${baseUrl}?${params.toString()}`;
        window.location.href = loginUrl;
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
