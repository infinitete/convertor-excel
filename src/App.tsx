import * as React from 'react';
import * as XLSX from 'xlsx';
import './App.css';

import logo from './logo.svg';

class App extends React.Component {

  private workBook: XLSX.WorkBook;
  private sheetNames: string[];

  public constructor(props: any) {
    super(props)
    this.onChange = this.onChange.bind(this);

    this.state = {
      sheetNames: [],
      workBook: null
    }
  }

  public onChange(e: any) {

    if (e.target == null || e.target.files.length === 0) {
      return;
    }

    this.setState({ sheetNames: []});

    const reader = new FileReader();
    reader.readAsBinaryString(e.target.files[0]);

    window.console.log(e.target.files[0].type);

    reader.onload = (a: any) => this.read(a.target.result);
  }

  public read(data: any) {

    try {
      this.workBook = XLSX.read(data, { type: 'binary' });
    } catch (error) {
      window.console.error(error)
      window.alert("无法识别excel文件")
      return;
    }

    this.sheetNames=  this.workBook.SheetNames ? this.workBook.SheetNames : [];

    this.setState({
      sheetNames: this.sheetNames,
      workBook: this.workBook
    });
  }

  public render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">上传 Excel</h1>
        </header>
        <p className="App-intro"> <input type="file" accept="application/vnd.ms-excel" onChange={ this.onChange } /></p>

        <div>
          { this.sheetNames.map((sheet, k) => (<p key={k}>{sheet}</p>)) }
        </div>
      </div>
    );
  }
}

export default App;
