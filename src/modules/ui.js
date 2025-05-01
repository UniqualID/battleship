import { Player } from './player.js';
import { Gameboard } from './gameboard.js';
import { Ship } from './ship.js';
import { BOARDSIZE } from './constants.js';

const elements = {
    main: document.querySelector('main'),
    board1: document.querySelector('#player1board'),
    board2: document.querySelector('#player2board'),
    boardpieces: document.querySelector('#boardpieces'),
};

const gameState = {
    unassignedShips: [
        new Ship(2),
        new Ship(2),
        new Ship(3),
        new Ship(4),
        new Ship(5),
    ],
    board1: null,
    board2: null,
    player1: null,
    player2: null,
};

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

    boardElement.setAttribute(
        'style',
        [
            `grid-template-rows: repeat(${BOARDSIZE}, 1fr);`,
            `grid-template-columns: repeat(${BOARDSIZE}, 1fr);`,
        ].join(''),
    );
    let cells = [];
    for (let i = 0; i < BOARDSIZE; i++) {
        for (let j = 0; j < BOARDSIZE; j++) {
            let cell = create('div', 'boardcell');
            cell.dataset.i = i;
            cell.dataset.j = j;
            if (gameboard.coordsIsOccupied(i, j)) {
                cell.classList.add('occupied');
            }
            cells.push(cell);
        }
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
        boardpiece.dataset.id = ship.id;
        boardpiece.setAttribute(
            'style',
            [
                `display: flex; `,
                `flex-direction: ${ship.orientation === 'horizontal' ? 'row' : 'column'};`,
            ].join(''),
        );
        boardpiece.draggable = true;
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
    boardpiecesElement.innerHTML += '<p><i>Press R to rotate Ships!</i></p';
}

function setupdrag() {
    return new Promise((resolve) => {
        let shippieces = document.querySelectorAll('.boardpiece');
        let draggedShip = null;
        function attachShipHandlers() {
            let shippieces = document.querySelectorAll('.boardpiece');
            shippieces.forEach((ship) => {
                ship.addEventListener('dragstart', dragstart);
                ship.addEventListener('dragend', dragend);
            });
        }
        function clearhover() {
            elements.board1
                .querySelectorAll('.boardcell.hover')
                .forEach((e) => e.classList.remove('hover'));
        }

        function dragstart(e) {
            draggedShip = {
                shipElement: e.target,
                shipObj: gameState.unassignedShips.find(
                    (obj) => obj.id === e.target.dataset.id,
                ),
                length: parseInt(e.target.dataset.length),
                orientation: e.target.dataset.orientation,
            };
            console.log('dragstart');
            console.log(draggedShip);
        }

        function dragover(e) {
            e.preventDefault();
            clearhover();

            if (!draggedShip) return;
            const startCell = e.target;
            if (!startCell.classList.contains('boardcell')) return;

            const [startI, startJ] = [
                parseInt(startCell.dataset.i),
                parseInt(startCell.dataset.j),
            ];
            if (
                !gameState.board1.isValidPlacement(draggedShip.shipObj, [
                    startI,
                    startJ,
                ])
            ) {
                clearhover();
                return;
            }

            const cells = [];
            for (let i = 0; i < draggedShip.length; i++) {
                let selectorStr;
                if (draggedShip.orientation === 'vertical')
                    selectorStr = `.boardcell[data-i="${startI + i}"][data-j="${startJ}"]`;
                else
                    selectorStr = `.boardcell[data-i="${startI}"][data-j="${startJ + i}"]`;

                let cell = elements.board1.querySelector(selectorStr);
                if (cell) cells.push(cell);
            }

            cells.forEach((cell) => cell.classList.add('hover'));
        }

        function drop(e) {
            e.preventDefault();
            clearhover();

            if (!draggedShip) return;
            const startCell = e.target;
            if (!startCell.classList.contains('boardcell')) return;

            const [startI, startJ] = [
                parseInt(startCell.dataset.i),
                parseInt(startCell.dataset.j),
            ];
            if (
                !gameState.board1.isValidPlacement(draggedShip.shipObj, [
                    startI,
                    startJ,
                ])
            ) {
                alert('Invalid placement: Out of bounds!');
                clearhover();
                return;
            }

            gameState.board1.placeShip(draggedShip.shipObj, [startI, startJ]);
            gameState.unassignedShips = gameState.unassignedShips.filter(
                (shipObj) => shipObj !== draggedShip.shipObj,
            );
            renderBoardPieces(elements.boardpieces, gameState.unassignedShips);
            createBoardUI(elements.board1, gameState.board1);
            attachShipHandlers();

            if (gameState.unassignedShips.length === 0) {
                elements.board1.removeEventListener('dragover', dragover);
                elements.board1.removeEventListener('drop', drop);
                document.removeEventListener('keydown', rotateUnassignedShips);
                elements.boardpieces.innerHTML = '<p><i>Start Firing!</i><p>';
                resolve();
            }
        }

        function dragend() {
            clearhover();
            draggedShip = null;
        }

        function rotateUnassignedShips(e) {
            if (e.key === 'r') {
                gameState.unassignedShips.forEach((ship) => {
                    ship.orientation =
                        ship.orientation === 'horizontal'
                            ? 'vertical'
                            : 'horizontal';
                });
            }
            renderBoardPieces(elements.boardpieces, gameState.unassignedShips);
            attachShipHandlers();
        }

        attachShipHandlers();
        elements.board1.addEventListener('dragover', dragover);
        elements.board1.addEventListener('drop', drop);
        document.addEventListener('keydown', rotateUnassignedShips);
    });
}

function setupThemeSwitch() {
    let darkmode = localStorage.getItem('darkmode');
    const themeBtn = document.querySelector('#theme-switch');

    const enableDarkmode = () => {
        document.body.classList.add('darkmode');
        localStorage.setItem('darkmode', 'active');
    };

    const disableDarkmode = () => {
        document.body.classList.remove('darkmode');
        localStorage.setItem('darkmode', null);
    };

    if (darkmode === 'active') enableDarkmode();

    themeBtn.addEventListener('click', () => {
        darkmode = localStorage.getItem('darkmode');
        darkmode !== 'active' ? enableDarkmode() : disableDarkmode();
    });
}
async function init() {
    gameState.board1 = new Gameboard();
    gameState.board2 = new Gameboard();
    gameState.player1 = new Player('Player 1', gameState.board1);
    gameState.player2 = new Player('Player 2', gameState.board2);
    createBoardUI(elements.board1, gameState.board1);
    createBoardUI(elements.board2, gameState.board2);

    renderBoardPieces(elements.boardpieces, gameState.unassignedShips);

    setupThemeSwitch();

    await setupdrag();
    console.log('Piece setup complete. Initiating game.');
}

document.addEventListener('DOMContentLoaded', init);
