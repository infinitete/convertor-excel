import * as React from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import * as XLSX from 'xlsx';
import './App.css';
import logo from './logo.svg';

class App extends React.Component {

  private workBook: XLSX.WorkBook;
  private sheetNames: string[] = [];

  public constructor(props: any) {
    super(props)
    this.onChange = this.onChange.bind(this);

    this.state = {
      sheetNames: [],
      sheetsData: null,
      workBook: null,
    }
  }

  public alert(message: string) {
    toast(message);
  }

  public onChange(e: any) {

    if (e.target == null || e.target.files.length === 0) {
      return;
    }

    if (e.target.files[0].name.match(/\.xls|\.xlsx|\.xlsm/ig) === null) {
      this.alert("请上传excel文件");
      return;
    }

    this.setState({sheetNames: []});

    const reader = new FileReader();
    reader.readAsArrayBuffer(e.target.files[0]);
    reader.onload = (a: any) => this.read(a.target.result);
  }

  public read(data: any) {

    try {
      this.workBook = XLSX.read(data, {type: 'array'});
    } catch (error) {
      this.alert("无法识别excel文件")
      return;
    }

    this.sheetNames=  this.workBook.SheetNames ? this.workBook.SheetNames : [];

    const sheetsDdata: any[] = [];

    this.workBook.SheetNames.forEach((sheetName) => {
      const formulae = XLSX.utils.sheet_to_json(this.workBook.Sheets[sheetName]);
      sheetsDdata[sheetName] = formulae;
		});

    this.setState({
      sheetNames: this.sheetNames,
      sheetsData: sheetsDdata,
      workBook: this.workBook,
    });
  }

  public render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">上传 Excel</h1>
        </header>
        <p className="App-intro"> <input type="file" onChange={ this.onChange } /></p>

        <div>
          { this.sheetNames.length > 0 &&  this.sheetNames.map((sheet, k) => (<p key={k}>{sheet}</p>)) }
        </div>

        <ToastContainer />
      </div>
    );
  }
}

export default App;
