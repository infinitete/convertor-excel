import { Button, Divider, Layout, notification, Table, Tabs } from 'antd';
import * as React from 'react';
import { Link } from 'react-router-dom';
import {
    loadExcel
 } from '../utils/Exce';

 interface IState {
     columns: any[],
     dataSource: any[]
 }

class Redlist extends React.Component<{}, IState> {

    private inputRef: HTMLInputElement | null;

    public constructor(props: any) {
        super(props);
        this.onButtonClick = this.onButtonClick.bind(this);
        this.onChange = this.onChange.bind(this);

        this.state = {
            columns: [],
            dataSource: []
        };
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

        loadExcel(file).then((data: any) => this.setState(data) );
    }

    public render() {
 
        const columns = this.state.columns;
        const dataSource = this.state.dataSource;

        let i = 1;
        const views = [];

        for (const key in columns) {
            if (columns[key] != null) {
                window.console.log(columns[key])
                views.push(<Tabs.TabPane tab={key} key={i}>
                    <Table key={i} dataSource={ dataSource[key] } columns={ columns[key] } />
                </Tabs.TabPane>);

                i++;
            }
        }

      return (<Layout className="App">
        <Layout.Content className="inner-container">
          <div>
            <Button type="primary" onClick={this.onButtonClick}>选择Excel文件</Button>
            <Button style={{ marginLeft: '1em' }} type="primary"><Link to="/">返回</Link></Button>
            <input style={{ display: 'none' }} ref={r => this.inputRef = r} type="file" onChange={this.onChange} />
          </div>
          <Divider dashed={true} />
          <Tabs defaultActiveKey="1" tabPosition="bottom">{views}</Tabs>
        </Layout.Content>
      </Layout>);
    }
}

export default Redlist;