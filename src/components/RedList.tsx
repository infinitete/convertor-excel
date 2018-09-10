import { Button, Divider, Layout, notification } from 'antd';
import * as React from 'react';
import { Link } from 'react-router-dom';
import {
    loadExcel
 } from '../utils/Exce';

class Redlist extends React.Component {

    private inputRef: HTMLInputElement | null;

    public constructor(props: any) {
        super(props);
        this.onButtonClick = this.onButtonClick.bind(this);
    }

    public onButtonClick() {
        if (this.inputRef == null) {
            return;
        }

        this.inputRef.click();
    }

    public onChange(e: React.ChangeEvent<HTMLInputElement>) {

        const target = e.target;

        if (target.files && target.files.length === 0) {
            return;
        }

        const file: File | null = target.files && target.files[0];

        if (file && file.name.match(/\.xls|\.xlsx|\.xlsm/ig) == null) {
            notification.error({
                description: "请上传excel文件",
                message: "错误"
            });

            return;
        }

        loadExcel(file)
        .then((data: any) => {
            window.console.log(data)
        });
    }

    public render() {

      return (<Layout className="App">
        <Layout.Content className="inner-container">
          <div>
            <Button type="primary" onClick={this.onButtonClick}>选择Excel文件</Button>
            <Button style={{ marginLeft: '1em' }} type="primary"><Link to="/">返回</Link></Button>
            <input style={{ display: 'none' }} ref={r => this.inputRef = r} type="file" onChange={this.onChange} />
          </div>
          <Divider dashed={true} />
        </Layout.Content>
      </Layout>);
    }
}

export default Redlist;