'use strict';

function Point(i, j) {
  return { row: i, col: j };  
}

const directionToShift = {
  '': Point(0, 0),
  'stay': Point(0, 0),
  'up': Point(-1, 0),
  'down': Point(1, 0),
  'left': Point(0, -1),
  'right': Point(0, 1),
};

class Direction {
  constructor(direction) {
    this.direction = direction;
    this.shift = directionToShift[direction];
  }

  nextPoint(point) {
    return Point(point.row + this.shift.row, point.col + this.shift.col);  
  }
}

function keyToDirection(keyCode) {
  let ans = '';
  switch (keyCode) {
    case 87: ans = 'up'; break;
    case 83: ans = 'down'; break;
    case 65: ans = 'left'; break;
    case 68: ans = 'right'; break;
    case 32: ans = 'stay'; break;
  }
  
  return new Direction(ans);
}

function incrementPoints() {
  ++globalPoints;
  document.getElementById('points-output').innerHTML = globalPoints;
}

function incrementSteps() {
  ++globalSteps;
  document.getElementById('steps-output').innerHTML = globalSteps;
}

function pointsDistance(p1, p2) {
  return Math.max(Math.abs(p1.row - p2.row),
    Math.abs(p1.col - p2.col));
}

function scoreFormula() {
  //hyperbola
  return Math.floor((currentLevel.maxPoints / (currentLevel.maxPoints - globalPoints + 1)) *
    9.354 * globalPoints + (currentLevel.field.width * currentLevel.field.height / globalSteps) * globalPoints);
}

function submitResult(score) {
  if (score > TopUserScore) {
    TopUserScore = score;
    let db = new DB();
    db.setData(Username, TopUserScore, Uid);
    $("#topScore").text(TopUserScore);
  }
}

function loseCheck() {
  for (let i = 0; i < currentLevel.wolves.length; ++i) {
    let prevPig = currentLevel.pig.prevPosition();
    let curPig = currentLevel.pig.position();

    let prevWolf = currentLevel.wolves[i].prevPosition();
    let curWolf = currentLevel.wolves[i].position();

    if (pointsDistance(curPig, curWolf) == 0 ||
      pointsDistance(prevPig, curWolf) == 0 && pointsDistance(curPig, prevWolf) == 0)
    {
      $("#gameDiv").hide();
      $(".centerDiv").show();
      $("#win").hide();
      $("#scoreDiv").show();

      globalPoints = parseInt(document.getElementById("points-output").innerText);
      globalSteps  = parseInt(document.getElementById("steps-output").innerText);

      let score = scoreFormula() + ResultScore;
      submitResult(score);
      $(".userScore").text(score);
      if (Username !== "" && UserResultID !== "-1") {
        document.getElementById("Username").value = Username;
      }
      ResultScore = 0;
      // user can't move further and earn points
      document.onkeydown = {};
      return true;
    }
  }

  return false;
}

function winCheck() {
  if (globalPoints === Carrots) {
    $("#gameDiv").hide();
    $(".centerDiv").show();
    $("#scoreDiv").hide();
    $("#win").show();

    // cause it is lose-div
    // $("scoreDiv").hide();

    globalPoints = parseInt(document.getElementById("points-output").innerText);
    globalSteps  = parseInt(document.getElementById("steps-output").innerText);

    ResultScore += scoreFormula();
    submitResult(ResultScore);
    $(".userScore").text(ResultScore);
    // user can't move further and earn points
    document.onkeydown = {};
  }
}

function winLoseCheck() {
  if (!loseCheck())
    winCheck();
}

function alertPoint(point) {
  // alert('(' + point.row + ', ' + point.col + ')');
}

let di = [1, -1, 0, 0, 1, 1, -1, -1];
let dj = [0, 0, -1, 1, 1, -1, 1, -1];

// return points in bfs-order
function getPointsFromRange(point, range) {
  let ans = [];
  let que = [point], index = 0;
  let used = {};
  used[JSON.stringify(point)] = true;

  while (index < que.length) {
    let cur = que[index++];
    ans.push(cur);

    for (let z = 0; z < 8; ++z) {
      let child = Point(cur.row + di[z], cur.col + dj[z]);
      if (!used[JSON.stringify(child)] && pointsDistance(point, child) <= range && currentLevel.field.inBounds(child)) {
        used[JSON.stringify(child)] = true;
        que.push(child);
      } 
    }
  }

  return ans;
}

function equalPoints(a, b) {
  return JSON.stringify(a) == JSON.stringify(b);
}

function pointsDiff(a, b) {
  return Point(a.row - b.row, a.col - b.col);
}