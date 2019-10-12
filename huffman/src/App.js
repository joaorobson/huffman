import React from "react";
import "./App.css";

function fileUpload(file, name) {
  const reader = new FileReader();

  var canvas = document.createElement("canvas"),
    ctx = canvas.getContext("2d");
  reader.onloadend = e => {
    if (e.target.readyState == FileReader.DONE) {
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
      console.log(imageContent.length);
      var j = 0;
      for (let i = 0; i < pixels.length; i += 4) {
        pixels[i] = imageContent.charCodeAt(j);
        pixels[i + 1] = imageContent.charCodeAt(j + 1);
        pixels[i + 2] = imageContent.charCodeAt(j + 2);
        pixels[i + 3] = 255;
        j += 3;
      }
      console.log(pixels);
      ctx.putImageData(myImageData, 0, 0);

      var image = new Image();

      image.src = canvas.toDataURL();
      document.body.appendChild(image);
    }
  };
  reader.readAsBinaryString(file);
}
function App() {
  return (
    <div className="App">
      <header className="App-header">
        <input
          type="file"
          onChange={e => fileUpload(e.target.files[0], "ola")}
        />
      </header>
    </div>
  );
}

export default App;
