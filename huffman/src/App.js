import React from "react";
import "./App.css";
import Tree from 'react-d3-tree';


class App extends React.Component {

  constructor(props){
    super(props);
    this.state = {
      treeData: []
    }
  }

  jsonToArrayOfJson(inputJson){
    // Turns JSON {a: 1, b: 2} into array [{a: 1}, {b: 2}]
    var array = [];
    for(var k in inputJson){
      var auxJson = {};
      auxJson['frequency'] = inputJson[k];
      auxJson['name'] = k;
      array.push(auxJson);
    }
    return array;
  }

  sortByFrequency(a, b){
    if(a.frequency < b.frequency){
      return -1;
    }else if(a.frequency === b.frequency){
      return 0;
    }else{
      return 1;
    }
  }

  countRepetitions(array){
    var count = {};
    array.forEach((e) => {count[e] = (count[e] || 0)+1});

    return count;
  }

  constructTree(frequencies) {
    while (frequencies.length > 1) {
      let leftNode = frequencies.shift();
      let rightNode = frequencies.shift();
      let newNode = {
        children: [
          leftNode,
          rightNode,
        ],
        name: null,
        frequency: leftNode.frequency + rightNode.frequency
      }
      frequencies.unshift(newNode);
      frequencies.sort(this.sortByFrequency);
    }
    return frequencies[0];
  }

  fileUpload(file, name) {
    const reader = new FileReader();

    var canvas = document.createElement("canvas"),
      ctx = canvas.getContext("2d");
    reader.onloadend = e => {
      if (e.target.readyState === FileReader.DONE) {
        var content = e.target.result;

        console.log(content.length);
        var regex = /P6\n\d* \d*\n\d*\n([\s\S]*)/;
        var imageContent = regex.exec(content)[1];
        var height = parseInt(
          content
            .split("\n")
            .slice(1, 2)[0]
            .split(" ")[0]
        );
        var width = parseInt(
          content
            .split("\n")
            .slice(1, 2)[0]
            .split(" ")[1]
        );
        canvas.width = width;
        canvas.height = height;
        var myImageData = ctx.createImageData(height, width);

        var pixels = myImageData.data;
        var pixelsRGB = []
        console.log(imageContent.length);
        console.log(height, width);
        var j = 0;
        for (let i = 0; i < pixels.length; i += 4) {
          pixels[i] = imageContent.charCodeAt(j);
          pixels[i + 1] = imageContent.charCodeAt(j + 1);
          pixels[i + 2] = imageContent.charCodeAt(j + 2);
          pixels[i + 3] = 255;

          pixelsRGB.push(imageContent.charCodeAt(j));
          pixelsRGB.push(imageContent.charCodeAt(j + 1));
          pixelsRGB.push(imageContent.charCodeAt(j + 2));
          j += 3;
        }
        console.log(pixels);
        ctx.putImageData(myImageData, 0, 0);

        var repetitions = this.countRepetitions(pixelsRGB);
        var sortedDistribution = this.jsonToArrayOfJson(repetitions);
        sortedDistribution.sort(this.sortByFrequency);
        var treeObject = this.constructTree(sortedDistribution);

        this.setState({treeData: [treeObject]});
        var image = new Image();

        image.src = canvas.toDataURL();
        document.body.appendChild(image);
      }
    };
    reader.readAsBinaryString(file);
  }

  render() {
    console.log(this.state);
    return (
      <div className="App">
        <header className="App-header">
          <input
            type="file"
            onChange={e => this.fileUpload(e.target.files[0], "ola")}
          />
        </header>
        <div id="treeWrapper" style={{width: '50em', height: '20em'}}>
          {this.state.treeData.length && (<Tree data={this.state.treeData} />)}
        </div>
      </div>
    );
  }
}

export default App;
