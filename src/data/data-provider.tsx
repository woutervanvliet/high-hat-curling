import * as React from "react";
import {
    reducer,
    Store,
    Tournament,
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

export function useStore(): Store {
    return useContext(Context)
}

export function useTournaments(): Tournament[] {
    const context = useStore()
    return Object.values(context.tournaments)
}

function useDispatch() {
    return useContext(DispatchContext)
}

type ActionType = typeof actions
export function useAction<A extends keyof ActionType>(action: A): ActionType[A] {
    const dispatch = useDispatch()
    const actionCreator = actions[action]

    // @ts-ignore
    return (...args) => {
        const action = actionCreator(...args)
        console.log(action)
        return dispatch(action)
    }
}

export class DataProvider extends React.PureComponent<Props> {
    state: Store = {
        games: {},
        players: {},
        rounds: {},
        tournaments: {},
    }

    handleDispatch = (action: ValidAction) => {
        this.setState((state: Store) => reducer(state, action))
    }

    componentDidUpdate() {
        localStorage.setItem('high-hat.state', JSON.stringify(this.state))
    }

    componentWillMount(): void {
        try {
            const item = localStorage.getItem('high-hat.state')
            if (!item) {
                return
            }
            const state = JSON.parse(item)
            this.setState(state)
        } catch (e) {
            localStorage.removeItem('high-hat.state')
        }
    }

    render() {
        return (
            <DispatchContext.Provider value={this.handleDispatch}>
                <Context.Provider value={this.state}>
                    {this.props.children}
                </Context.Provider>
            </DispatchContext.Provider>
        )
    }
}