api=(function(){

    var linkAzure = "https://gridmaster-e3buhtargmajgvdj.eastus-01.azurewebsites.net/"
    //var linkAzure = "http://localhost:8080/"

    //Gets
    var getPlayer = function(gameCode, playerName) {
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

    var getScore = function(gameCode) {
        return $.ajax({
            url: linkAzure + 'games/' + gameCode + '/score',
            type: 'GET',
            contentType: "application/json"
        }).then(function(response) {
            console.log("Scores: ", response);
            return response;
        }).catch(function(error) {
            console.error("Error getting player:", error);
        });
    };

    var getTime = function(gameCode) {
            return $.ajax({
                url: linkAzure + 'games/' + gameCode + '/time',
                type: 'GET',
                contentType: "application/json"
            }).then(function(response) {
                console.log("Time: ", response);
                return response;
            }).catch(function(error) {
                console.error("Error getting player:", error);
            });
        };

    var getPlayers = function(gameCode){
        return $.ajax({
            url: linkAzure + 'games/' + gameCode + '/players',
            type: 'GET',
            contentType: "application/json"
        }).then(function(response) {
            console.log("Players: ", response);
            return response;
        }).catch(function(error) {
            console.error("Error getting player:", error);
        });
    }
    
    //Post
    var createGame = function(playerName) {
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
    var addPlayer = function(gameCode, playerName) {
        return $.ajax({
            url: linkAzure + 'games/' + gameCode + '/players',
            type: 'PUT',
            data: JSON.stringify({ name: playerName }),
            contentType: "application/json"
        }).then(function(response) {
            return response;
        })
    };

    var startGame = function(gameCode) {
        return $.ajax({
            url: linkAzure + 'games/' + gameCode,
            type: 'PUT',
            contentType: "application/json"
        }).then(function(response) {
            console.log("Game started");
            return response;
        }).catch(function(error) {
            console.error("Error adding player:", error);
        });
    };

    var move = function(gameCode, playerName, o1, o2) {
        console.log(gameCode, playerName);
        var json = JSON.stringify({ o1: o1, o2 : o2 })
        console.log(json);
        return $.ajax({
            url: linkAzure + 'games/' + gameCode + '/players/' + playerName,
            type: 'PUT',
            data: json,
            contentType: "application/json"
        }).then(function(response) {
            console.log("Player was move");
        }).catch(function(error) {
            console.error("Error adding player:", error);
        });
    }

    var endGame = function(gameCode) {
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
    var deleteGame = function(gameCode) {
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

    return {
        createGame,
        addPlayer,
        getPlayer,
        getScore,
        getPlayers,
        getTime,
        move,
        startGame,
        endGame,
        deleteGame
    };
})();