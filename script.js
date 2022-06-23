const board = [];
let activePlayer = 1;
const WIDTH = 7;
const HEIGHT = 6;
let gameFinished = false;
let totalPieces = 0; //used to check for ties


const gameStateUI = document.querySelector("#gameStatus");
//play again button init
const playAgainButton = document.querySelector("#playAgainButton button");
playAgainButton.addEventListener("click", playAgain);

//initialize all slots to "empty"
function makeBoard() {
    //randomize player1
    activePlayer = Math.round(Math.random()) + 1;
    //init label
    gameStateUI.classList.add(`player${activePlayer}Text`);
    gameStateUI.textContent = `Player ${activePlayer}'s Turn`;

    for(let i = 0; i < HEIGHT; i++) 
        board[i] = Array(WIDTH).fill(0);   
}

//Generates the board HTML
function makeHtmlBoard() {
    const htmlBoard = document.querySelector("#board");
    //Creates the top interactive row
    const top = document.createElement("tr");
    top.setAttribute("id", "column-top");
    top.addEventListener("click", handleClick);
    //populates the interactive row
    for (let x = 0; x < WIDTH; x++) {
        const headCell = document.createElement("td");
        headCell.setAttribute("id", x);
        top.append(headCell);
    }
    htmlBoard.append(top);
    
    // generates a row
    for (let y = 0; y < HEIGHT; y++) {
        const row = document.createElement("tr");
        for (let x = 0; x < WIDTH; x++) {
            //then populates that row, creating a unique ID
            const cell = document.createElement("td");
            cell.setAttribute("id", `c${y}-${x}`);
            row.append(cell);
        }
        htmlBoard.append(row);
    }
}

//Updates the callout at the top of the screen, so the users know whose turn it is or if the game is over.
function updateGameStateUI(){
    gameStateUI.classList.remove(...gameStateUI.classList);
    gameStateUI.classList.add(`player${activePlayer}Text`);
    gameStateUI.textContent = `Player ${activePlayer}'s Turn`;
}

function handleClick(event){
    const x = +event.target.id;
    const y = findLowestAvailableSlot(x);
    if(y === null || gameFinished) return; // ignores invalid clicks on full rows and clicks after the game was won.
    
    placeInTable(x,y);

    board[y][x] = activePlayer;
    totalPieces++;
    if(scanForWin(x, y)){ //Finishes game
        endGame(true);
        return;
    }

    activePlayer = (activePlayer%2)+1; //toggles player

    //clear the class list for announcements
    updateGameStateUI();
}

//returns the lowest available Y for a piece given X
function findLowestAvailableSlot(x){
    let scan = HEIGHT-1;
    //starts from the lowest possible height
    while(scan >= 0){
        if(board[scan][x] == 0) return scan; //returns as soon as it finds an opening
        scan--;
    }
    return null; //no slot remaining
}

function placeInTable(x,y) {
    const newPiece = document.createElement("div");
    //styles the div to look like the appropriate player's piece
    newPiece.classList.add("piece", `player${activePlayer}`); 
    //Looks up the proper row/col to put the div
    const targetLocation = document.querySelector(`#c${y}-${x}`);
    targetLocation.appendChild(newPiece);
}

//Checks for a winner from the newly placed piece, recursively checking outward
function scanForWin(x,y){
    //Scan for vertical Win
    if(scanInDirection(x,y,0,1,0) >= 4) return true;
    //Scan for horizontal win, each scan forward now combines 2 results.
    //second call is offset by the mutator to not count the placed piece twice
    if(scanInDirection(x,y,-1,0,0) + scanInDirection(x+1,y,1,0,0) >=4) return true;
    //Scan \ diagonal
    if(scanInDirection(x,y,-1,1,0) + scanInDirection(x+1,y-1,1,-1) >=4) return true;
    //Scan / diagonal
    if(scanInDirection(x,y,-1,-1,0) + scanInDirection(x+1,y+1,1,1,0) >=4) return true;
    if(totalPieces == WIDTH*HEIGHT){
        endGame(false);
    }
    return false;
}

//Recursively scan in a given direction for active player
function scanInDirection(x, y, xMutator, yMutator, count){
    if(isOnTable(x,y) && board[y][x] == activePlayer) {//not off table and still found current player, keep going.
        return scanInDirection(x + xMutator,y + yMutator, xMutator, yMutator, ++count);
    }
    return count; //ran into deadend, bail and return count
}

//Tests if x,y coordinates are still in bounds
function isOnTable(x,y){
    return !(x < 0 || y < 0 || x >= WIDTH || y >= HEIGHT);
}

//Announces the winner of the game
function endGame(isWinner){
    gameFinished = true; // locks out new piece inputs
    setTimeout(()=> { //waits for piece to finish moving before announcing winner
        if(isWinner){ 
            gameStateUI.textContent = `Player ${activePlayer} Wins!`;
            gameStateUI.classList.add("textVictory", `player${activePlayer}`);
        } else {
            gameStateUI.textContent = `Tie Game`;
            gameStateUI.classList.add("textVictory", `draw`);
        }
        playAgainButton.classList.toggle("hidden");
    }, 500);
}

//restarts game
function playAgain(){
    gameFinished = false; //enables piece inputs
    totalPieces = 0;
    clearBoard(); //remove only pieces from board, avoiding a full redraw
    makeBoard(); //reset the model
    updateGameStateUI();
    playAgainButton.classList.toggle("hidden");
}

//removes all pieces from board
function clearBoard(){
    const pieces = document.querySelectorAll(".piece");
    pieces.forEach((piece) => piece.parentElement.removeChild(piece));
}

makeBoard();
makeHtmlBoard();