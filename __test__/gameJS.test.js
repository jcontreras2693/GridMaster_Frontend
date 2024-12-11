const game = require('../src/main/resources/static/js/game.js');

describe('setSizeofBoard', () => {
    let game;

    beforeEach(() => {
        // Reiniciar el módulo del juego antes de cada prueba
        game = require('../src/main/resources/static/js/game.js'); // Ajusta la ruta a tu archivo 'game.js'
        
        // Inicializar las variables de tamaño antes de cada prueba (puedes establecer valores predeterminados)
        game.setSizeofBoard(5, 5);  // Iniciar el tablero con 5x5
    });

    test('debe actualizar las dimensiones del tablero correctamente', () => {
        // Verificar las dimensiones iniciales
        expect(game.getRows()).toBe(5);
        expect(game.getColumns()).toBe(5);

        // Llamar a setSizeofBoard con nuevas dimensiones
        game.setSizeofBoard(8, 8);

        // Verificar que las dimensiones han sido actualizadas
        expect(game.getRows()).toBe(8);
        expect(game.getColumns()).toBe(8);
    });

    test('debe actualizar a otras dimensiones correctamente', () => {
        // Cambiar las dimensiones a un tamaño diferente
        game.setSizeofBoard(10, 12);

        // Verificar que las dimensiones se actualizan correctamente
        expect(game.getRows()).toBe(10);
        expect(game.getColumns()).toBe(12);
    });

    test('no debe cambiar las dimensiones si no se llaman a setSizeofBoard', () => {
        // Verificar que las dimensiones iniciales permanecen sin cambios si no se llama a la función
        expect(game.getRows()).toBe(5);
        expect(game.getColumns()).toBe(5);
    });

    test('debe convertir RGB a su valor hexadecimal', () => {
        expect(game.rgbToHex(255, 0, 0)).toBe('#ff0000');  // Rojo
        expect(game.rgbToHex(0, 255, 0)).toBe('#00ff00');  // Verde
        expect(game.rgbToHex(0, 0, 255)).toBe('#0000ff');  // Azul
        expect(game.rgbToHex(255, 255, 0)).toBe('#ffff00');  // Amarillo
        expect(game.rgbToHex(0, 255, 255)).toBe('#00ffff');  // Cian
        expect(game.rgbToHex(255, 0, 255)).toBe('#ff00ff');  // Magenta
    });

    test('debe manejar valores de 0 correctamente', () => {
        expect(game.rgbToHex(0, 0, 0)).toBe('#000000');  // Negro
    });

    test('debe manejar valores de 255 correctamente', () => {
        expect(game.rgbToHex(255, 255, 255)).toBe('#ffffff');  // Blanco
    });

    test('debe manejar valores intermedios', () => {
        expect(game.rgbToHex(128, 128, 128)).toBe('#808080');  // Gris
    });

    test('debe manejar un solo valor para RGB correctamente', () => {
        expect(game.rgbToHex(255, 165, 0)).toBe('#ffa500');  // Naranja
    });
});

// Configuramos Jest para que simule el DOM
describe('Pruebas para positionPlayer', () => {
    let grid;  // Simulamos el grid del tablero

    beforeEach(() => {
        // Simulamos el DOM para el tablero
        document.body.innerHTML = `
        <div class="board-container">
            <div id="board"></div>
        </div>
        `;
        
        // Definimos las filas y columnas para el tablero
        const rows = 5;
        const columns = 5;

        // Creamos el grid (matriz) con las celdas del tablero
        grid = Array.from({ length: rows }, () => Array(columns).fill(null));
        
        // Llenamos el grid con divs simulando las celdas
        for (let row = 0; row < rows; row++) {
        for (let col = 0; col < columns; col++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            grid[row][col] = cell;  // Asignamos cada celda al grid
            document.getElementById('board').appendChild(cell); // Agregamos al DOM
        }
        }

        // Asignamos las variables de la prueba, asegurándonos de que sean válidas
        game.setPlayerRow(2);
        game.setPlayerColumn(2);
        game.setPlayerColor('#FFA500');
        game.setGrid(grid);
    });

    // Utilidad para convertir rgb() a hexadecimal
    function rgbToHex(rgb) {
        const result = rgb.match(/\d+/g).map(Number); // Extrae los valores numéricos
        return (
            '#' +
            result
                .map((num) => num.toString(16).padStart(2, '0')) // Convierte a hexadecimal
                .join('')
        );
    }

    test('debe mover al jugador a una nueva celda y actualizar la celda anterior', () => {
        // Configurar condiciones iniciales
        game.playerRow = 2; // Inicializar posición del jugador
        game.playerColumn = 2;
        game.grid = grid; // Asignar la cuadrícula

        // Verificar que la celda inicial tenga el color correcto
        const initialCell = grid[2][2];
        expect(initialCell.querySelector('.hexagon')).toBeNull(); // No debería haber hexágono al principio

        // Llamamos a la función para mover al jugador a una nueva celda
        game.positionPlayer(3, 3, '#FF0000');

        // Verificar que la celda anterior (2, 2) haya cambiado su fondo
        expect(rgbToHex(initialCell.style.backgroundColor)).toBe('#ff0000'); // Convertir a hex para comparar

        // Verificar que se haya añadido un hexágono a la nueva celda
        const newCell = grid[3][3];
        const hexagon = newCell.querySelector('.hexagon');
        expect(hexagon).not.toBeNull(); // Debe haber un hexágono en la nueva celda
        expect(rgbToHex(hexagon.style.backgroundColor)).toBe('#ff0000'); // Convertir a hex para comparar
    });

    test('debe eliminar el hexágono de la celda anterior cuando el jugador se mueve', () => {
        // Configurar condiciones iniciales
        game.playerRow = 2; // Inicializar posición del jugador
        game.playerColumn = 2;
        game.grid = grid; // Asignar la cuadrícula

        // Inicializamos el hexágono en la celda actual
        const initialCell = grid[2][2];
        const initialHexagon = document.createElement('div');
        initialHexagon.classList.add('hexagon');
        initialCell.appendChild(initialHexagon);

        // Llamamos a la función para mover al jugador
        game.positionPlayer(1, 1, '#00ff00');

        // Verificamos que el hexágono haya sido eliminado de la celda anterior
        expect(initialCell.querySelector('.hexagon')).toBeNull();

        // Verificamos que la nueva celda tenga el hexágono con el color correcto
        const newCell = grid[1][1];
        const hexagon = newCell.querySelector('.hexagon');
        expect(hexagon).not.toBeNull();
        expect(rgbToHex(hexagon.style.backgroundColor)).toBe('#00ff00'); // Convertir a hex para comparar
    });

});

