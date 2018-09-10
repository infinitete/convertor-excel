import { Button, Divider ,Layout, message, Table } from 'antd';
import * as React from 'react';
import * as XLSX from 'xlsx';
import './App.css';

interface IappState {
      dataSource: any[],
      definition: any[],
      sheetNames: any[],
      sheetsData: any,
      workBook: any,
}

class App extends React.Component<{}, IappState> {

  private inputRef: any;
  private workBook: XLSX.WorkBook;
  private sheetNames: string[] = [];

  public constructor(props: any) {
    super(props)
    this.onButtonClick = this.onButtonClick.bind(this);
    this.onChange = this.onChange.bind(this);

    this.state = {
      dataSource: [],
      definition: [],
      sheetNames: [],
      sheetsData: null,
      workBook: null,
    }
  }

  public alert(msg: string) {
    message.error(msg);
  }

  public onChange(e: any) {

    if (e.target == null || e.target.files.length === 0) {
      return;
    }

    if (e.target.files[0].name.match(/\.xls|\.xlsx|\.xlsm/ig) === null) {
      this.alert("请上传excel文件");
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

    window.console.log(sheetsDdata[this.workBook.SheetNames[0]][0]);

    const definition: object[] = [] ;

    for (const k in sheetsDdata[this.workBook.SheetNames[0]][0]) {
      if (sheetsDdata[this.workBook.SheetNames[0]][0].hasOwnProperty(k)) {

        const v = sheetsDdata[this.workBook.SheetNames[0]][0][k];
        const a: object = {};

        Object.defineProperties(a, {
          'dataIndex': {
            enumerable: true,
            value: k
          },
          'key': {
            enumerable: true,
            value: k
          },
          'title': {
            enumerable: true,
            value: v
          }
        });

        definition.push(a);
      }
    }

    sheetsDdata[this.workBook.SheetNames[0]].forEach((e: any, i: any) => {
      e.key = i;
    });

    window.console.log(definition[0]);

    this.setState({
      dataSource: sheetsDdata[this.workBook.SheetNames[0]].slice(1),
      definition,
      sheetNames: this.sheetNames,
      sheetsData: sheetsDdata,
      workBook: this.workBook,
    });
  }

  public onButtonClick() {
    this.inputRef.click()
  }

  public componentDidCatch(e: any) {
    window.console.log(e);
  }

  public render() {

    return (
      <Layout className="App">
        <Layout.Content className="inner-container">
          <header className="App-header">
            <h1 className="App-title">上传 Excel</h1>
          </header>
          <div>
            <Button type="primary" onClick={this.onButtonClick}>选择Excel文件</Button>
            <input style={{ display: 'none' }} ref={r => this.inputRef = r} type="file" onChange={this.onChange} />
          </div>
          <Divider dashed={true} />

          <Table dataSource={ this.state.dataSource } columns={ this.state.definition } rowKey='key'/>
        </Layout.Content>
      </Layout>
    );
  }
}

export default App;
