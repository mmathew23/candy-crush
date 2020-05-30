require("./blue-candy.png");
require("./blue-special.png");
require("./green-candy.png");
require("./green-special.png");
require("./color-bomb.png");
require("./orange-candy.png");
require("./orange-special.png");
require("./purple-candy.png");
require("./purple-special.png");
require("./red-candy.png");
require("./red-special.png");
require("./yellow-candy.png");
require("./mainLayout.css");

var Candy = function(color, id) {
  ////////////////////////////////////////////////
  // Representation
  //

  // Two immutable properties
  Object.defineProperty(this, "color", { value: color, writable: false });
  Object.defineProperty(this, "id", { value: id, writable: false });

  // Two mutable properties
  this.row = null;
  this.col = null;

  ////////////////////////////////////////////////
  // Public methods
  //
  this.toString = function() {
    var name = this.color;
    return name;
  };
};

Candy.colors = ["red", "yellow", "green", "orange", "blue", "purple"];

var Board = function(size) {
  // A unique ID for each candy.
  var candyCounter = 0;

  // Score, one point per candy crushed.
  this.score = 0;

  // boardSize is number of squares on one side of candy-board
  this.boardSize = size;

  // square is a two dimensional array representating the candyboard
  // square[row][col] is the candy in that square, or null if square is empty
  this.square = new Array(this.boardSize);
  // make an empty candyboard
  for (var i = 0; i <= this.boardSize; i++) {
    this.square[i] = [];
  }

  /*
   * Returns true/false depending on whether row and column
   * identify a valid square on the board.
   */
  this.isValidLocation = function(row, col) {
    return (
      row >= 0 &&
      col >= 0 &&
      row <= this.boardSize &&
      col <= this.boardSize &&
      row == Math.round(row) &&
      col == Math.round(col)
    );
  };

  /*
   * Returns true/false depending on whether the
   * square at [row,col] is empty (does not contain a candy).
   */
  this.isEmptyLocation = function(row, col) {
    if (this.getCandyAt(row, col)) {
      return false;
    }
    return true;
  };

  ////////////////////////////////////////////////
  // Public methods
  //

  /*
   * Perform an a valid move automatically on the board. Flips the
   * appropriate candies, but does not crush the candies.
   */
  this.doAutoMove = function() {
    var move = rules.getRandomValidMove();
    var toCandy = board.getCandyInDirection(move.candy, move.direction);
    this.flipCandies(move.candy, toCandy);
  };

  /*
   * Returns the number of squares on each side of the board
   */
  this.getSize = function() {
    return this.boardSize;
  };

  /**
   * Get the candy found on the square at [row,column], or null
   * if the square is empty.  Requires row,column < size.
   */
  this.getCandyAt = function(row, col) {
    if (this.isValidLocation(row, col)) {
      return this.square[row][col];
    }
  };

  /**
   * Get location of candy (row and column) if it's found on this
   * board, or null if not found.
   */
  this.getLocationOf = function(candy) {
    return { row: candy.row, col: candy.col };
  };

  /**
   * Get a list of all candies on the board, in no particular order.
   */
  this.getAllCandies = function() {
    var results = [];
    for (var r in this.square) {
      for (var c in this.square[r]) {
        if (this.square[r][c]) {
          results.push(this.square[r][c]);
        }
      }
    }
    return results;
  };

  /*
   * Add a new candy to the board.  Requires candies to be not currently
   * on the board, and (row,col) must designate a valid empty square.
   *
   * The optional spawnRow, spawnCol indicate where the candy
   * was "spawned" the moment before it moved to row, col. This location,
   * which may be off the board, is added to the 'add' event and
   * can be used to animate new candies that are coming in from offscreen.
   */
  this.add = function(candy, row, col, spawnRow, spawnCol) {
    if (this.isEmptyLocation(row, col)) {
      var details = {
        candy: candy,
        toRow: row,
        toCol: col,
        fromRow: spawnRow,
        fromCol: spawnCol
      };

      candy.row = row;
      candy.col = col;

      this.square[row][col] = candy;

      jQuery(this).triggerHandler("add", details);
    } else {
      console.log("add already found a candy at " + row + "," + col);
    }
  };

  /**
   * Move a candy from its current square to another square.
   * Requires candy to be already found on this board, and (toRow,toCol)
   * must denote a valid empty square.
   */
  this.moveTo = function(candy, toRow, toCol) {
    if (this.isEmptyLocation(toRow, toCol)) {
      var details = {
        candy: candy,
        toRow: toRow,
        toCol: toCol,
        fromRow: candy.row,
        fromCol: candy.col
      };

      delete this.square[candy.row][candy.col];
      this.square[toRow][toCol] = candy;

      candy.row = toRow;
      candy.col = toCol;

      jQuery(this).triggerHandler("move", details);
    }
  };

  /**
   * Remove a candy from this board.
   * Requires candy to be found on this board.
   */
  this.remove = function(candy) {
    var details = {
      candy: candy,
      fromRow: candy.row,
      fromCol: candy.col
    };
    delete this.square[candy.row][candy.col];
    candy.row = candy.col = null;
    jQuery(this).triggerHandler("remove", details);
  };

  /**
   * Remove a candy at a given location from this board.
   * Requires candy to be found on this board.
   */
  this.removeAt = function(row, col) {
    if (this.isEmptyLocation(row, col)) {
      console.log("removeAt found no candy at " + row + "," + col);
    } else {
      this.remove(this.square[row][col]);
    }
  };

  /**
   * Remove all candies from board.
   */
  this.clear = function() {
    for (var r in this.square) {
      for (var c in this.square[r]) {
        if (this.square[r][c]) {
          this.removeAt(r, c);
        }
      }
    }
  };

  ////////////////////////////////////////////////
  // Utilities
  //

  /*
  Adds a candy of specified color to row, col. 
  */
  this.addCandy = function(color, row, col, spawnRow, spawnCol) {
    var candy = new Candy(color, candyCounter++);
    this.add(candy, row, col, spawnRow, spawnCol);
  };

  /**
   * Adds a candy of random color at row, col.
   */
  this.addRandomCandy = function(row, col, spawnRow, spawnCol) {
    var random_color = Math.floor(Math.random() * Candy.colors.length);
    var candy = new Candy(Candy.colors[random_color], candyCounter++);

    this.add(candy, row, col, spawnRow, spawnCol);
  };

  /*
  Returns the candy immediately in the direction specified by direction
  ['up', 'down', 'left', 'right'] from the candy passed as fromCandy
  */
  this.getCandyInDirection = function(fromCandy, direction) {
    switch (direction) {
      case "up": {
        return this.getCandyAt(fromCandy.row - 1, fromCandy.col);
      }
      case "down": {
        return this.getCandyAt(fromCandy.row + 1, fromCandy.col);
      }
      case "left": {
        return this.getCandyAt(fromCandy.row, fromCandy.col - 1);
      }
      case "right": {
        return this.getCandyAt(fromCandy.row, fromCandy.col + 1);
      }
    }
  };

  /* Flip candy1 with candy2 in one step, firing two move events.
   * Does not verify the validity of the flip. Does not crush candies
   * produced by flip. */
  this.flipCandies = function(candy1, candy2) {
    // Swap the two candies simultaneously.
    var details1 = {
      candy: candy1,
      toRow: candy2.row,
      toCol: candy2.col,
      fromRow: candy1.row,
      fromCol: candy1.col
    };
    var details2 = {
      candy: candy2,
      toRow: candy1.row,
      toCol: candy1.col,
      fromRow: candy2.row,
      fromCol: candy2.col
    };
    candy1.row = details1.toRow;
    candy1.col = details1.toCol;
    this.square[details1.toRow][details1.toCol] = candy1;
    candy2.row = details2.toRow;
    candy2.col = details2.toCol;
    this.square[details2.toRow][details2.toCol] = candy2;

    // Trigger two move events.
    jQuery(this).triggerHandler("move", details1);
    jQuery(this).triggerHandler("move", details2);
  };

  /*
   * Resets the score
   */
  this.resetScore = function() {
    this.score = 0;
    jQuery(this).triggerHandler("scoreUpdate", [{ score: 0 }]);
  };

  /*
   * Adds some score.
   */
  this.incrementScore = function(candy, row, col) {
    this.score += 1;
    jQuery(this).triggerHandler("scoreUpdate", [
      {
        score: this.score,
        candy: candy,
        row: row,
        col: col
      }
    ]);
  };

  /*
   * Gets the current score
   */
  this.getScore = function() {
    return this.score;
  };

  /**
   * Get a string representation for the board as a multiline matrix.
   */
  this.toString = function() {
    var result = "";
    for (var r = 0; r < this.boardSize; ++r) {
      for (var c = 0; c < this.boardSize; ++c) {
        var candy = this.square[r][c];
        if (candy) {
          result += candy.toString().charAt(0) + " ";
        } else {
          result += "_ ";
        }
      }
      result += "<br/>";
    }
    return result.toString();
  };
};

/* Copyright (c) 2017 MIT 6.813/6.831 course staff, all rights reserved.
 * Redistribution of original or derived work requires permission of course staff.
 */

/*
 *
 * This class implements the rules of Candy Crush.
 *
 */
var Rules = function(board) {
  // Set during setup, to avoid scoring.
  var scoring = false;

  ////////////////////////////////////////////////
  // PUBLIC METHODS
  //
  // You will likely call these methods in index.html
  //

  /*
   *
   * Prepares a new game with no groups of three adjacent same-color candies.
   * Any time there is a group of adjacent same-color candies, re-rolls them.
   * Sets the score to zero such that the player does not get points for
   * crushes that occure by luck initially.
   *
   */
  this.prepareNewGame = function() {
    scoring = false;
    while (true) {
      this.populateBoard();
      var crushable = this.getCandyCrushes();
      if (crushable.length == 0) break;
      this.removeCrushes(crushable);
    }
    scoring = true;
  };

  /*
   *
   *  Returns true if flipping fromCandy with the candy in the direction
   *  specified (['up', 'down', 'left', 'right']) is valid
   *  (according to the rules), else returns false.
   *
   */
  this.isMoveTypeValid = function(fromCandy, direction) {
    return this.numberCandiesCrushedByMove(fromCandy, direction) > 0;
  };

  /*
   *
   *  Returns a list of ALL candy crushes on the board. A candy crush is
   *  a list of three or more candies in a single row or column that have
   *  the same color. Each crush is provided as a list of the candies being
   *  crushed, resulting in a list of lists. The output of this method should
   *  be passed directly into this.removeCrushes to remove candy crushes.
   *
   */
  this.getCandyCrushes = function(swap) {
    // Implemented with a (not fully optimized) Tarjan's union-find algorithm.
    // Implementation of the classic union-find algorithm (unoptimized).
    // Allows any string keys to be unioned into a set of disjoint sets.
    // https://en.wikipedia.org/wiki/Disjoint-set_data_structure
    var unioned = {};
    var sizes = {};
    var row, col;
    // Finds the set representative for the set that this key is a member of.
    function find(key) {
      var parent = unioned[key];
      if (parent == null) return key;
      parent = find(parent);
      unioned[key] = parent; // Path compression
      return parent;
    }
    // The size of the set represented by 'found'; assume 1 if not stored.
    function size(found) {
      return sizes[found] || 1;
    }
    // Ennsures that the two keys are in the same set, joining if needed.
    function union(key1, key2) {
      var p1 = find(key1),
        p2 = find(key2);
      if (p1 == p2) return p1;
      // Do not bother implementing union by rank.  This is pretty fast too.
      // n.b., http://stackoverflow.com/a/2326676/265298
      unioned[p2] = p1;
      sizes[p1] = size(p1) + size(p2);
      delete sizes[p2];
    }
    // Get strips of length 3.
    var vert = this.findColorStrips(true, swap);
    var horiz = this.findColorStrips(false, swap);
    var sets = vert.concat(horiz);

    // Execute union of all the strips, possibly joining
    // horizontal and vertical strips that intersect.
    for (var j = 0; j < sets.length; j++) {
      var set = sets[j];
      for (var k = 1; k < set.length; k++) {
        union(set[0].id, set[k].id);
      }
    }

    // Pass 2: list out resulting sets of minSize or larger.
    var results = {};
    for (row = 0; row < board.boardSize; row++) {
      for (col = 0; col < board.boardSize; col++) {
        var candy = board.getCandyAt(row, col);
        if (candy) {
          var p = find(candy.id);
          if (size(p) >= 3) {
            if (!(p in results)) results[p] = [];
            results[p].push(candy);
          }
        }
      }
    }
    // Pass 3: Return results as a list of list of candies.
    var list = [];
    for (var key in results) {
      list.push(results[key]);
    }
    return list;
  };

  /*
   *
   *   Deletes all the candies in setOfSetsOfCrushes (which can be
   *   generated by getCandyCrushes or by getCandiesToCrushGivenMove.)
   *   Does not shift candies down at all. Updates the score accordingly.
   *
   */
  this.removeCrushes = function(setOfSetsOfCrushes) {
    for (var j = 0; j < setOfSetsOfCrushes.length; j++) {
      var set = setOfSetsOfCrushes[j];
      for (var k = 0; k < set.length; k++) {
        if (scoring) board.incrementScore(set[k], set[k].row, set[k].col);
        board.remove(set[k]);
      }
    }
  };

  /*
   *
   *  Moves candies down as far as there are empty spaces. Issues calls to
   *  board.moveTo, which generate "move" events to listen for. If there
   *  are holes created by moving the candies down, populates the holes
   *  with random candies, and issues "add" events for these candies.
   *
   */
  this.moveCandiesDown = function() {
    // Collapse each column
    for (var col = 0; col < board.boardSize; col++) {
      var emptyRow = null;
      // In each column, scan for the bottom most empty row
      for (var emptyRow = board.boardSize - 1; emptyRow >= 0; emptyRow--) {
        if (board.getCandyAt(emptyRow, col) == null) {
          break;
        }
      }
      // Then shift any nonempty rows up
      for (var row = emptyRow - 1; row >= 0; row--) {
        var candy = board.getCandyAt(row, col);
        if (candy != null) {
          board.moveTo(candy, emptyRow, col);
          emptyRow--;
        }
      }

      for (var spawnRow = -1; emptyRow >= 0; emptyRow--, spawnRow--) {
        // We report spawnRow as the (negative) position where
        // the candy "would have" started to fall into place.
        board.addRandomCandy(emptyRow, col, spawnRow, col);
      }
    }
  };

  /*
   *
   *  If there is a valid move, returns an object with two properties:
   *  candy: a Candy that can be moved
   *  direction: the direction that it can be moved.
   *  If there are no valid moves, returns null.  The move is selected
   *  randomly from the available moves, favoring moves with smaller crushes.
   *
   */
  this.getRandomValidMove = function() {
    var directions = ["up", "down", "left", "right"];
    var validMovesThreeCrush = [];
    var validMovesMoreThanThreeCrush = [];

    // For each cell in the board, check to see if moving it in
    // any of the four directions would result in a crush
    // if so, add it to the appropriate list (validMoves_threeCrush for
    // crushes of size 3, validMoves_moreThanThreeCrush for crushes
    // larger than 3)
    for (var row = 0; row < board.boardSize; row++) {
      for (var col = 0; col < board.boardSize; col++) {
        var fromCandy = board.getCandyAt(row, col);
        if (!fromCandy) continue;
        for (var i = 0; i < 4; i++) {
          var direction = directions[i];
          var numCandiesCrushed = this.numberCandiesCrushedByMove(
            fromCandy,
            direction
          );
          if (numCandiesCrushed == 3) {
            validMovesThreeCrush.push({
              candy: fromCandy,
              direction: direction
            });
          } else if (numCandiesCrushed > 3) {
            validMovesMoreThanThreeCrush.push({
              candy: fromCandy,
              direction: direction
            });
          }
        }
      }
    }
    // if there are three-crushes possible, prioritize these
    var searchArray = validMovesThreeCrush.length
      ? validMovesThreeCrush
      : validMovesMoreThanThreeCrush;
    // If there are no valid moves, return null.
    if (searchArray.length == 0) return null;
    // select a random crush from among the crushes found
    return searchArray[Math.floor(Math.random() * searchArray.length)];
  };

  ////////////////////////////////////////////////
  // USEFUL FOR DEBUGGING
  //
  //

  /*
   *
   *  Specify a board configuration by passing in a boardSpec. The format
   *  of boardSpec is a list of strings, one sequence for each row. In each
   *  string, there must be boardSize characters, where each character should
   *  be the first letter of the color for that square. For example, a boardSpec
   *  that specifies an 8x8 board with alternating columns of red and orange would have
   *  a boardSpec of:
   *  ['rorororo',
   *  'rorororo',
   *  'rorororo',
   *  'rorororo',
   *  'rorororo',
   *  'rorororo',
   *  'rorororo',
   *  'rorororo']
   *
   */
  this.createSpecifiedBoard = function(boardSpec) {
    color_dict = {
      r: "red",
      o: "orange",
      y: "yellow",
      g: "green",
      b: "blue",
      p: "purple"
    };

    var numChars = 0;

    boardSpec.map(function(i) {
      return (numChars += i.length);
    });
    if (
      boardSpec.length != board.boardSize ||
      numChars != Math.pow(board.boardSize, 2)
    ) {
      console.warn(
        "boardSpec must be of dimensions boardSize x boardSize to populate board"
      );
      return;
    }

    for (var col = 0; col < board.boardSize; col++) {
      for (var row = 0; row < board.boardSize; row++) {
        if (board.getCandyAt(row, col) == null) {
          var color = color_dict[boardSpec[row].charAt(col)];
          board.addCandy(color, row, col);
        }
      }
    }
  };

  ////////////////////////////////////////////////
  // Private methods
  //
  // You likely do NOT need to call these methods
  //

  /*
   *  Helper method to rules.prepareNewGame
   *  Called when a new game is created. Fills all the empty positions on
   *  the board with random-colored candies.
   *
   */
  this.populateBoard = function() {
    for (var col = 0; col < board.boardSize; col++) {
      for (var row = 0; row < board.boardSize; row++) {
        // Check the empty candy position (hole), fill with new candy
        if (board.getCandyAt(row, col) == null) {
          board.addRandomCandy(row, col);
        }
      }
    }
  };

  /*
   *
   *  Helper method for rules.isMoveTypeValid
   *  Returns the number of candies that would be crushed if the candy
   *  provided by fromCandy were to be flipped in the direction
   *  specified (['up', 'down', 'left', 'right'])
   *
   *  If this move is not valid (based on the game rules), then 0 is returned
   *
   */
  this.numberCandiesCrushedByMove = function(fromCandy, direction) {
    return this.getCandiesToCrushGivenMove(fromCandy, direction).length;
  };

  /*
   *
   *  Helper method for rules.numberCandiesCrushedByMove
   *  Returns a list of candies that would be "crushed" (i.e. removed) if
   *  fromCandy were to be moved in the direction specified by direction (['up',
   *  'down', 'left', 'right'])
   *  If move would result in no crushed candies, an empty list is returned.
   *
   */
  this.getCandiesToCrushGivenMove = function(fromCandy, direction) {
    var toCandy = board.getCandyInDirection(fromCandy, direction);
    if (!toCandy || toCandy.color == fromCandy.color) {
      return [];
    }
    var swap = [fromCandy, toCandy];
    var crushable = this.getCandyCrushes(swap);
    // Only return crushable groups that involve the swapped candies.
    // If the board has incompletely-resolved crushes, there can be
    // many crushable candies that are not touching the swapped ones.
    var connected = crushable.filter(function(set) {
      for (var k = 0; k < swap.length; k++) {
        if (set.indexOf(swap[k]) >= 0) return true;
      }
      return false;
    });

    return [].concat.apply([], connected); //flatten nested lists
  };

  /*
   *
   *  Helper Method for rules.getCandyCrushes
   *  Returns a set of sets of all the same-color candy strips of length
   *  at least 3 on the board.  If 'vertical' is set to true, looks only for
   *  vertical strips; otherwise only horizontal ones. If the 'swap' array
   *  is passed, then every even-indexed candy in the array is considered
   *  swapped with every odd-indexed candy in the array.
   *
   */
  this.findColorStrips = function(vertical, swap) {
    var getAt = function(x, y) {
      // Retrieve the candy at a row and column (depending on vertical)
      var result = vertical ? board.getCandyAt(y, x) : board.getCandyAt(x, y);
      if (swap) {
        // If the result candy is in the 'swap' array, then swap the
        // result with its adjacent pair.
        var index = swap.indexOf(result);
        if (index >= 0) return swap[index ^ 1];
      }
      return result;
    };
    var result = [];
    for (var j = 0; j < board.boardSize; j++) {
      for (var h, k = 0; k < board.boardSize; k = h) {
        // Scan for rows of same-colored candy starting at k
        var firstCandy = getAt(j, k);
        h = k + 1;
        if (!firstCandy) continue;
        var candies = [firstCandy];
        for (; h < board.boardSize; h++) {
          var lastCandy = getAt(j, h);
          if (!lastCandy || lastCandy.color != firstCandy.color) break;
          candies.push(lastCandy);
        }
        // If there are at least 3 candies in a row, remember the set.
        if (candies.length >= 3) result.push(candies);
      }
    }
    return result;
  };
};

var DEBUG = true;
// By default, the first board loaded by your page will be the same
// each time you load (which is accomplished by "seeding" the random
// number generator. This makes testing (and grading!) easier!
import seedrandom from "seedrandom";
// import {Math} from "seedrandom";
import $ from "jQuery";

seedrandom(0);

// A short jQuery extension to read query parameters from the URL.
$.extend({
  getUrlVars: function() {
    var vars = [],
      pair;
    var pairs = window.location.search.substr(1).split("&");
    for (var i = 0; i < pairs.length; i++) {
      pair = pairs[i].split("=");
      vars.push(pair[0]);
      vars[pair[0]] =
        pair[1] && decodeURIComponent(pair[1].replace(/\+/g, " "));
    }
    return vars;
  },
  getUrlVar: function(name) {
    return $.getUrlVars()[name];
  }
});

// constants
var DEFAULT_BOARD_SIZE = 8;

// data model at global scope for easier debugging
var board;
var rules;

var dragDropInfo = null;

// initialize board
if (
  $.getUrlVar("size") &&
  $.getUrlVar("size") >= 3 &&
  $.getUrlVar("size") <= 20
) {
  board = new Board($.getUrlVar("size"));
} else {
  board = new Board(DEFAULT_BOARD_SIZE);
}

// load a rule
rules = new Rules(board);

// Final initialization entry point: the Javascript code inside this block
// runs at the end of start-up when the page has finished loading.
$(document).ready(function() {
  // Your code here.
  NewGame();

  if (DEBUG) {
    var div = document.createElement("div");
    $(div).attr("id", "DEBUG");
    $("body").append(div);
  }
});

/* Event Handlers */
// access the candy object with info.candy

// add a candy to the board
$(board).on("add", function(e, info) {
  // Your code here.

  var candy = info.candy;
  var img = document.createElement("img");

  $("#gameBoard").append(img);

  img.src = require("./" + candy.toString() + "-candy.png");

  $(img).data("candy", candy);
  $(img).attr("id", "candy-id-" + candy.id);

  $(img).attr("data-position", candy.col + "-" + candy.row);

  var candySize = 320 / board.boardSize;

  var top = candy.row * candySize;
  var left = candy.col * candySize;

  var startTop = 0 - (board.boardSize - top / candySize) * candySize;

  $(img).css({
    width: candySize,
    height: candySize,
    top: startTop,
    left: left
  });

  $(img).animate({ top: top }, function() {
    Crush();
  });
});

// move a candy on the board
$(board).on("move", function(e, info) {
  // Your code here.
  var img = document.getElementById("candy-id-" + info.candy.id);

  $(img).attr("data-position", info.toCol + "-" + info.toRow);

  var candySize = 320 / board.boardSize;

  var top = info.toRow * candySize;
  var left = info.toCol * candySize;

  $(img).animate({ top: top, left: left }, function() {
    Crush();
  });
});

// remove a candy from the board
$(board).on("remove", function(e, info) {
  // Your code here.
  var img = document.getElementById("candy-id-" + info.candy.id);

  //shrink in
  /*
	var candySize = 320/board.boardSize;
	var top = info.fromRow * candySize;
	var left = info.fromCol * candySize;
	
	$(img).animate({"width" : 0,
					"height" : 0,
					"top" : top + candySize/2,
					"left" : left + candySize/2}, function(){
						img.parentNode.removeChild(img);
					});
	*/

  //fade out
  $(img).animate({ opacity: 0 }, function() {
    img.parentNode.removeChild(img);
  });
});

// move a candy on the board
$(board).on("scoreUpdate", function(e, info) {
  // Your code here.
  var scoreLabel = document.getElementById("scoreLabel");

  $(scoreLabel).empty();
  $(scoreLabel).append(info.score + " points");

  if (info.candy != undefined) {
    $(scoreLabel).css("background-color", info.candy.color);

    if (info.candy.color == "yellow") {
      $(scoreLabel).css("color", "gray");
    } else {
      $(scoreLabel).css("color", "white");
    }
  } else {
    $(scoreLabel).css({ "background-color": "lightgrey", color: "black" });
  }
});

// Button Events
$(document).on("click", ".btn", function(evt) {
  var id = evt.target.id;

  if (id == "newGame") {
    if ($("img").is(":animated") == false) {
      ClearCanvas();
      NewGame();
    }
  } else if (id == "showMove") {
    if ($("img").is(":animated") == false) {
      ClearCanvas();
      DrawArrow();
    }
  }
});

// keyboard events arrive here
$(document).on("keydown", function(evt) {
  // Your code here.
  if (evt.originalEvent.key == "n") {
    ClearCanvas();
    NewGame();
  }
});

/*
$(document).on("touchstart", "#canvas", function(evt){
	var a = parseInt(evt.touches[0].clientX) - (parseInt(evt.target.offsetLeft) + parseInt(evt.target.offsetParent.offsetLeft));
	var b = parseInt(evt.touches[0].clientY) - (parseInt(evt.target.offsetTop) + parseInt(evt.target.offsetParent.offsetTop));
	
	if (DEBUG){
		console.log(evt);
		console.log(parseInt(evt.touches[0].clientX), "- (", parseInt(evt.target.offsetLeft), "+", parseInt(evt.target.offsetParent.offsetLeft), ") = ", a);
		console.log(parseInt(evt.target.offsetTop), "- (", parseInt(evt.target.offsetParent.offsetTop), "+", parseInt(evt.touches[0].clientY), ") = ", b);
	
		$("#DEBUG").empty();
		$("#DEBUG").append(" " + a + " " + b);
	}
});
*/

$(document).on("mousedown touchstart", "#canvas", function(evt) {
  //ClearCanvas();
  if ($("img").is(":animated") == false) {
    var candySize = 320 / board.boardSize;
    var xCoord, yCoord;

    if (evt.type == "mousedown") {
      xCoord = evt.offsetX;
      yCoord = evt.offsetY;
    } else {
      xCoord =
        parseInt(evt.touches[0].clientX) -
        (parseInt(evt.target.offsetLeft) +
          parseInt(evt.target.offsetParent.offsetLeft));
      yCoord =
        parseInt(evt.touches[0].clientY) -
        (parseInt(evt.target.offsetTop) +
          parseInt(evt.target.offsetParent.offsetTop));

      if (DEBUG) {
        console.log(evt);
        console.log(
          parseInt(evt.changedTouches[0].clientX),
          "- (",
          parseInt(evt.target.offsetLeft),
          "+",
          parseInt(evt.target.offsetParent.offsetLeft),
          ") = ",
          xCoord
        );
        console.log(
          parseInt(evt.changedTouches[0].clientY),
          "- (",
          parseInt(evt.target.offsetTop),
          "+",
          parseInt(evt.target.offsetParent.offsetTop),
          ") = ",
          yCoord
        );

        $("#DEBUG").empty();
        $("#DEBUG").append("s: " + xCoord + " " + yCoord);
      }
    }

    var col = Math.floor(xCoord / candySize);
    var row = Math.floor(yCoord / candySize);

    var img = document
      .querySelectorAll("[data-position='" + col + "-" + row + "']")
      .item(0);

    if (img != null) {
      $(img).css("z-index", 2);

      var top = parseInt($(img).css("top"));
      var left = parseInt($(img).css("left"));

      dragDropInfo = {
        candyImg: img,
        initCol: col,
        initRow: row,
        initTop: top,
        initLeft: left,
        initXCoord: xCoord,
        initYCoord: yCoord
      };
    }
  }
});

$(document).on("mousemove touchmove", "#canvas", function(evt) {
  if (dragDropInfo != null && $("img").is(":animated") == false) {
    var xCoord, yCoord;

    if (evt.type == "mousemove") {
      xCoord = evt.offsetX;
      yCoord = evt.offsetY;
    } else {
      if (DEBUG) {
        console.log(evt);
      }

      xCoord =
        parseInt(evt.touches[0].clientX) -
        (parseInt(evt.target.offsetLeft) +
          parseInt(evt.target.offsetParent.offsetLeft));
      yCoord =
        parseInt(evt.touches[0].clientY) -
        (parseInt(evt.target.offsetTop) +
          parseInt(evt.target.offsetParent.offsetTop));
    }

    //console.log(dragDropInfo.originalTop, dragDropInfo.originalLeft, (dragDropInfo.originalTop + evt.offsetX - dragDropInfo.mouseX), (dragDropInfo.originalLeft + evt.offsetY - dragDropInfo.mouseY));
    var top = dragDropInfo.initTop + yCoord - dragDropInfo.initYCoord;
    var left = dragDropInfo.initLeft + xCoord - dragDropInfo.initXCoord;

    $(dragDropInfo.candyImg).css({ top: top, left: left });
  }
});

$(document).on("mouseup touchend", function(evt) {
  if (dragDropInfo != null) {
    ClearCanvas();

    var candySize = 320 / board.boardSize;
    var xCoord, yCoord;

    if (evt.type == "mouseup") {
      xCoord = evt.offsetX;
      yCoord = evt.offsetY;
    } else {
      xCoord =
        parseInt(evt.changedTouches[0].clientX) -
        (parseInt(evt.target.offsetLeft) +
          parseInt(evt.target.offsetParent.offsetLeft));
      yCoord =
        parseInt(evt.changedTouches[0].clientY) -
        (parseInt(evt.target.offsetTop) +
          parseInt(evt.target.offsetParent.offsetTop));

      if (DEBUG) {
        console.log(evt);
        console.log(evt.changedTouches);

        console.log(
          parseInt(evt.changedTouches[0].clientX),
          "- (",
          parseInt(evt.target.offsetLeft),
          "+",
          parseInt(evt.target.offsetParent.offsetLeft),
          ") = ",
          xCoord
        );
        console.log(
          parseInt(evt.changedTouches[0].clientY),
          "- (",
          parseInt(evt.target.offsetTop),
          "+",
          parseInt(evt.target.offsetParent.offsetTop),
          ") = ",
          yCoord
        );

        $("#DEBUG").append(", e: " + xCoord + " " + yCoord);
      }
    }

    var col = Math.floor(xCoord / candySize);
    var row = Math.floor(yCoord / candySize);

    var candy = $(dragDropInfo.candyImg).data("candy");

    //up
    if (dragDropInfo.initCol == col && dragDropInfo.initRow - 1 == row) {
      if (rules.isMoveTypeValid(candy, "up")) {
        board.flipCandies(candy, board.getCandyInDirection(candy, "up"));
      }
    }
    //down
    else if (dragDropInfo.initCol == col && dragDropInfo.initRow + 1 == row) {
      if (rules.isMoveTypeValid(candy, "down")) {
        board.flipCandies(candy, board.getCandyInDirection(candy, "down"));
      }
    }
    //left
    else if (dragDropInfo.initCol - 1 == col && dragDropInfo.initRow == row) {
      if (rules.isMoveTypeValid(candy, "left")) {
        board.flipCandies(candy, board.getCandyInDirection(candy, "left"));
      }
    }
    //right
    else if (dragDropInfo.initCol + 1 == col && dragDropInfo.initRow == row) {
      if (rules.isMoveTypeValid(candy, "right")) {
        board.flipCandies(candy, board.getCandyInDirection(candy, "right"));
      }
    } //////////// //console.log(col, row);
    /*/////////////
		var candy = $(img).data("candy");
		//console.log(candy);
		if(rules.isMoveTypeValid(candy, direction)){
			if(DEBUG){
				console.log("valid move");
			}
			var candy2 = board.getCandyInDirection(candy, direction);
			board.flipCandies(candy, candy2);
		}
		/*/ $(
      dragDropInfo.candyImg
    ).css({
      "z-index": 1,
      top: dragDropInfo.initTop,
      left: dragDropInfo.initLeft
    });

    dragDropInfo = null;
  }
});

// Functions
function DrawArrow() {
  var validMove = rules.getRandomValidMove();

  var canvas = document.getElementById("canvas");
  var ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, 320, 320);

  var col = validMove.candy.col;
  var row = validMove.candy.row;

  var candySize = 320 / board.boardSize;
  var squareSize = candySize / 2;

  var x = (col + 1) * candySize - squareSize;
  var y = (row + 1) * candySize - squareSize;

  ctx.fillStyle = "#333333";

  ctx.beginPath();
  if (validMove.direction == "up") {
    ctx.fillRect(x - squareSize / 2, y - squareSize, squareSize, squareSize);

    ctx.moveTo(x - squareSize, y - squareSize + 1);
    ctx.lineTo(x, y - 2 * squareSize);
    ctx.lineTo(x + squareSize, y - squareSize + 1);
  } else if (validMove.direction == "down") {
    ctx.fillRect(x - squareSize / 2, y, squareSize, squareSize);

    ctx.moveTo(x + squareSize, y + squareSize - 1);
    ctx.lineTo(x, y + squareSize + squareSize);
    ctx.lineTo(x - squareSize, y + squareSize - 1);
  } else if (validMove.direction == "left") {
    ctx.fillRect(x - squareSize, y - squareSize / 2, squareSize, squareSize);

    ctx.moveTo(x - squareSize + 1, y - squareSize);
    ctx.lineTo(x - 2 * squareSize, y);
    ctx.lineTo(x - squareSize + 1, y + squareSize);
  } else if (validMove.direction == "right") {
    ctx.fillRect(x, y - squareSize / 2, squareSize, squareSize);

    ctx.moveTo(x + squareSize - 1, y + squareSize);
    ctx.lineTo(x + 2 * squareSize, y);
    ctx.lineTo(x + squareSize - 1, y - squareSize);
  }
  ctx.closePath();
  ctx.fill();
}

function ClearCanvas() {
  var canvas = document.getElementById("canvas");
  var ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, 320, 320);
}

function Crush() {
  /*
	if(rules.getCandyCrushes().length > 0){
		setTimeout(function(){
			rules.moveCandiesDown();
		}, 500);
	}
	*/

  setTimeout(function() {
    rules.moveCandiesDown();
  }, 500);

  rules.removeCrushes(rules.getCandyCrushes());
}

function NewGame() {
  board.clear();
  board.resetScore();
  rules.prepareNewGame();
}

/* Copyright (c) 2017 MIT 6.813/6.831 course staff, all rights reserved.
 * Redistribution of original or derived work requires permission of course staff.
 */

/**
 * This object represents a candy on the board. Candies have a row
 * and a column, and a color
 */
