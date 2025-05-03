import { Player } from './player.js';
import { Gameboard } from './gameboard.js';
import { Ship } from './ship.js';
import { BOARDSIZE } from './constants.js';

const DEBUGSHOWALLBOARDS = true;
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

function createBoardUI(boardElement, gameboard, showOccupied = true) {
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
            if (
                (showOccupied || DEBUGSHOWALLBOARDS) &&
                gameboard.coordsIsOccupied(i, j)
            ) {
                cell.classList.add('occupied');
            }

            if (gameboard.coordsIsMiss(i, j)) {
                cell.classList.add('miss');
            }
            if (gameboard.coordsIsHit(i, j)) {
                cell.classList.add('hit');
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

function playgame() {
    return new Promise(async (resolve, reject) => {
        console.log('here');
        function getWinner() {
            if (
                gameState.board1.ships.length ===
                gameState.board1.sunkShips.length
            )
                return 'player 2';
            else if (
                gameState.board2.ships.length ===
                gameState.board2.sunkShips.length
            )
                return 'player 1';
            else return null;
        }

        while (true) {
            let [x, y] = await gameState.player1.nextMove();
            gameState.board2.receiveAttack(x, y);
            createBoardUI(elements.board2, gameState.board2);
            if (getWinner()) break;

            [x, y] = await gameState.player2.nextMove();
            gameState.board1.receiveAttack(x, y);
            createBoardUI(elements.board1, gameState.board1);
            if (getWinner()) break;
        }

        resolve(getWinner());
    });
}
async function init() {
    gameState.board1 = new Gameboard();
    gameState.board2 = new Gameboard();
    [
        [new Ship(2, 'horizontal'), [0, 0]],
        [new Ship(2, 'vertical'), [0, 8]],
        [new Ship(3, 'horizontal'), [4, 5]],
        [new Ship(4, 'horizontal'), [10, 1]],
        [new Ship(5, 'vertical'), [7, 11]],
    ].forEach(([ship, coords]) => gameState.board2.placeShip(ship, coords));

    // Player 1 nextMove should just be whatever the user clicks on
    gameState.player1 = new Player('Player 1', gameState.board1, function () {
        return new Promise((resolve) => {
            elements.board2.addEventListener(
                'click',
                (e) => {
                    if (!e.target.classList.contains('boardcell')) return;
                    let [x, y] = [e.target.dataset.i, e.target.dataset.j];
                    console.log(`User selected cell ${x}, ${y}`);
                    if (gameState.board2.coordsIsHit(x, y)) {
                        alert('Cannot select an already hit coordinate!');
                        return;
                    }
                    resolve([x, y]);
                },
                { once: true },
            );
        });
    });

    // Player 2 nextMove, simple random selection but can do a battleship-specific AI later!
    let movesAr = Array.from({ length: BOARDSIZE }, (_, x) =>
        Array.from({ length: BOARDSIZE }, (_, y) => [x, y]),
    ).flat();
    console.log(movesAr);
    function shuffle(arr) {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1)); // 0 ≤ j ≤ i
            [arr[i], arr[j]] = [arr[j], arr[i]]; // swap
        }
        return arr;
    }

    let shuffledMoves = shuffle(movesAr);
    let shuffleMoveIdx = 0;
    gameState.player2 = new Player(
        'Player 2',
        gameState.board2,
        () => shuffledMoves[shuffleMoveIdx++],
    );
    createBoardUI(elements.board1, gameState.board1);
    createBoardUI(elements.board2, gameState.board2);

    renderBoardPieces(elements.boardpieces, gameState.unassignedShips);

    setupThemeSwitch();

    await setupdrag();
    console.log('Piece setup complete. Initiating game.');

    let winner = await playgame();
    console.log(`Winner: ${winner}`);

    elements.boardpieces.innerHTML = `<p><i>Winner! ${winner} wins!`;
}

document.addEventListener('DOMContentLoaded', init);
