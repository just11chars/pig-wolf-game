'use strict';

class Level {
  constructor(field, pig, wolves = []) {
    this.field = field;
    this.pig = pig;
    this.wolves = wolves;
    this.init();
  }

  init() {
    this.points = 0;
    // !!! add this.maxPoints = all carrots on the field
    for (let i = 0; i < this.wolves.length; ++i)
      this.wolves[i].addTrajectoryLayerToField(this.field);
  }

  _createStaticItemByName(name, doorPosition) {
    switch(name) {
      case 'empty': return new ItemEmpty(doorPosition); break;
      case 'wall': return new ItemWall(doorPosition); break;
      case 'food': return new ItemFood(doorPosition); break;
      case 'door': return new ItemDoor(doorPosition); break;
      case 'button': return new ItemButton(doorPosition); break;
    }
  }

  loadFromJSON(JSONString) {
    let lev = JSON.parse(JSONString);
    
    this.pig = new Pig(lev.pig._position);
    
    this.wolves = [];
    for (let i = 0; i < lev.wolves.length; ++i) {
      let curTraj = lev.wolves[i].trajectory;
      let curStep = curTraj._currentStep;
      this.wolves.push(new Wolf(curTraj._trajectory[curStep], curTraj._trajectory));
    }

    // read field
    this.field = new Field(lev.field.height, lev.field.width);
    for (let i = 0; i < lev.field.height; ++i)
      for (let j = 0; j < lev.field.width; ++j) {
        let curCell = lev.field.cells[i][j];
        let curBackground = curCell.layerBackground;

        let curStaticItems = [];
        for (let z = 0; z < curCell.staticItems.length; ++z) {
          let curItem = curCell.staticItems[z];
          curStaticItems.push({'itemName':curItem.name, 'doorPosition':curItem.doorPosition});
        }

        this.field.changeCell(Point(i, j), curBackground, curStaticItems);
      }
      
    this.init();
  }

  showJSON(fileName) {
    let lev = {
      'field': this.field,
      'pig': this.pig,
      'wolves': this.wolves,
    };

    let JSONString = JSON.stringify(lev);
    let textArea = document.createElement('textarea');
    textArea.id = 'JSONTextArea';
    textArea.appendChild(document.createTextNode(JSONString));
    textArea.setAttribute('rows', 100);
    textArea.setAttribute('cols', 100);

    document.body.appendChild(textArea);
    return JSONString;
    //output.write(JSON.stringify(level));
  }

  freezeWolves() {
    for (let i = 0; i < this.wolves.length; ++i)
      this.wolves[i].freeze();
  }

  defrostWolves() {
    for (let i = 0; i < this.wolves.length; ++i)
      this.wolves[i].defrost();
  }
}