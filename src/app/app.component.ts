import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'puzzle-solver';
  colors = [
    "rgb(11, 11, 213)",     // 0  blue 
    "rgb(84, 190, 226)",    // 1  light blue
    "rgb(160, 44, 44)",     // 2  red
    "rgb(45, 240, 165)",    // 3  glass green
    "rgb(92, 18, 157)",     // 4  purple
    "rgb(238, 111, 157)",   // 5  reddish pink
    "rgb(234, 145, 36)",    // 6  orange
    "rgb(108, 108, 108)",   // 7  grey
    "rgb(184, 83, 188)",    // 8  pink
    "rgb(238, 210, 30)",    // 9  yellow
    "rgb(56, 212, 25)",     // 10 green
  ]
  glasses = [
    { liquids: [0, 1, 1, 2] },
    { liquids: [3, 4, 5, 6] },
    { liquids: [6, 7, 4, 7] },
    { liquids: [8, 9, 7, 5] },
    { liquids: [2, 1, 5, 4] },
    { liquids: [10, 5, 3, 9] },
    { liquids: [6, 0, 2, 2] },
    { liquids: [10, 8, 9, 6] },
    { liquids: [7, 8, 10, 9] },
    { liquids: [3, 4, 10, 0] },
    { liquids: [0, 3, 1, 8] },
    { liquids: [] },
    { liquids: [] },
  ]

  solvingGlasses: any = [];
  solving = false;
  initialMove = { possibleMoves: [] }
  moveNestedIndexes = [0];

  numberOfMoves = 0;
  lastMoves: any = [];
  undoWorked = false;

  deadEnds:any = []

  constructor() {
  }

  solvePuzzle() {
    // create a copy of the glasses removing bindings
    this.solvingGlasses = JSON.parse(JSON.stringify(this.glasses));
    this.solving = true;
    this.determinePossibleMoves();
    this.doNextMove();

  }

  doNextMove() {
    if (this.solving) {
      this.numberOfMoves++;
      this.performNextMove();
      
      // wait 1 second before doing the next move
      setTimeout(() => {
        this.doNextMove();
      }, 200);

    }
  }

  stopSolving() {
    this.solving = false;
    this.initialMove = { possibleMoves: [] }
    this.moveNestedIndexes = [0];
    this.solvingGlasses = [];
    this.numberOfMoves = 0;
    this.lastMoves = [];
    this.deadEnds = []

  }

  determinePossibleMoves(): any {
    let possibleMoves = [];
    for (let i = 0; i < this.solvingGlasses.length; i++) {
      for (let j = 0; j < this.solvingGlasses.length; j++) {
        if (i != j) {
          let fromGlass = this.solvingGlasses[i];
          let toGlass = this.solvingGlasses[j];
          if (fromGlass.liquids.length > 0 && toGlass.liquids.length < 4) {
            // if the first liquid in the fromGlass is the same as the first liquid in the toGlass or the toGlass is empty
            if (fromGlass.liquids[0] == toGlass.liquids[0] || toGlass.liquids.length == 0) {
              possibleMoves.push({ fromGlass: i, toGlass: j, possibleMoves: [] });
            }
          }
        }
      }
    }

    let moveToWrite: any = this.getMoveToWrite();
    moveToWrite.possibleMoves = possibleMoves;
  }

  getMoveToWrite(): any {
    let moveToWrite: any = this.initialMove;
    for (let i = 0; i < this.moveNestedIndexes.length; i++) {
      if (i > 0) {
        let levelIndex = this.moveNestedIndexes[i];
        moveToWrite = moveToWrite["possibleMoves"][levelIndex]
      }
    }

    return moveToWrite;
  }

  getFirstMoveInLine(): any {
    let moveToWrite: any = this.getMoveToWrite();
    console.log(this.moveNestedIndexes.join("."))
    console.log("moveToWrite ", moveToWrite.possibleMoves.length);

    let nextMove = null;

    for (let moveIndex = 0; moveIndex < moveToWrite.possibleMoves.length; moveIndex++) {
      const move = moveToWrite.possibleMoves[moveIndex];

      // if the move is already in the dead ends list, skip it
      if (this.deadEnds.includes(this.moveNestedIndexes.join(".")+ "." + moveIndex)) {
        continue;
      }else{
        nextMove = { moveIndex: moveIndex, move: move };
        break;
      }
    }

    return nextMove;
  }

  markCurrentMoveAsDeadEnd() {
    this.deadEnds.push(this.moveNestedIndexes.join("."));
    console.log("this.deadEnds ", this.deadEnds);
    this.moveNestedIndexes.pop();
    this.undoLastMove();
    this.deadEnds.push(this.moveNestedIndexes.join("."));
    this.moveNestedIndexes.pop();

 }

  performNextMove() {
    let nextMove = this.getFirstMoveInLine();
    if (nextMove == null) {
      this.markCurrentMoveAsDeadEnd();
    } else {

      let fromGlass = this.solvingGlasses[nextMove.move.fromGlass];
      let toGlass = this.solvingGlasses[nextMove.move.toGlass];

      //if the last move is not the opposite of the next move, then do the next move
      if (this.lastMoves.length > 0) {
        let lastMove = this.lastMoves[this.lastMoves.length - 1];
        if (lastMove.move.fromGlass == nextMove.move.toGlass && lastMove.move.toGlass == nextMove.move.fromGlass) {
          this.markCurrentMoveAsDeadEnd();
          return;
        }
      }
      let liquid = fromGlass.liquids.shift();
      toGlass.liquids.unshift(liquid);
      this.moveNestedIndexes.push(nextMove.moveIndex);
      this.lastMoves.push(nextMove);
      
    }
    this.determinePossibleMoves();
  }

    undoLastMove() {
      console.log("undoLastMove ");
      if (this.lastMoves.length > 0) {
        let fromGlass = this.solvingGlasses[this.lastMoves[this.lastMoves.length - 1].move.fromGlass];
        let toGlass = this.solvingGlasses[this.lastMoves[this.lastMoves.length - 1].move.toGlass];
        let liquid = toGlass.liquids.shift();
        fromGlass.liquids.unshift(liquid);

        this.lastMoves.pop();

      }
    }
  }
