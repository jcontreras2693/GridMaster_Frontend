var home = (function(){
    const gameIdInput = document.getElementById('gameIdInput');
    const joinGameButton = document.getElementById('joinGameButton');

    var createGame = function(playerName) {

        const errorMessageDiv = document.getElementById('error-message');
    
        errorMessageDiv.textContent = '';
        errorMessageDiv.style.display = 'none';
    
        if (!playerName.trim()) {
            errorMessageDiv.textContent = "Pls, enter your name before to create a game";
            errorMessageDiv.style.display = 'block';
            return;
        }

        let gameCode;
    
        api.createGame(playerName)
            .then(code => {
                gameCode = code;
                console.log("Game code created:", gameCode);
                return api.addPlayer(gameCode, playerName);
            })
            .then(() => {
                api.startGame(gameCode);
            })
            .then(() => {
                console.log("Setting player color");
                game.setPlayerConfig(gameCode, playerName);
            })
            .then(() => {
                window.location.href = `game.html?playerName=${encodeURIComponent(playerName)}&gameCode=${encodeURIComponent(gameCode)}`
            })
            .catch(error => {
                console.error("Error al crear el juego o añadir el jugador:", error);
            });
    };



    var joinButton = function(){
        gameIdInput.style.display = 'inline-block';
        joinGameButton.style.display = 'inline-block';
    }

    
    var joinGame = function(gameCode, playerName){
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
                game.setPlayerConfig(gameCode, playerName);
            }).then(() => {
                window.location.href = `game.html?playerName=${encodeURIComponent(playerName)}&gameCode=${encodeURIComponent(gameCode)}`
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