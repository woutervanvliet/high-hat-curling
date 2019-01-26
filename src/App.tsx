import React, { Component } from 'react';
import './app.scss';
import {DataProvider} from "./data/data-provider";
import {
    BrowserRouter,
    Switch,
    Route, RouteProps, RouteComponentProps, Link,
} from 'react-router-dom'

const makeRenderRoute = (loader: any): React.ComponentType<RouteComponentProps> => {
    const LazyComponent = React.lazy(loader)

    return (props: RouteComponentProps) => {
        return <LazyComponent {...props.match.params} />
    }
}

const Tournaments = makeRenderRoute(() => import('./components/tournaments'))
const Tournament = makeRenderRoute(() => import('./components/tournament'))
const Player = makeRenderRoute(() => import('./components/player'))
const Round = makeRenderRoute(() => import('./components/round'))

class App extends Component {
  render() {
    return (
        <DataProvider>
            <BrowserRouter basename="/">
                <React.Suspense fallback="Please wait">
                    <Switch>
                        <Route exact={true} component={Player} path="/player/:playerId" />
                        <Route exact={true} component={Round} path="/:tournamentId/:roundId" />
                        <Route exact={true} component={Tournament} path="/:tournamentId" />
                        <Route path="/" exact={true} component={Tournaments} />
                        <Route render={() => <p>4-ooooh-4 <Link to="/">Home</Link></p>} />
                    </Switch>
                </React.Suspense>
            </BrowserRouter>
        </DataProvider>
    );
  }
}

export default App;
