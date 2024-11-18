var summary = (function(){
    var gameCode = -1;
    var playerName = "";

    var setGameCode = function(code){
        gameCode = code;
    }

    var updateScoreBoard = function(gameCode) {
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

    var updatePlayerSection = function(gameCode, playerName) {
        const playerNameHTML = document.getElementById('playerName');
        const playerPositionHTML = document.getElementById('finalPosition');
        const playerScoreHTML = document.getElementById('score');

        api.getPlayer(gameCode, playerName).then(function(player) {
            playerNameHTML.textContent = player.name;
            playerPositionHTML.textContent = player.scoreboardPosition;
            playerScoreHTML.textContent = player.score;
        });
    };

    var returnHome = function(){
        api.deleteGame(gameCode).then(() => {
            window.location.href = `index.html`
        });
    }

    return {
        updateScoreBoard,
        updatePlayerSection,
        setGameCode,
        returnHome
    };

})();

document.addEventListener('DOMContentLoaded', function() {

    var params = new URLSearchParams(window.location.search);

    var playerName = params.get('playerName');
    var gameCode = params.get('gameCode');

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