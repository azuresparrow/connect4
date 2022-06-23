class Game{
    constructor(player1, player2, width=7, height=6){
        this.activePlayer = player1;
        this.players = [player1, player2];
        this.totalPieces = 0; //used to check for ties
        this.gameFinished = false;
        this.announcementUI = document.querySelector("#gameStatus");
        this.announcementUI.classList.remove(...this.announcementUI.classList);
        this.announcementUI.style.backgroundColor = null;
        this.width = width;
        this.height = height;

        this.updateAnnouncement();
        this.makeBoard();
        this.makeHtmlBoard();
    }

    //generates the board model
    makeBoard() {
        this.board = [];
        for(let i = 0; i < this.height; i++)
            this.board[i] = Array(this.width).fill(0);
    }
    
    //Generates the board HTML
    makeHtmlBoard() {
        const htmlBoard = document.querySelector("#board");
        htmlBoard.innerHTML = "";
        //Creates the top interactive row
        const top = document.createElement("tr");
        top.setAttribute("id", "column-top");
        this.handleGameClick = this.handleClick.bind(this);
        top.addEventListener("click", this.handleGameClick);
        //populates the interactive row
        for (let x = 0; x < this.width; x++) {
            const headCell = document.createElement("td");
            headCell.setAttribute("id", x);
            top.append(headCell);
        }
        htmlBoard.append(top);
        
        // generates a row
        for (let y = 0; y < this.height; y++) {
            const row = document.createElement("tr");
            for (let x = 0; x < this.width; x++) {
                //then populates that row, creating a unique ID
                const cell = document.createElement("td");
                cell.setAttribute("id", `c${y}-${x}`);
                row.append(cell);
            }
            htmlBoard.append(row);
        }
    }

    //Updates the callout at the top of the screen, so the users know whose turn it is or if the game is over.
    updateAnnouncement() {
        this.announcementUI.style.color = this.activePlayer.color;
        this.announcementUI.textContent = this.activePlayer.turnCallout();
    }

    //Announces the winner of the game
    endGame(isWinner){
        this.gameFinished = true; 
        if(isWinner){ 
            this.announcementUI.textContent = this.activePlayer.winCallout();
            this.announcementUI.classList.add("textVictory");
            this.announcementUI.style.color = "#222f3e";
            this.announcementUI.style.backgroundColor = this.activePlayer.color;
        } else {
            this.announcementUI.textContent = `Tie Game`;
            this.announcementUI.classList.add("textVictory", `draw`);
            this.announcementUI.style.backgroundColor = "#5f27cd";
        }
    }
    //returns the lowest available Y for a piece given X
    findLowestAvailableSlot(x) {
        let scan = this.height-1; //starts from the lowest possible height
        while(scan >= 0){ //steps upward until it reaches the top 
            if(this.board[scan][x] == 0) return scan; //returns as soon as it finds an opening
            scan--; 
        }
        return null; //no slot remaining
    }

    placeInTable(x,y) {
        const newPiece = document.createElement("div");
        //styles the div to look like the appropriate player's piece
        newPiece.style.backgroundColor = this.activePlayer.color; 
        newPiece.classList.add("piece");
        //Looks up the proper row/col to put the div
        const targetLocation = document.querySelector(`#c${y}-${x}`);
        targetLocation.appendChild(newPiece);
    }

    //Tests if x,y coordinates are still in bounds
    isOnTable(x,y){
        return !(x < 0 || y < 0 || x >= this.width || y >= this.height);
    }

    //Recursively scan in a given direction for active player
    scanInDirection(x, y, xMutator, yMutator, count){
        if(this.isOnTable(x,y) && this.board[y][x] == this.activePlayer.name) {//not off table and still found current player, keep going.
            return this.scanInDirection(x + xMutator,y + yMutator, xMutator, yMutator, ++count);
        }
        return count; //ran into deadend, bail and return count
    }
    

    //Checks for a winner from the newly placed piece, recursively checking outward
    scanForWin(x,y){
        if(this.scanInDirection(x,y,0,1,0) >= 4) return true;
        if(this.scanInDirection(x,y,-1,0,0) + this.scanInDirection(x+1,y,1,0,0) >=4) return true;
        if(this.scanInDirection(x,y,-1,1,0) + this.scanInDirection(x+1,y-1,1,-1) >=4) return true;
        if(this.scanInDirection(x,y,-1,-1,0) + this.scanInDirection(x+1,y+1,1,1,0) >=4) return true;
        if(this.totalPieces == this.width*this.height) this.endGame(false);
        return false;
    }
    
    handleClick(event) {
        const x = +event.target.id;
        const y = this.findLowestAvailableSlot(x);

        if(y === null || this.gameFinished) return; // ignores invalid clicks on full rows and clicks after the game was won.
        this.placeInTable(x,y);
    
        this.board[y][x] = this.activePlayer.name;
        console.log(this.board);
        this.totalPieces++;
        if(this.scanForWin(x, y)){ //Finishes game
            this.endGame(true);
            return;
        }
        this.activePlayer = this.activePlayer === this.players[0] ? this.players[1] : this.players[0];

        //clear the class list for announcements
        this.updateAnnouncement();
    }
}

class Player {
    constructor(color, name){
        this.color = color;
        this.name = name;
    }
    
    turnCallout(){
        return `${this.name}'s Turn`;
    }

    winCallout(){
        return `${this.name} Wins!`
    }
}

document.getElementById("start").addEventListener('click', (event) => {
    event.preventDefault();
    
    let player1 = new Player(document.getElementById("p1Color").value, document.getElementById("p1Name").value);
    let player2 = new Player(document.getElementById("p2Color").value, document.getElementById("p2Name").value);
    new Game(player1, player2);
});