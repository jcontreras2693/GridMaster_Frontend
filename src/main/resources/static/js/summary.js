var summary = (function(){
    let gameCode = sessionStorage.getItem('gameCode');
    let playerName = sessionStorage.getItem('playerName');


    let setGameCode = function(code){
        gameCode = code;
    }

    let getGameCode = function(){
        return gameCode;
    }

    let updateScoreBoard = function(gameCode) {
        api.getScore(gameCode).then(function(players) {
            const scoreTableBody = document.getElementById('scoreTableBody');
                scoreTableBody.innerHTML = ""; // Limpia las filas anteriores

                Object.entries(players).forEach(([player, score], index) => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${index + 1}</td>
                        <td>${player}</td>
                        <td>${score}</td>
                    `;
                    scoreTableBody.appendChild(row);
                }); 
        });
    };

    let updatePlayerSection = function(gameCode, playerName) {
        const playerNameHTML = document.getElementById('playerName');
        const playerPositionHTML = document.getElementById('finalPosition');
        const playerScoreHTML = document.getElementById('score');

        api.getPlayer(gameCode, playerName).then(function(player) {
            playerNameHTML.textContent = player.name;
            playerPositionHTML.textContent = player.scoreboardPosition;
            playerScoreHTML.textContent = player.trace.length;
        });
    };

    let returnHome = function(){
        api.deleteGame(gameCode).then(() => {
            window.location.href = `index.html`
        });
    }

    return {
        updateScoreBoard,
        updatePlayerSection,
        setGameCode,
        returnHome,
        getGameCode
    };

})();

document.addEventListener('DOMContentLoaded', function() {
    let gameCode = sessionStorage.getItem('gameCode');
    let playerName = sessionStorage.getItem('playerName');


    summary.setGameCode(gameCode);

    if (gameCode) {
        summary.updateScoreBoard(gameCode);
    } else {
        console.error("Game code is missing.");
    }

    if (playerName) {
        summary.updatePlayerSection(gameCode, playerName);
    } else {
        console.error("Player is missing.");
    }

});

module.exports = summary;