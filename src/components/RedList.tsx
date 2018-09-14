import { Button, Layout, notification, Table, Tabs } from 'antd';
import * as hasha from 'hasha';
import * as React from 'react';
import { Link } from 'react-router-dom';
import {
    loadExcel
 } from '../utils/Exce';
import { host, name, password } from '../utils/settings';

 interface IState {
     columns: any[],
     dataSource: any[]
     currentSheet: string|null,
     fileName: string|null,
     token: string | null
 }

// interface IForm {
//     creditCode: string,
//     detail: string,
//     enterpriseDomain: string
//     enterpriseName: string
//     joinTime: string
//     type: string
// }

const MappedFormField = {
    creditCode: '注册号',
    detail: '内容',
    enterpriseDomain: '经营范围',
    enterpriseName: '企业名称',
    joinTime: '创建为诚信主体时间',
    type: '榜单类型'
};

class Redlist extends React.Component<{}, IState> {

    private formRef: HTMLFormElement | null;
    private inputRef: HTMLInputElement | null;
    private tabsRef: any;

    private sessionKey = '__redlist__';

    public constructor(props: any) {
        super(props);
        this.onButtonClick = this.onButtonClick.bind(this);
        this.onChange = this.onChange.bind(this);
        this.onTabsChange = this.onTabsChange.bind(this);
        this.close = this.close.bind(this);
        this.actions = this.actions.bind(this);
        this.onWindowRefresh = this.onWindowRefresh.bind(this);

        this.state = {
            columns: [],
            currentSheet: null,
            dataSource: [],
            fileName: null,
            token: null
        };
    }

    public componentDidMount() {

        // 从缓存读取
        try {
            const data = window.sessionStorage.getItem(this.sessionKey);

            if (data != null) {
                const cache = JSON.parse(data);

                for (const sheet in cache.columns) {


                    if (cache.columns.hasOwnProperty(sheet)) {
                        cache.columns[sheet].pop()
                        cache.columns[sheet].push({
                            key: `action`,
                            render: (_: any, record: any) => <a href="javascript:;" key={`${(Math.random()).toString(2)}`} onClick={ this.actions.bind(this, record) }>保存</a>,
                            title: '操作',
                        });
                    }
                }

                this.setState({
                    columns: cache.columns,
                    currentSheet: cache.currentSheet,
                    dataSource: cache.dataSource
                });

                window.console.log(cache.columns, cache.currentSheet, cache.dataSource);

                notification.success({
                    description: '已从您刚才关闭的文件中读取',
                    message: '读取成功'
                });
            }

        } catch (error) {
            window.console.log(error);
        }

        // 在页面刷新前保留当前页面状态
        window.addEventListener('unload', this.onWindowRefresh);
    }

    public onWindowRefresh() {
        this.close();
        window.removeEventListener('unload', this.onWindowRefresh);
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

        loadExcel(file).then((data: any) => {

            let i = 0;

            for (const sheet in data.columns) {
                if (data.columns.hasOwnProperty(sheet)) {

                    if (i++ === 0) {
                        data.currentSheet = sheet;
                    }
                    data.columns[sheet].push({
                        key: `action`,
                        render: (_: any, record: any) => <a href="javascript:;" onClick={ this.actions.bind(this, record) }>保存</a>,
                        title: '操作',
                    });
                }
            }

            this.setState(data)
        });
    }

    /**
     * 保存操作
     *
     * @param record 行数据
     */
    public async actions(record: any) {

        const cacheKey = hasha(JSON.stringify(record), {algorithm: 'sha256'});

        if (window.localStorage.getItem(cacheKey)) {
            notification.warning({
                description: '这条记录已经保存过了',
                message: '提示'
            });
            return;
        }

        // 登录
        const token = await this.login();

        // 提交数据
        this.setState({token: token.toString()}, () => this.post(record));
    }

    public async login() {

        const request = new Request(`${host}/auth/login`, {
            body: JSON.stringify({name, password}),
            headers: {
                'content-type': 'application/json'
            },
            method: 'POST',
        });

        return new Promise((resolve, reject) => {
            fetch(request).then(response => {
                if (response.ok) {
                    return response.json();
                }

                throw new Error(response.statusText);
            }).then(json => {
                if (json.code.toString() === '2000') {
                    return resolve(json.obj);
                }

                window.console.log(json.message);

                reject("登录失败");
            }).catch(error => {
                notification.error({
                    description: error.toString(),
                    message: '登录失败'
                });
                reject(error);
            });
        });
    }

    public post(record: any) {

        const sheet  = this.state.currentSheet;
        if (sheet === null) {
            return;
        }

        const cacheKey = hasha(JSON.stringify(record), {algorithm: 'sha256'});

        const data = {};
        const column = this.state.columns[sheet];
        const map = {};

        column.map((c: any) => {
            for(const key in MappedFormField) {
                if (MappedFormField.hasOwnProperty(key)) {
                    if (MappedFormField[key] === c.title) {
                        window.console.log(c.dataIndex);
                        map[c.dataIndex] = key;
                    }
                }
            }
        });

        window.console.log(map);

        for(const k in record) {
            if (record.hasOwnProperty(k) && map[k] != null) {
                Object.defineProperty(data, map[k], {
                    enumerable: true,
                    value: record[k]
                })
            }
        }

        Object.defineProperty(data, 'detail', {
            enumerable: true,
            value: JSON.stringify(record)
        });

        Object.defineProperty(data, 'type', {
            enumerable: true,
            value: '1'
        });

        const token: string = this.state.token ? this.state.token : '';
        const request = new Request(`${host}/redBlackList`, {
            body: JSON.stringify(data),
            headers: {
                'content-type': 'application/json;utf-8',
                token
            },
            method: 'POST',
            mode: 'cors'
        });

        fetch(request).then(response => {
            if (response.ok) {
                return response.json();
            }

            throw new Error("数据提交失败");
        }).then(json => {
            if (json.code.toString() === "2000") {

                window.localStorage.setItem(cacheKey, JSON.stringify(record));

                return notification.success({
                    description: "提交成功",
                    message: "提交成功",
                    placement: 'topLeft'
                })
            }

            throw new Error(json.toString());
        }).catch(error =>{ window.console.log(error) })
    }

    public rowKey(record: any): string {
        return (Math.random() * Math.random()).toString(2);
    }

    public onTabsChange(activeKey: any) {
        this.setState({ currentSheet: activeKey });
    }

    public close() {

        if (this.state.columns.length === 0) {
            return;
        }

        try {
            const data = {
                columns: this.state.columns,
                currentSheet: this.state.currentSheet,
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
                    rowKey={ this.rowKey }/>
                </Tabs.TabPane>);
            }
        }

        const defaultActiveKey = this.state.currentSheet ? this.state.currentSheet : undefined;

      const tabs = views.length > 0 ? (<Tabs ref={ r => this.tabsRef = r } defaultActiveKey={ defaultActiveKey } tabPosition="top" onChange={this.onTabsChange} animated={true}>{views}</Tabs>) : null;
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