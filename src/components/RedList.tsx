import { Button, Layout, notification, Table, Tabs } from 'antd';
import * as React from 'react';
import { Link } from 'react-router-dom';
import {
    loadExcel
 } from '../utils/Exce';

 interface IState {
     columns: any[],
     dataSource: any[]
     currentSheet: string|null,
     fileName: string|null
 }

class Redlist extends React.Component<{}, IState> {

    private formRef: HTMLFormElement | null;
    private inputRef: HTMLInputElement | null;
    private tabsRef: any;

    private sessionKey = '__redlist__';

    public constructor(props: any) {
        super(props);
        this.onButtonClick = this.onButtonClick.bind(this);
        this.onChange = this.onChange.bind(this);
        this.onRow = this.onRow.bind(this);
        this.onTabsChange = this.onTabsChange.bind(this);
        this.close = this.close.bind(this);

        this.state = {
            columns: [],
            currentSheet: null,
            dataSource: [],
            fileName: null
        };
    }

    public componentDidMount() {
        try {
            const data = window.sessionStorage.getItem(this.sessionKey);

            if (data != null) {
                const cache = JSON.parse(data);

                window.console.log(cache);

                this.setState({
                    columns: cache.columns,
                    dataSource: cache.dataSource
                });

                notification.success({
                    description: '已从您刚才关闭的文件中读取',
                    message: '读取成功'
                });
            }

        } catch (error) {
            window.console.log(error);
        }
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

        if (file != null) {
            this.setState({ fileName: file.name });
        }

        loadExcel(file).then((data: any) => this.setState(data));
    }

    public onRow(record: any) {
        return {
            onClick: (event: any) => this.onRowClick(record)
        }
    }

    public onRowClick(e: any) {
        window.console.log(e)
    }

    public rowKey(record: any): string {
        return (Math.random() * Math.random()).toString(2);
    }

    public onTabsChange(activeKey: any) {
        window.console.log(activeKey, this.state.currentSheet);
    }

    public close() {

        try {
            const data = {
                columns: this.state.columns,
                dataSource: this.state.dataSource
            };

            window.sessionStorage.setItem(this.sessionKey, JSON.stringify(data));
        } catch (exception) {
            window.console.log(exception)
        }

        this.setState({
            columns: [],
            currentSheet: null,
            dataSource: [],
            fileName: null
        });

        if (this.formRef != null) {
            this.formRef.reset();
        }
    }

    public render() {

        const columns = this.state.columns;
        const dataSource = this.state.dataSource;

        let i = 1;
        const views = [];

        for (const key in columns) {
            if (columns[key] != null) {
                views.push(<Tabs.TabPane tab={key} key={key}>
                    <Table
                    key={i++}
                    dataSource={ dataSource[key] }
                    columns={ columns[key] }
                    onRow= { this.onRow }
                    rowKey={ this.rowKey }/>
                </Tabs.TabPane>);
            }
        }

      const tabs = views.length > 0 ? (<Tabs ref={ r => this.tabsRef = r } tabPosition="top" onChange={this.onTabsChange} animated={true}>{views}</Tabs>) : null;
        const closer = views.length > 0
            ?
            <div style={{ position: 'fixed', right: 24, top: 24 }}><Button shape="circle" type="primary" size="small" onClick={this.close} icon="close" /></div>
            : null;

      return (<Layout className="App">
          <Layout.Content className="inner-container">
              <div style={{ display: this.state.dataSource.length === 0 ? 'block' : 'none' }}>
                  <Button type="primary" onClick={this.onButtonClick}>选择Excel文件</Button>
                  <Button style={{ marginLeft: '1em' }} type="primary"><Link to="/">返回</Link></Button>
                  <form ref={ r => this.formRef = r }><input style={{ display: 'none' }} ref={r => this.inputRef = r} type="file" onChange={this.onChange} /></form>
              </div>
              <div style={{ display: 'block' }}>
                  { tabs }
                  { closer }
              </div>
          </Layout.Content>
      </Layout>);
    }
}

export default Redlist;