import React from 'react';
import './App.css';

function  fileUpload(file, name) {
    //const { sendMessage } = this.props;
    //this.setState({ fileName: file.name });
    //const formData = new FormData();
    //formData.append("file", name);
    const reader = new FileReader();
    //const scope = this;

    reader.onload = e => {
      var content = e.target.result;
      console.log(content)
      var pixels = [];
      var regex = /P6\n\d* \d*\n\d*\n(.*)/
      var imageContent = regex.exec(content)[1]
      var height = parseInt(content.split("\n").slice(1,2)[0].split(" ")[0]);
      var width = parseInt(content.split("\n").slice(1,2)[0].split(" ")[1]);
      console.log('ii', imageContent)
      for(let i = 0; i < height*3; i += 1){
        let aux = [];
        let count = 0;
        for(let j = 0; j < width*3; j += 1){
          aux.push(imageContent.charCodeAt(i*height + j))
          count++;
          if(count === 3){
            pixels.push(aux);
            aux = []
            count = 0;
          }
        }
      }
      console.log(pixels)
    }
    reader.readAsBinaryString(file);

  }
function App() {
  return (
    <div className="App">
      <header className="App-header">
        <input
            type="file"
            onChange={e => fileUpload(e.target.files[0], 'ola')}
          />

      </header>
    </div>
  );
}

export default App;
