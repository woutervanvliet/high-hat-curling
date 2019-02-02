import * as React from "react";
import {
    reducer,
    importState,
    Store,
    ValidAction
} from "./data";
import {useCallback, useContext, useReducer} from "react";
import * as actions from './actions'

type Props = {
    children: React.ReactChild | React.ReactChildren,
    onDispatch?: (action: ValidAction) => void,
    filter?: (action: ValidAction) => boolean,
    getInitialState: () => Promise<Store>,
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

export function useDispatch() {
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

const cacheMap = new WeakMap()
function getCache(func: () => Promise<any>) {
    if (!cacheMap.has(func)) {
        console.log('creating new cache')
        cacheMap.set(func, createCache(func))
    }

    return cacheMap.get(func)
}
function createCache(func: () => Promise<any>) {
    let promise: Promise<any> | undefined
    let value: any
    let resolved = false

    return {
        get value(): any {
            if (resolved) {
                return value
            }

            if (promise === undefined) {
                promise = func()
                    .then((returnValue) => {
                        value = returnValue
                        resolved = true
                    })
            }

            throw promise
        },
        reset() {
            promise = undefined
            value = undefined
            resolved = false
        }
    }
}

export function DataProvider(props: Props) {

    const storeCache = getCache(props.getInitialState)
    const [state, dispatch] = useReducer(reducer, storeCache.value)
    const onDispatch = useCallback((action: any) => {
        if (props.filter && !props.filter(action)) {
            return
        }

        if (props.onDispatch) {
            props.onDispatch(action)
        }
        dispatch(action)
    }, [dispatch, props.onDispatch, props.filter])

    return (
        <DispatchContext.Provider value={onDispatch}>
            <Context.Provider value={state}>
                {props.children}
            </Context.Provider>
        </DispatchContext.Provider>
    )
}
