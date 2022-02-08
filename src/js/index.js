import Game from './Game.js'

const game = new Game({
    inicialNumber: 0,
    range: { min: 1, max: 10 },
    guessInput: document.getElementById('guess'),
    numberField: document.getElementById('number'),
    mensageField: document.getElementById('mensage'),
    sendButton: document.getElementById('sendButton'),
    newGameButton: document.getElementById('newGameButton'),
})

game.start()