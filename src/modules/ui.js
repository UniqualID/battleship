import { Player } from './player.js';
import { Gameboard } from './gameboard.js';
import { Ship } from './ship.js';

const elements = {
    main: document.querySelector('main'),
    board1: document.querySelector('#player1board'),
    board2: document.querySelector('#player2board'),
    boardpieces: document.querySelector('#boardpieces'),
};

const gameState = new (class {
    constructor() {
        this.unassignedShipss = [
            new Ship(2),
            new Ship(2),
            new Ship(3),
            new Ship(4),
            new Ship(5),
        ];
    }
})();
function create(tag, className, text, children) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (text) el.textContent = text;
    if (children) el.replaceChildren(...children);
    return el;
}

function createBoardUI(boardElement, gameboard) {
    // Clear current board
    boardElement.innerHTML = '';

    const boardLength = gameboard.board.length;
    boardElement.setAttribute(
        'style',
        [
            `grid-template-rows: repeat(${boardLength}, 1fr);`,
            `grid-template-columns: repeat(${boardLength}, 1fr);`,
        ].join(''),
    );
    let cells = [];
    for (let i = 0; i < boardLength * boardLength; i++) {
        cells.push(create('div', 'boardcell'));
    }
    boardElement.replaceChildren(...cells);
}

function renderBoardPieces(boardpiecesElement, ships) {
    boardpiecesElement.innerHTML = '';
    ships.forEach((ship) => {
        let boardpiece = create('div', 'boardpiece');
        let cellLength = window
            .getComputedStyle(document.querySelector('.boardcell'))
            .getPropertyValue('width');

        boardpiece.dataset.length = ship.length;
        boardpiece.dataset.orientation = ship.orientation;
        boardpiece.setAttribute(
            'style',
            [
                `display: flex; `,
                `flex-direction: ${ship.orientation === 'horizontal' ? 'row' : 'column'};`,
            ].join(''),
        );
        for (let i = 0; i < ship.length; i++) {
            let cell = create('div');
            cell.setAttribute(
                'style',
                [`width: ${cellLength};`, `height: ${cellLength};`].join(''),
            );
            boardpiece.appendChild(cell);
        }
        boardpiecesElement.appendChild(boardpiece);
    });
}

async function init() {
    const player1 = new Player('Player 1', new Gameboard());
    const player2 = new Player('Player 2', new Gameboard());
    createBoardUI(elements.board1, player1.gameboard);
    createBoardUI(elements.board2, player2.gameboard);

    renderBoardPieces(elements.boardpieces, gameState.unassignedShipss);
}

document.addEventListener('DOMContentLoaded', init);
