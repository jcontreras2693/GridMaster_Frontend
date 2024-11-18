var game = (function() {
    const board = document.getElementById('board');
    const rows = 100;
    const columns = 100;
    var playerName = "";
    var playerRow = -1;
    var playerColumn = -1;
    var playerColor = "#FFA500";
    var gameCode = -1;
    const boardContainer = document.querySelector('.board-container');
    var timer = null;

    const grid = Array.from({ length: rows }, () => Array(columns).fill(null));
    var stompClient = null;
    var players = [];

    const colorToImageMap = {
        "#FF0000": "/images/red.png",
        "#0000FF": "/images/blue.png",
        "#00FF00": "/images/green.png",
        "#FFFF00": "/images/yellow.png"
    };

    var setPlayerConfig = function(gameCode, name) {
        return api.getPlayer(gameCode, name).then(function(player) {
            const rgb = player.color; // [255, 0, 0]
            const hexColor = rgbToHex(rgb[0], rgb[1], rgb[2]);
            playerColor = hexColor;
            playerName = player.name;
            playerRow = player.position[0];
            playerColumn = player.position[1];
            connectAndSubscribe();
            drawAllTraces(gameCode);
            return playerColor;
        });
    };

    var drawAllTraces = function(gameCode) {
        api.getPlayers(gameCode).then(function(players) {
            players.forEach(
                function (p) {
                    trace = p.trace;
                    const rgb = p.color;
                    const hexColor = rgbToHex(rgb[0], rgb[1], rgb[2]);
                    trace.forEach(
                        function (t) {
                            var row = t.first;
                            var column = t.second;
                            var cell = grid[row][column];
                            cell.style.backgroundColor = hexColor;
                    });
                }
            );
        });
    };

    var setGameCode = function(newCode){
        gameCode = newCode;
    }
    
    function rgbToHex(r, g, b) {
        return "#" + [r, g, b].map(x => x.toString(16).padStart(2, "0")).join("");
    }
    
    var loadBoard = function() {

        const board = document.getElementById('board'); // Mueve esto aquí
        if (!board) {
            console.error("El elemento 'board' no se encontró.");
            return; // Sal del método si board es null
        }

        console.log("rows: ", rows, " columns: ",columns)
        board.style.setProperty('--rows', rows);
        board.style.setProperty('--columns', columns);
        console.log("PlayerColor: ", playerColor);
        board.style.setProperty('--playarColor', playerColor);

        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < columns; j++) {
                const cell = document.createElement('div');
                cell.classList.add('cell');

                // Almacena la referencia de la celda en la matriz
                grid[i][j] = cell;

                board.appendChild(cell);
            }
        }

        const playerCell = grid[playerRow][playerColumn];
        const hexagon = document.createElement('div');
        hexagon.classList.add('hexagon');
        hexagon.style.backgroundColor = playerColor;
        playerCell.appendChild(hexagon);

        centerViewOnPlayer();

        timer = window.setInterval(sendTime, 1000);
        window.setInterval(sendTime, 1000);
      
        sendScore();
    };

    var sendScore = function(){
        api.getScore(gameCode).then(function(players) {
            console.log("Score", players);
            stompClient.send('/topic/game/' + gameCode + "/score", {}, JSON.stringify(players));
        });
    }

    var sendTime = function(){
        api.getTime(gameCode).then(function(time) {
            if(time == "00:00"){
                window.clearInterval(timer);
                console.log("Timer clear");
                disconnect();
                api.endGame(gameCode).then(() => {
                   window.location.href = `summary.html?playerName=${encodeURIComponent(playerName)}&gameCode=${encodeURIComponent(gameCode)}`
                });
            }
            stompClient.send('/topic/game/' + gameCode + "/time", {}, JSON.stringify(time));
        });
    }

    var updateScoreBoard = function(players) {
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
    };

    var updateTime = function(time) {
        const gameTimer = document.getElementById('timer');
        sendScore();
        gameTimer.textContent = time;
    };

    document.addEventListener('keydown', function(event) {
        switch (event.key) {
            case 'ArrowUp':
                movePlayer('up');
                break;
            case 'ArrowDown':
                movePlayer('down');
                break;
            case 'ArrowLeft':
                movePlayer('left');
                break;
            case 'ArrowRight':
                movePlayer('right');
                break;
        }
    });

    let moveQueue = Promise.resolve();

    var movePlayer = function(direction) {
        // Encadenar el nuevo movimiento a la cola de promesas
        moveQueue = moveQueue.then(() => processMove(direction)).catch((err) => {
            console.error("Error procesando el movimiento:", err);
        });
    };

    // Función de procesamiento de movimiento usando promesas
    function processMove(direction) {
        // Variables actuales de posición
        const oldRow = playerRow;
        const oldColumn = playerColumn;

        var newRow = playerRow;
        var newColumn = playerColumn;

        // Determinar la nueva posición en base a la dirección
        if (direction === 'up' && playerRow > 0) {
            newRow--;
        } else if (direction === 'down' && playerRow < rows - 1) {
            newRow++;
        } else if (direction === 'left' && playerColumn > 0) {
            newColumn--;
        } else if (direction === 'right' && playerColumn < columns - 1) {
            newColumn++;
        }

        return api.move(gameCode, playerName, newRow, newColumn)
            .then(() => api.getPlayer(gameCode, playerName)) // Obtener posición actualizada del jugador
            .then((player) => {
                // Enviar actualización a otros jugadores
                stompClient.send(
                    '/topic/game/' + gameCode + '/players/' + playerName,
                    {},
                    JSON.stringify({currentPosition: player.position, lastPosition: player.lastPosition, color : player.color})
                );
                
                row = player.position[0];
                column = player.position[1];
                

                // Actualizar la posición en el tablero y centrar la vista
                positionPlayer(row, column, playerColor);
                centerViewOnPlayer();

            })
            .catch((error) => {
                console.error("Error al mover o actualizar el jugador:", error);
            });
    }

    var positionPlayer = function(newRow, newColumn, color) {
        const previousCell = grid[playerRow][playerColumn];
        const previousHexagon = previousCell.querySelector('.hexagon');
        if (previousHexagon) {
            previousCell.removeChild(previousHexagon);
        }
        previousCell.style.backgroundColor = color;

        playerRow = newRow;
        playerColumn = newColumn;

        // Encuentra la nueva celda y añade el hexágono
        const currentCell = grid[playerRow][playerColumn];
        const hexagon = document.createElement('div');
        hexagon.classList.add('hexagon');
        hexagon.style.backgroundColor = color;
        currentCell.appendChild(hexagon);
    };

    function centerViewOnPlayer() {
        const cellSize = 30;
        const offsetX = (playerColumn * cellSize) + (cellSize / 2) - (boardContainer.clientWidth / 2);
        const offsetY = (playerRow * cellSize) + (cellSize / 2) - (boardContainer.clientHeight / 2);
        boardContainer.scrollLeft = offsetX;
        boardContainer.scrollTop = offsetY;
    }

    function subscribeToPlayers(){
        console.log("Players SUBSCRIPTION: ", players);
        players.forEach(
            function (p) {
                if(p.name != playerName){
                    stompClient.subscribe('/topic/game/' + gameCode + '/players/' + p.name, function(data){
                        player = JSON.parse(data.body);
                        row = player.currentPosition[0];
                        column = player.currentPosition[1];

                        oldRow = player.lastPosition[0];
                        oldColumn = player.lastPosition[1];
                        
                        const rgb = player.color;
                        const hexColor = rgbToHex(rgb[0], rgb[1], rgb[2]);
                        
                        const previousCell = grid[oldRow][oldColumn];
                        previousCell.style.backgroundColor = hexColor;
                        const previousHexagon = previousCell.querySelector('.hexagon-other-player');
                        if (previousHexagon) {
                            previousCell.removeChild(previousHexagon);
                        }

                        const currentCell = grid[row][column];
                        const existingHexagon = currentCell.querySelector('.hexagon-other-player');
                        if (existingHexagon) {
                            currentCell.removeChild(existingHexagon);
                        }

                        const hexagon = document.createElement('div');
                        hexagon.style.backgroundColor = hexColor;
                        hexagon.classList.add('hexagon-other-player');
                        currentCell.appendChild(hexagon);
           
                    });
                }
            }
        );
    };

    function connectAndSubscribe() {
        var socket = new SockJS('/stompendpoint');
        stompClient = Stomp.over(socket);
        console.log("Connecting...");
        console.log(stompClient);
        stompClient.connect({}, function (frame) {
            console.log('Connected: ' + frame);
            stompClient.subscribe('/topic/game/' + gameCode + "/players", function(data){
                console.log("Players received");
                players = JSON.parse(data.body);
                subscribeToPlayers();
            });
            stompClient.subscribe('/topic/game/' + gameCode + "/score", function(data){
                players = JSON.parse(data.body);
                updateScoreBoard(players);
            });
            stompClient.subscribe('/topic/game/' + gameCode + "/time", function(data){
                time = JSON.parse(data.body);
                updateTime(time);
            });

            api.getPlayers(gameCode).then(function(data) {
                players = data;
                stompClient.send('/topic/game/' + gameCode + "/players", {}, JSON.stringify(data));
            });
        });
    }

    function disconnect() {
        if (stompClient != null) {
            stompClient.disconnect();
        }
        console.log("Disconnected");
    }



    return {
        loadBoard,
        setPlayerConfig,
        setGameCode,
        drawAllTraces
    };

})();

document.addEventListener('DOMContentLoaded', function() {
    
    var params = new URLSearchParams(window.location.search);

    var playerName = params.get('playerName');
    var gameCode = params.get('gameCode');
    game.setGameCode(gameCode);

    const gameCodeElement = document.getElementById('gameCode');
    
    if (gameCode && gameCodeElement) {
        gameCodeElement.textContent = gameCode;
    } else {
        console.error("El elemento gameCode no se encontró o el código de partida está ausente.");
    }
    
    if (gameCode && playerName) {
        game.setPlayerConfig(gameCode, playerName).then(() => {
            game.loadBoard();
        });
    } else {
        console.error("Game code or player name is missing.");
    }

});
