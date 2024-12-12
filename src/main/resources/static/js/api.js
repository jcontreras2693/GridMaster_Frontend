api=(function(){

    let linkAzure = "https://74.179.216.35/"
    //let linkAzure = "http://4.156.250.133/"
    //let linkAzure = "https://gridmasterbackend-cdezamajdeadcchu.eastus-01.azurewebsites.net/"
    //var linkAzure = "http://localhost:8080/"
    
    //Gets
    let getPlayer = function(gameCode, playerName) {
        console.log("gameCode: ", gameCode, " playerName: ", playerName);
        return $.ajax({
            url: linkAzure + 'games/' + gameCode + '/players/' + playerName,
            type: 'GET',
            contentType: "application/json"
        }).then(function(response) {
            console.log("Player: ", response);
            return response;
        }).catch(function(error) {
            console.error("Error getting player:", error);
        });
    };

    let getScore = function(gameCode) {
        return $.ajax({
            url: linkAzure + 'games/' + gameCode + '/score',
            type: 'GET',
            contentType: "application/json"
        }).then(function(response) {
            console.log("Scores: ", response);
            return response;
        }).catch(function(error) {
            console.error("Error getting score:", error);
        });
    };

    let getTime = function(gameCode) {
            return $.ajax({
                url: linkAzure + 'games/' + gameCode + '/time',
                type: 'GET',
                contentType: "application/json"
            }).then(function(response) {
                console.log("Time: ", response);
                return response;
            }).catch(function(error) {
                console.error("Error getting time:", error);
            });
        };

    let getPlayers = function(gameCode){
        return $.ajax({
            url: linkAzure + 'games/' + gameCode + '/players',
            type: 'GET',
            contentType: "application/json"
        }).then(function(response) {
            console.log("Players: ", response);
            return response;
        }).catch(function(error) {
            console.error("Error getting players:", error);
        });
    }

    let getGameByCode = function(gameCode) {
        return $.ajax({
            url: linkAzure + 'games/' + gameCode,
            type: 'GET',
            contentType: "application/json"
        }).then(function(response) {
            return response;
        }).catch(function(error) {
            console.error("Error getting game:", error);
        });
    };
    
    //Post
    let createGame = function() {
        return $.ajax({
            url: linkAzure + 'games',
            type: 'POST',
            contentType: "application/json"
        }).then(function(gameCode) {
            localStorage.setItem('gameCode', gameCode);
            return gameCode;
        }).catch(function(error) {
            console.error("Error creating game:", error);
        });
    };

    //Puts
    let addPlayer = function(gameCode, playerName) {
        return $.ajax({
            url: linkAzure + 'games/' + gameCode + '/players',
            type: 'PUT',
            data: JSON.stringify({ name: playerName }),
            contentType: "application/json"
        }).then(function(response) {
            return response;
        })
    };

    let startGame = function(gameCode) {
        return $.ajax({
            url: linkAzure + 'games/' + gameCode + "/started",
            type: 'PUT',
            contentType: "application/json"
        }).then(function(response) {
            console.log("Game started");
            return response;
        }).catch(function(error) {
            console.error("Error starting game:", error);
        });
    };

    let updateGame = function(gameCode, min, sec, rows, columns, maxP) {
        return $.ajax({
            url: linkAzure + 'games/' + gameCode,
            type: 'PUT',
            data: JSON.stringify({ minutes: min, seconds: sec, xDimension: rows, yDimension: columns, maxPlayers: maxP}),
            contentType: "application/json"
        }).then(function(response) {
            console.log("Game started");
            return response;
        }).catch(function(error) {
            console.error("Error updating game:", error);
        });
    };

    let move = function(gameCode, playerName, xPos, yPos) {
        console.log(gameCode, playerName);
        let json = JSON.stringify({ x: xPos, y: yPos});
        console.log(json);
        return $.ajax({
            url: linkAzure + 'games/' + gameCode + '/players/' + playerName,
            type: 'PUT',
            data: json,
            contentType: "application/json"
        }).then(function(response) {
            console.log("Player was move");
        }).catch(function(error) {
            console.error("Error moving player:", error);
        });
    }

    let endGame = function(gameCode) {
        return $.ajax({
            url: linkAzure + 'games/' + gameCode + '/finished',
            type: 'PUT',
            contentType: "application/json"
        }).then(function(response) {
            console.log("Game ended");
        }).catch(function(error) {
            console.error("Error finishing game:", error);
        });
    }

    //Deletes
    let deleteGame = function(gameCode) {
        return $.ajax({
            url: linkAzure + 'games/' + gameCode,
            type: 'DELETE',
            contentType: "application/json"
        }).then(function(response) {
            console.log("Game deleted");
        }).catch(function(error) {
            console.error("Error deleting game:", error);
        });
    }

    let deletePLayer = function(gameCode, playerName) {
        return $.ajax({
            url: linkAzure + 'games/' + gameCode + "/players/" + playerName,
            type: 'DELETE',
            contentType: "application/json"
        }).then(function(response) {
            console.log("player deleted");
        }).catch(function(error) {
            console.error("Error deleting player:", error);
        });
    }

    return {
        createGame,
        addPlayer,
        getPlayer,
        getScore,
        getPlayers,
        getTime,
        move,
        updateGame,
        startGame,
        endGame,
        deleteGame,
        deletePLayer,
        getGameByCode
    };
})();
