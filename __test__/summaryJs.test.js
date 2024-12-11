const summary = require('../src/main/resources/static/js/summary.js');

test('setGameCode debe actualizar el valor de gameCode', () => {
    const gameCode = '1234';
    summary.setGameCode(gameCode);
    expect(summary.getGameCode()).toBe(gameCode);
});
