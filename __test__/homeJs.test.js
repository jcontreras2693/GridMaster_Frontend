import 'jest-localstorage-mock';
const home = require('../src/main/resources/static/js/home.js');

describe('Home module tests', () => {
    let errorMessageDiv;

    beforeEach(() => {
        sessionStorage.clear();
        // Configurar el HTML simulado
        document.body.innerHTML = `
            <div class="join-a-game">
            <div class="join-container">
                <button type="button" id="join" onclick="home.joinButton()">Join a game</button>
                <input type="text" id="gameIdInput" name="gameId" placeholder="Enter game ID" style="display: none;" />
                <button type="button" id="joinGameButton" onclick="home.joinGame(document.getElementById('gameIdInput').value, document.getElementById('name').value)" style="display: none;">Join</button>
                <div id="error-message" style="display: none;"></div>
            </div>
            </div>
        `;
        errorMessageDiv = document.getElementById('error-message');
    });

    test('saveGameData stores playerName and gameCode in sessionStorage', () => {
        // Llama a la función saveGameData
        const playerName = 'TestPlayer';
        const gameCode = '1234';
        home.saveGameData(playerName, gameCode);

        // Verifica que los datos se guardaron correctamente
        expect(sessionStorage.setItem).toHaveBeenCalledWith('playerName', playerName);
        expect(sessionStorage.setItem).toHaveBeenCalledWith('gameCode', gameCode);
    });

    test('joinButton should display gameIdInput and joinGameButton', () => {
        // Llamar a la función joinButton para hacer visibles los elementos
        home.joinButton();

        // Verificar que los elementos se hicieron visibles
        const gameIdInput = document.getElementById('gameIdInput');
        const joinGameButton = document.getElementById('joinGameButton');

        // Asegurarse de que los elementos están visibles
        expect(gameIdInput.style.display).toBe('inline-block');
        expect(joinGameButton.style.display).toBe('inline-block');
    });

    test('should show error if playerName is empty', () => {
        const playerName = '   '; // Nombre vacío
        const gameCode = '1234';

        home.joinGame(gameCode, playerName);

        expect(errorMessageDiv.textContent).toBe("Pls, enter your name before to create a game");
        expect(errorMessageDiv.style.display).toBe('block');
    });

    test('should show error if gameCode is empty', () => {
        const playerName = 'TestPlayer';
        const gameCode = '   '; // Código de juego vacío

        home.joinGame(gameCode, playerName);

        expect(errorMessageDiv.textContent).toBe("Pls, enter the code of a game");
        expect(errorMessageDiv.style.display).toBe('block');
    });

    test('should show error if gameCode is not 4 digits', () => {
        const playerName = 'TestPlayer';
        const gameCode = '12'; // Código de juego inválido

        home.joinGame(gameCode, playerName);

        expect(errorMessageDiv.textContent).toBe("The game code must be exactly 4 digits");
        expect(errorMessageDiv.style.display).toBe('block');
    });

    test('should show error if gameCode contains non-numeric characters', () => {
        const playerName = 'TestPlayer';
        const gameCode = '12AB'; // Código de juego con caracteres no numéricos

        home.joinGame(gameCode, playerName);

        expect(errorMessageDiv.textContent).toBe("The game code must be exactly 4 digits");
        expect(errorMessageDiv.style.display).toBe('block');
    });
});