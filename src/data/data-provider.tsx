import * as React from "react";
import {
    reducer,
    importState,
    Store,
    ValidAction
} from "./data";
import {useContext} from "react";
import * as actions from './actions'

type Props = {
    children: React.ReactChild | React.ReactChildren,
}

type State = {
    store: Store,
}

const Context = React.createContext<Store>({
    games: {},
    players: {},
    rounds: {},
    tournaments: {},
})

const DispatchContext = React.createContext<(action: ValidAction) => void>(() => undefined)

export function useStore<T>(selector: (store: Store) => T): T {
    const store = useContext(Context)
    const value = selector(store)
    if (value === undefined) {
        throw new Error('Could not select that value')
    }
    return value
}

function useDispatch() {
    return useContext(DispatchContext)
}

type ActionType = typeof actions
export function useAction<A extends keyof ActionType>(actionName: A): ActionType[A] {
    const dispatch = useDispatch()
    const actionCreator = actions[actionName]

    // @ts-ignore
    return (...args) => {
        console.group(actionName)
        try {
            // @ts-ignore
            const action = actionCreator(...args)
            console.log(action.payload)
            return dispatch(action)
        } finally {
            console.groupEnd()
        }
    }
}

type ProviderState = {
    store: Store,
    errorMessage?: string,
}

const initialStore = {
    games: {},
    players: {},
    rounds: {},
    tournaments: {},
}

export class DataProvider extends React.PureComponent<Props, ProviderState> {
    state: ProviderState = {
        store: initialStore,
    }

    handleDispatch = (action: ValidAction) => {
        this.setState((state: ProviderState) => ({
            store: reducer(state.store, action),
        }))
    }

    handleReset = () => {
        this.setState({
            errorMessage: undefined,
            store: initialStore,
        })
    }

    static getDerivedStateFromError(error: Error) {
        return {
            errorMessage: error.message,
        }
    }

    componentDidUpdate(prevProps: Props, prevState: ProviderState) {
        if (prevState.store !== this.state.store) {
            localStorage.setItem('high-hat.state', JSON.stringify(this.state.store))
        }
    }

    componentWillMount(): void {
        try {
            const item = localStorage.getItem('high-hat.state')
            if (!item) {
                return
            }
            const store = importState(JSON.parse(item))
            this.setState({ store })
        } catch (e) {
            localStorage.removeItem('high-hat.state')
        }
    }

    render() {
        if (this.state.errorMessage) {
            return (
                <div className="error">
                    <b>{this.state.errorMessage}</b>
                    <button onClick={this.handleReset}>Reset state</button>
                </div>
            )
        }
        return (
            <DispatchContext.Provider value={this.handleDispatch}>
                <Context.Provider value={this.state.store}>
                    {this.props.children}
                </Context.Provider>
            </DispatchContext.Provider>
        )
    }
}