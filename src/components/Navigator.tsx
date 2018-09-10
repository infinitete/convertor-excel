import { Button } from 'antd';
import * as React from 'react';
import { Link } from 'react-router-dom';

class Navigator extends React.Component {
    public render() {

        return <div className="navigator">
            <Button className="nav-button" size="large" type="primary"><Link to="/redlist">红名单</Link></Button>
            <Button className="nav-button" size="large" type="primary"><Link to="/">失信被执行人</Link></Button>
        </div>
    }
}


export default Navigator;