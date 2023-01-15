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

  solution = [];

  solvingGlasses: any = [];
  solving = false;
  initialMove = { possibleMoves: [] }
  moveNestedIndexes: any = [0];

  numberOfMoves = 0;
  lastMoves: any = [];
  undoWorked = false;

  deadEnds: any = []

  solved = false;
  checking = false;
  checkingIndex = 0;
  checkingFinished = false;
  checkingFromGlass = 0;
  checkingToGlass = 0;
  waitingForCheckingMove = false;

  constructor() {
    this.solvingGlasses = JSON.parse(JSON.stringify(this.glasses));

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
      let timeout = setTimeout(() => {
        if (this.checkIfSolved()) {
          clearTimeout(timeout);
          this.solvedPuzzle();
          return;
        }
        this.doNextMove();
      }, 0);

    }
  }

  solvedPuzzle() {
    this.solving = false;
    console.log("solved puzzle");
    console.log(this.moveNestedIndexes)
    this.solution = this.moveNestedIndexes;
    this.solution.shift();
    this.solved = true;
  }

  stopSolving() {
    this.solving = false;
    this.initialMove = { possibleMoves: [] }
    this.moveNestedIndexes = [0];
    this.solvingGlasses = [];
    this.numberOfMoves = 0;
    this.lastMoves = [];
    this.deadEnds = []
    this.solved = false;
    this.checking = false;

  }


  checkIfSolved() {
    let solved = true;
    const allEqual = (arr: any) => arr.every((v: any) => v === arr[0]);

    for (let i = 0; i < this.solvingGlasses.length; i++) {
      const glass = this.solvingGlasses[i];
      if (glass.liquids.length > 0) {
        if (glass.liquids.length == 4) {
          if (allEqual(glass.liquids)) {
            continue;
          } else {
            solved = false;
            break;
          }
        } else {
          solved = false;
          break;
        }
      }
    }

    return solved;

  }

  determinePossibleMoves(): any {
    let possibleMoves = [];
    const allEqual = (arr: any) => arr.every((v: any) => v === arr[0]);

    for (let i = 0; i < this.solvingGlasses.length; i++) {
      for (let j = 0; j < this.solvingGlasses.length; j++) {
        if (i != j) {
          let fromGlass = this.solvingGlasses[i];
          let toGlass = this.solvingGlasses[j];
          if (fromGlass.liquids.length > 0 && toGlass.liquids.length < 4) {
            // if the first liquid in the fromGlass is the same as the first liquid in the toGlass or the toGlass is empty
            if (fromGlass.liquids[0] == toGlass.liquids[0] || toGlass.liquids.length == 0) {
              if (fromGlass.liquids.length > 1 && fromGlass.liquids[0] == fromGlass.liquids[1] && toGlass.liquids.length > 2) {
                continue;
              }
              if (fromGlass.liquids.length > 2 && fromGlass.liquids[0] == fromGlass.liquids[1] && fromGlass.liquids[1] == fromGlass.liquids[2] && toGlass.liquids.length > 1) {
                continue;
              }
              if (fromGlass.liquids.length == 4 && allEqual(fromGlass.liquids)) {
                continue;
              }

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

    let nextMove = null;

    for (let moveIndex = 0; moveIndex < moveToWrite.possibleMoves.length; moveIndex++) {
      const move = moveToWrite.possibleMoves[moveIndex];

      // if the move is already in the dead ends list, skip it
      if (this.deadEnds.includes(this.moveNestedIndexes.join(".") + "." + moveIndex)) {
        continue;
      } else {
        nextMove = { moveIndex: moveIndex, move: move };
        break;
      }
    }

    return nextMove;
  }

  markCurrentMoveAsDeadEnd() {
    this.deadEnds.push(this.moveNestedIndexes.join("."));
    this.moveNestedIndexes.pop();
    this.undoLastMove();

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
    if (this.lastMoves.length > 0) {
      let fromGlass = this.solvingGlasses[this.lastMoves[this.lastMoves.length - 1].move.fromGlass];
      let toGlass = this.solvingGlasses[this.lastMoves[this.lastMoves.length - 1].move.toGlass];
      let liquid = toGlass.liquids.shift();
      fromGlass.liquids.unshift(liquid);

      this.lastMoves.pop();

    }
  }

  getPossibleMoves() {
    let possibleMoves = [];
    const allEqual = (arr: any) => arr.every((v: any) => v === arr[0]);
    for (let i = 0; i < this.solvingGlasses.length; i++) {
      for (let j = 0; j < this.solvingGlasses.length; j++) {
        if (i != j) {
          let fromGlass = this.solvingGlasses[i];
          let toGlass = this.solvingGlasses[j];
          if (fromGlass.liquids.length > 0 && toGlass.liquids.length < 4) {
            // if the first liquid in the fromGlass is the same as the first liquid in the toGlass or the toGlass is empty
            if (fromGlass.liquids[0] == toGlass.liquids[0] || toGlass.liquids.length == 0) {
              if (fromGlass.liquids.length > 1 && fromGlass.liquids[0] == fromGlass.liquids[1] && toGlass.liquids.length > 2) {
                continue;
              }
              if (fromGlass.liquids.length > 2 && fromGlass.liquids[0] == fromGlass.liquids[1] && fromGlass.liquids[1] == fromGlass.liquids[2] && toGlass.liquids.length > 1) {
                continue;
              }
              if (fromGlass.liquids.length == 4 && allEqual(fromGlass.liquids)) {
                continue;
              }

              possibleMoves.push({ fromGlass: i, toGlass: j, possibleMoves: [] });
            }
          }
        }
      }
    }

    return possibleMoves;
  }

  resetChecking() {
    this.solvingGlasses = JSON.parse(JSON.stringify(this.glasses));
    this.checkingIndex = 0;
    this.checkingFinished = false;
  }

  checkSolution() {
    this.checking = true;
    this.solvingGlasses = JSON.parse(JSON.stringify(this.glasses));
    this.checkingIndex = 0;

    this.solution.forEach(element => {
      this.doNextCheckingMove();
    });

  }

  doNextCheckingMove() {
    let possibleMoves: any = []
    possibleMoves = this.getPossibleMoves();
    console.log("possibleMoves ", possibleMoves);
    const solutionIndex = this.solution[this.checkingIndex];
    console.log("solutionIndex ", solutionIndex);
    this.checkingFromGlass = possibleMoves[solutionIndex].fromGlass
    this.checkingToGlass = possibleMoves[solutionIndex].toGlass
    this.waitingForCheckingMove = true;
    this.performCheckingMove();
  }

  performCheckingMove() {
    let liquid = this.solvingGlasses[this.checkingFromGlass].liquids.shift();
    this.solvingGlasses[this.checkingToGlass].liquids.unshift(liquid);
    this.checkingIndex++;
    this.waitingForCheckingMove = false;
    if (this.checkingIndex == this.solution.length) {
      this.checkingFinished = true;
    }
  }


  generateRandomGame() {
    this.glasses = [];
    // add 13 objects to the glasses array with a liquids property which is also an array
    let numbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    let usedNumbers: any = [];

    for (let i = 0; i < 13; i++) {
      let liquids: any[] = [];
      if (i < 11) {
        for (let j = 0; j < 4; j++) {
          let randomNumber = numbers.sort(() => 0.5 - Math.random())[0];
          usedNumbers.push(randomNumber);
          let totalUsedCount = usedNumbers.filter((x: any) => x == randomNumber).length
          if (totalUsedCount == 4) {
            numbers.splice(numbers.indexOf(randomNumber), 1);
          }
          liquids.push(randomNumber);
        }
      }
      this.glasses.push({ liquids: liquids });
    }


 console.log("this.glasses ", this.glasses);
  }

}
