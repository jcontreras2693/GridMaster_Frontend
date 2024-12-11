import 'jest-localstorage-mock';
const home = require('../src/main/resources/static/js/home.js');

describe('Home module tests', () => {
    beforeEach(() => {
        localStorage.clear();
        sessionStorage.clear();
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
});
