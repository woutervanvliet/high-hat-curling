import React, { Component, Suspense } from 'react';
import './app.scss';
import {DataProvider} from "./data/data-provider";
import {
    BrowserRouter,
    Switch,
    Route, RouteProps, RouteComponentProps, Link,
} from 'react-router-dom'
import {Store, ValidAction} from "./data/data";

const makeRenderRoute = (loader: any): React.ComponentType<RouteComponentProps> => {
    const LazyComponent = React.lazy(loader)

    return (props: RouteComponentProps) => {
        return <LazyComponent {...props.match.params} />
    }
}

const Tournaments = makeRenderRoute(() => import('./components/tournaments'))
const Tournament = makeRenderRoute(() => import('./components/tournament'))
const Player = makeRenderRoute(() => import('./components/player'))
const Round = makeRenderRoute(async () => {
    return import('./components/round');
})

function Spinner() {
    return <b>Spin spin</b>
}

function onDispatch (action: ValidAction) {
    const body = JSON.stringify(action)

    fetch('/api/reduce', {
        body,
        method: 'POST',
        headers: {
            'Content-type': 'application/json',
            'Accept': 'application/json',
        }
    })
        .then((response) => response.json())
        .then(({ ok }) => {
            console.log({ ok })
        })
        .catch((error) => {
            console.error(error)
        })
}

async function loadData(): Promise<Store> {
    const response = await fetch('/api/state', {
        headers: {
            'Content-type': 'application/json',
            'Accept': 'application/json',
        }
    })

    return response.json()
}

class App extends Component {
  render() {
    return (
        <Suspense fallback={<p>Loading...</p>}>
            <DataProvider onDispatch={onDispatch} getInitialState={loadData}>
                <BrowserRouter basename="/">
                    <React.Suspense fallback={<Spinner />}>
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
        </Suspense>
    );
  }
}

export default App;
