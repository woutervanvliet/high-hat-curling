import React, {Component, Suspense, useEffect, useState} from 'react';
import './app.scss';
import {DataProvider, useAction, useDispatch} from "./data/data-provider";
import io from 'socket.io-client'

const senderId = Math.random().toString(16).split('.')[1]

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

function onDispatch (action: ValidAction & { serverTime?: number }) {
    if (action.serverTime) {
        // don't re-process server actions
        return
    }
    const body = JSON.stringify({
        ...action,
        senderId,
    })

    fetch('/api/reduce', {
        body,
        method: 'POST',
        headers: {
            'Content-type': 'application/json',
            'Accept': 'application/json',
        }
    })
        .then((response) => response.json())
        .then(({ ok, error }) => {
            if (!ok) {
                throw new Error(error || 'That was hardly ok')
            }
        })
        .catch((error) => {
            console.error(error)
        })
}

const filter = (action: ValidAction & { senderId?: string }) => {
    return !action.senderId || action.senderId !== senderId;

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

function Listener(props: { children: any, path: string }) {
    const dispatch = useDispatch()
    const [connected, setConnected] = useState(false)

    useEffect(() => {
        const socket = io(props.path, {
            autoConnect: false,
            reconnection: true,
        })
        socket.on('dispatch', (event: ValidAction & { serverTime: number }) => {
            dispatch(event)
        })
        socket.on('connect', () => {
            setConnected(true)
        })
        socket.on('disconnect', () => {
            setConnected(false)
        })

        socket.open()

        return () => socket.disconnect()

    }, [props.path])

    if (!connected) {
        return <p>Oops, we cant connect to the server atm.</p>
    }

    return props.children
}

class App extends Component {
  render() {
    return (
        <Suspense fallback={<p>Loading...</p>}>
            <DataProvider onDispatch={onDispatch} getInitialState={loadData} filter={filter}>
                <Listener path="ws://localhost:5000">
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
                </Listener>
            </DataProvider>
        </Suspense>
    );
  }
}

export default App;
