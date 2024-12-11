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

    test('setMaxPlayer establece el número máximo de jugadores correctamente si es válido', () => {
        jest.spyOn(console, 'error').mockImplementation(() => {});
    
        // Mock de sendSettingsToTopic
        lobby.sendSettingsToTopic = jest.fn();
    
        document.body.innerHTML = `<div id="error-message" style="display: none;"></div>`;
        const errorMessageDiv = document.getElementById('error-message');
    
        // Llamar a la función con un valor válido
        lobby.setMaxPlayer(5);
    
        // Verificar que maxPlayer se establece correctamente
        expect(lobby.getMaxPlayer()).toBe(5); // Usa getMaxPlayer para obtener el valor actual
    
        // Verificar que no se muestra mensaje de error
        expect(errorMessageDiv.style.display).toBe('none');
        expect(errorMessageDiv.textContent).toBe('');
    
        console.error.mockRestore();
    });
    
    
    test('setMaxPlayer muestra un mensaje de error si el valor es inválido', () => {
        // Mock del DOM
        document.body.innerHTML = `
            <div id="error-message" style="display: none;"></div>
        `;
        const errorMessageDiv = document.getElementById('error-message');
    
        // Llamar a la función con un valor inválido
        lobby.setMaxPlayer(15);
    
        // Verificar que maxPlayer no se actualiza
        expect(lobby.maxPlayer).not.toBe(15);
    
        // Verificar que se muestra el mensaje de error
        expect(errorMessageDiv.style.display).toBe('block');
        expect(errorMessageDiv.textContent).toBe(
            'The maximum number of players must be between 2 and 10'
        );
    });
    
    test('setTime establece el tiempo correctamente si es válido', () => {
        jest.spyOn(console, 'error').mockImplementation(() => {});
    
        // Mock de sendSettingsToTopic
        lobby.sendSettingsToTopic = jest.fn();
    
        document.body.innerHTML = `<div id="error-message" style="display: none;"></div>`;
        const errorMessageDiv = document.getElementById('error-message');
    
        // Llamar a la función con un valor válido
        lobby.setTime(3, 30);
    
        // Verificar que minutes y seconds se establecen correctamente
        expect(lobby.getMinutes()).toBe(3);
        expect(lobby.getSeconds()).toBe(30);
    
        // Verificar que no se muestra mensaje de error
        expect(errorMessageDiv.style.display).toBe('none');
        expect(errorMessageDiv.textContent).toBe('');
    
        console.error.mockRestore();
    });    
    
    test('setTime muestra un mensaje de error si el valor es inválido', () => {
        // Mock del DOM
        document.body.innerHTML = `
            <div id="error-message" style="display: none;"></div>
        `;
        const errorMessageDiv = document.getElementById('error-message');
    
        // Llamar a la función con un valor inválido
        lobby.setTime(6, 0);  // Los minutos están fuera del rango
    
        // Verificar que los valores de minutes y seconds no se actualizan
        expect(lobby.getMinutes()).not.toBe(6);  // No debe ser 6
        expect(lobby.getSeconds()).toBe(0);  // No debe ser 0
    
        // Verificar que se muestra el mensaje de error
        expect(errorMessageDiv.style.display).toBe('block');
        expect(errorMessageDiv.textContent).toBe(
            'Time must be between 1:00 and 5:59'
        );
    });   
    
    test('setTime muestra un mensaje de error si el valor es inválido', () => {
        // Mock del DOM
        document.body.innerHTML = `
            <div id="error-message" style="display: none;"></div>
        `;
        const errorMessageDiv = document.getElementById('error-message');
    
        // Llamar a la función con un valor inválido
        lobby.setTime(4, 70);  // Los minutos están fuera del rango
    
        expect(lobby.getSeconds()).not.toBe(70);  // No debe ser 0
    
        // Verificar que se muestra el mensaje de error
        expect(errorMessageDiv.style.display).toBe('block');
        expect(errorMessageDiv.textContent).toBe(
            'Time must be between 1:00 and 5:59'
        );
    });
    
});
