import 'jest-localstorage-mock';

describe('Lobby module tests', () => {
    let lobby;
    const gameCode = '12345'; // Mock del código de juego

    beforeEach(() => {
        sessionStorage.clear();
        sessionStorage.setItem('gameCode', gameCode);

        // Configurar el HTML simulado
        document.body.innerHTML = `
            <input type="number" id="columns" value="70" />
            <input type="number" id="rows" value="50" />
            <input type="number" id="minutes" value="5" />
            <input type="number" id="seconds" value="0" />
            <input type="number" id="maxPlayers" value="4" />
            <div id="error-message" style="display: none;"></div>
            <div id="gameCodeDisplay"></div>
        `;

        // Importar el módulo dinámicamente después de configurar el DOM
        jest.isolateModules(() => {
            lobby = require('../src/main/resources/static/js/lobby.js');
        });
    });

    test('saveGameData stores rows and columns in sessionStorage', () => {
        // Mockear sessionStorage.setItem
        jest.spyOn(sessionStorage, 'setItem');
        

        // Llama a la función saveGameData
        const rows = 50;
        const columns = 70;
        lobby.saveGameData(rows, columns);

        // Verifica que los datos se guardaron correctamente
        expect(sessionStorage.setItem).toHaveBeenCalledWith('rows', rows);
        expect(sessionStorage.setItem).toHaveBeenCalledWith('columns', columns);
    });

    test('should set the game code in the #gameCodeDisplay element', () => {
        // Configura el gameCode en sessionStorage
        sessionStorage.setItem('gameCode', gameCode);
    
        // Llama a la función
        lobby.setGameCode();
    
        // Verifica que el contenido del elemento sea correcto
        const gameCodeDisplay = document.getElementById('gameCodeDisplay');
        expect(gameCodeDisplay.textContent).toBe(`(${gameCode})`);
    });

    test('should do nothing if #gameCodeDisplay does not exist', () => {
        // Elimina el elemento del DOM
        document.body.innerHTML = '';

        // Llama a la función
        expect(() => lobby.setGameCode()).not.toThrow();
    });

    test('setDimensions displays an error message if the dimensions are invalid', () => {
        // Simular el llamado a la función con dimensiones invalidas
        lobby.setDimensions(10, 10); // Estas dimensiones son menores que el mínimo permitido
    
        const errorMessageDiv = document.getElementById('error-message');
        
        // Verifica que el mensaje de error esté visible y contenga el texto esperado
        expect(errorMessageDiv.style.display).toBe('block');
        expect(errorMessageDiv.textContent).toBe('Board dimensions must be between 20x20 and 100x100.');
    });

    test('setDimensions displays an error message if the dimensions are invalid', () => {
        // Simular el llamado a la función con dimensiones invalidas
        lobby.setDimensions(101, 101); // Estas dimensiones son menores que el mínimo permitido
    
        const errorMessageDiv = document.getElementById('error-message');
        
        // Verifica que el mensaje de error esté visible y contenga el texto esperado
        expect(errorMessageDiv.style.display).toBe('block');
        expect(errorMessageDiv.textContent).toBe('Board dimensions must be between 20x20 and 100x100.');
    });

    test('setDimensions sets dimensions correctly if they are valid', () => {
        // Mock de console.error para evitar errores de conexión Stomp
        jest.spyOn(console, 'error').mockImplementation(() => {});
    
        // Mock de la función sendSettingsToTopic para evitar la conexión Stomp
        const mockSendSettingsToTopic = jest.fn();
        lobby.sendSettingsToTopic = mockSendSettingsToTopic;  // Asegúrate de que la función esté reemplazada
    
        // Llamar a la función con dimensiones válidas
        lobby.setDimensions(30, 30); // Las dimensiones están dentro del rango permitid
    
        // Verificar que las dimensiones se hayan configurado correctamente usando getDimensions
        const { columns, rows } = lobby.getDimensions();  // Usar el método getDimensions
    
        expect(columns).toBe(30);
        expect(rows).toBe(30);
    
        // Restaurar el comportamiento original de console.error
        console.error.mockRestore();
    });
    
});