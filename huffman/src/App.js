import React from "react";
import "./App.css";
import Tree from "react-d3-tree";
import "semantic-ui-css/semantic.min.css";
import { Button, Label, Step } from "semantic-ui-react";

var pixels = [];
var pixelsRGB = [];
class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      treeData: [],
      codes: {},
      active: "Imagem"
    };
  }

  jsonToArrayOfJson(inputJson) {
    // Turns JSON {a: 1, b: 2} into array [{a: 1}, {b: 2}]
    var array = [];
    for (var k in inputJson) {
      var auxJson = {};
      auxJson["frequency"] = inputJson[k];
      auxJson["name"] = k;
      array.push(auxJson);
    }
    return array;
  }

  sortByFrequency(a, b) {
    if (a.frequency < b.frequency) {
      return -1;
    } else if (a.frequency === b.frequency) {
      return 0;
    } else {
      return 1;
    }
  }

  countRepetitions(array) {
    var count = {};
    array.forEach(e => {
      count[e] = (count[e] || 0) + 1;
    });

    return count;
  }

  constructTree(frequencies) {
    while (frequencies.length > 1) {
      let leftNode = frequencies.shift();
      let rightNode = frequencies.shift();
      let newNode = {
        children: [leftNode, rightNode],
        name: null,
        frequency: leftNode.frequency + rightNode.frequency
      };
      frequencies.unshift(newNode);
      frequencies.sort(this.sortByFrequency);
    }
    return frequencies[0];
  }

  mountEncodedImage(imagePixels) {
    var encodedImage = "";
    imagePixels.forEach(i => {
      encodedImage += this.state.codes[i];
    });
    return encodedImage;
  }

  getCodes(tree, encodedImage, top, codes) {
    if (tree.children && tree.children.length >= 1) {
      encodedImage[top] = 0;
      this.getCodes(tree.children[0], encodedImage, top + 1, codes);
      encodedImage.pop();
    }
    if (tree.children && tree.children.length >= 2) {
      encodedImage[top] = 1;
      this.getCodes(tree.children[1], encodedImage, top + 1, codes);
      encodedImage.pop();
    }
    if (!tree.children) {
      codes[tree.name] = encodedImage.join("");
      //this.setState({codes:codes})
    }
    return codes;
  }

  fileUpload(file, name) {
    const reader = new FileReader();

    var canvas = document.createElement("canvas"),
      ctx = canvas.getContext("2d");

    reader.onloadend = e => {
      if (e.target.readyState === FileReader.DONE) {
        var content = e.target.result;

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

        pixels = myImageData.data;
        pixelsRGB = [];
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
        ctx.putImageData(myImageData, 0, 0);

        var repetitions = this.countRepetitions(pixelsRGB);
        var sortedDistribution = this.jsonToArrayOfJson(repetitions);
        sortedDistribution.sort(this.sortByFrequency);
        var treeObject = [this.constructTree(sortedDistribution)];

        var image = new Image();

        image.src = canvas.toDataURL();
        image.id = "image";
        document.getElementById("app").appendChild(image);
        window.location.href = "#image";
        var codes = {};
        this.setState({ treeData: treeObject }, () => {
          setTimeout(() => {
            this.setState({
              codes: this.getCodes(this.state.treeData[0], [], 0, codes)
            });
          }, 7000);
        });
      }
    };
    reader.readAsBinaryString(file);
  }

  componentDidUpdate(prevState, prevProps) {
    if (prevProps.active !== this.state.active && prevProps.active === "Imagem") {
      const dimensions = this.treeContainer.getBoundingClientRect();
      this.setState({
        translate: {
          x: dimensions.width / 2,
          y: dimensions.height / 2
        }
      });
    }
  }

  handleClick = (e, { title }) => this.setState({ active: title });
  render() {
    const { active } = this.state;
    var encodedImage;
    if (Object.keys(this.state.codes).length) {
      encodedImage = this.mountEncodedImage(pixelsRGB);
    }
    return (
      <div className="App">
        <Step.Group style={{ marginTop: "3%" }}>
          <Step
            active={active === "Imagem"}
            icon="image"
            link
            onClick={this.handleClick}
            title="Imagem"
            description="Selecione uma imagem para ser codificada"
          />
          <Step
            active={active === "Árvore"}
            disabled={this.state.treeData.length === 0 || !this.treeContainer}
            icon="tree"
            link
            onClick={this.handleClick}
            title="Árvore"
            description="Mostrar árvore de Huffman"
          />
        </Step.Group>
        {this.state.active === "Imagem" && (
          <div id="app" className="App-header">
            <Label as="label" basic htmlFor="upload" style={{ margin: "10%" }}>
              <Button
                icon="upload"
                label={{
                  basic: true,
                  content: "Selecione uma imagem no formato .ppm"
                }}
                labelPosition="right"
              />
              <input
                hidden
                id="upload"
                multiple
                onChange={e => this.fileUpload(e.target.files[0], "ola")}
                type="file"
              />
            </Label>
          </div>
        )}
        {(
          <div
            id="treeWrapper"
            style={{ width: "100%", height: "100%", marginTop: "10%", display: (this.state.active === "Imagem" ? 'none': 'block') }}
            ref={tc => (this.treeContainer = tc)}
          >
          {Object.keys(this.state.codes).length > 0 && (
            <div>
              <h4 style={{color: 'black'}}>Encoded Image</h4>
              <p style={{ color: "black" }}>
                {encodedImage.slice(0, 10) + "..." + encodedImage.slice(encodedImage.length - 10, encodedImage.length)}
              </p>
            </div>
          )}
            {this.state.treeData.length > 0 && (
              <Tree
                zoom={0}
                orientation="vertical"
                data={this.state.treeData}
                translate={this.state.translate}
                transitionDuration={0}
              />
            )}
          </div>
        )}
      </div>
    );
  }
}

export default App;
