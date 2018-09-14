import * as React from 'react';
import { HashRouter, Route } from 'react-router-dom';
import Discred from './Discred';
import Navigator from './Navigator';
import Redlist from './RedList';

class Index extends React.Component {

    public render() {
        return <HashRouter>
            <div>
                <Route path="/" exact={true}  component={ Navigator } />
                <Route path="/redlist" component={ Redlist } />
                <Route path="/discred" component={ Discred } />
            </div>
        </HashRouter>
    }

}


export default Index;