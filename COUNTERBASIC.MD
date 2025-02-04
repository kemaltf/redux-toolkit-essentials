# Counter App with Redux

Here are the key files that make up this application:
```
/src
    - index.js: the starting point for the app
    - App.js: the top-level React component
    - /app
        - store.js: creates the Redux store instance
    - /features
        - /counter
            - Counter.js: a React component that shows the UI for the counter feature
            - counterSlice.js: the Redux logic for the counter feature
```
# Step by step
## 1. Create the redux store

```js
import { configureStore } from '@reduxjs/toolkit'
import counterReducer from '../features/counter/counterSlice'

export default configureStore({
  reducer: {
    counter: counterReducer
  }
})
```

When we pass in an object like {counter: counterReducer}, that says that we want to have a `state.counter` section of our Redux state object, and that we want the counterReducer function to be in charge of deciding if and how to update the `state.counter` section whenever an action is dispatched.

## 2. Redux Slice
A "slice" is a COLECTION of Redux reducer logic (A function which will return a new state) and actions for a single feature in your app.

Three slices—users, posts, and comments—are defined, each corresponding to a distinct feature (users, posts, and comments).

```js 
// features/counter/counterSlice.js
import { configureStore } from '@reduxjs/toolkit'
import usersReducer from '../features/users/usersSlice'
import postsReducer from '../features/posts/postsSlice'
import commentsReducer from '../features/comments/commentsSlice'

export default configureStore({
  reducer: {
    users: usersReducer,
    posts: postsReducer,
    comments: commentsReducer
  }
})
```

## 3. Creating Slice Reducers and Actions

```js
import { createSlice } from '@reduxjs/toolkit'

export const counterSlice = createSlice({
  name: 'counter',
  initialState: {
    value: 0
  },
  reducers: {
    increment: state => {
      // Redux Toolkit allows us to write "mutating" logic in reducers. It
      // doesn't actually mutate the state because it uses the immer library,
      // which detects changes to a "draft state" and produces a brand new
      // immutable state based off those changes
      state.value += 1
    },
    decrement: state => {
      state.value -= 1
    },
    incrementByAmount: (state, action) => {
      state.value += action.payload
    }
  }
})

export const { increment, decrement, incrementByAmount } = counterSlice.actions

export default counterSlice.reducer
```

Redux Toolkit has a function called `createSlice`, which takes care of the work of generating action type strings, action creator functions, and action objects. All you have to do is define a name for this slice, write an object that has some reducer functions in it, and it generates the corresponding action code automatically. The string from the `name` option is used as the first part of each action type, and the key name of each reducer function is used as the second part. So, the `"counter"` name + the `"increment"` reducer function generated an action type of `{type: "counter/increment"}`.

> We can see here that there are three reducer functions, and that corresponds to the three different action types that were dispatched by clicking the different buttons.

createSlice automatically generates action creators with the same names as the reducer functions we wrote. We can check that by calling one of them and seeing what it returns:
 ```
console.log(counterSlice.actions.increment())
// {type: "counter/increment"}
 ```
It also generates the slice reducer function that knows how to respond to all these action types:
```
const newState = counterSlice.reducer(
  { value: 10 },
  counterSlice.actions.increment()
)
console.log(newState)
// {value: 11}
```

## 4. Writing Async Logic with Thunks 
**A thunk is a specific kind of Redux function that can contain asynchronous logic.**

Thunks are written using two functions.
- Inside Thunk Function: This is a function inside thunk. It gets dispatch & getState as parameters.
- Outside Creator Function: This function is located outside the thunk. It act to create a "real thunk" and return thunk.

Example:
``` js
// Outside Creator Function
const fetchData = () => {
  // Inside Thunk Function
  return async (dispatch, getState) => {
    // Perform asynchronous operations
    try {
      const response = await fetch('https://api.example.com/data');
      const data = await response.json();

      // Dispatch actions based on the asynchronous result
      dispatch({ type: 'FETCH_SUCCESS', payload: data });
    } catch (error) {
      // Handle errors and dispatch appropriate actions
      dispatch({ type: 'FETCH_FAILURE', payload: error.message });
    }
  };
};

// Usage of the thunk
store.dispatch(fetchData());
```

You will probably find forms like this more often:

``` js
// Outside Creator Function
const fetchData = () => async (dispatch, getState) => {
  // Perform asynchronous operations
  try {
    const response = await fetch('https://api.example.com/data');
    const data = await response.json();

    // Dispatch actions based on the asynchronous result
    dispatch({ type: 'FETCH_SUCCESS', payload: data });
  } catch (error) {
    // Handle errors and dispatch appropriate actions
    dispatch({ type: 'FETCH_FAILURE', payload: error.message });
  }
};

// Usage of the thunk
store.dispatch(fetchData());
```

However, using thunks requires that the redux-thunk middleware (a type of plugin for Redux) be added to the Redux store when it's created. Fortunately, Redux Toolkit's configureStore function already sets that up for us automatically, so we can go ahead and use thunks here.

``` js
// features/counter/counterSlice.js
// the outside "thunk creator" function
const fetchUserById = userId => {
  // the inside "thunk function"
  return async (dispatch, getState) => {
    try {
      // make an async call in the thunk
      const user = await userAPI.fetchById(userId)
      // dispatch an action when we get the response back
      dispatch(userLoaded(user))
    } catch (err) {
      // If something went wrong, handle it here
    }
  }
}
```

Maybe you are wondering. **WAS IT NOT POSSIBLE TO MAKE ASYNCHRONOUS FUNCTIONS IN REDUX??**

Yes you are right. We don't create the asynchronous function inside the redux, instead we create middleware. **However, in Redux-toolkit this is handled automatically, so we don't see the process.**

In the fundamental principles of Redux, reducer functions must be pure, deterministic, and should not involve asynchronous operations. This is because reducers should return values based on the given arguments and should not depend on external states or asynchronous operations that take time.

> If asynchronous operations are involved, such as making API calls or fetching data from a server, it is advisable to handle these outside the reducer function. Therefore, to manage asynchronous logic in Redux, such as fetching data from an API, Redux Thunk is used as middleware to provide additional capabilities.
>
> Redux Thunk allows us to pass functions into the dispatch, and these functions can perform asynchronous operations and dispatch actions when those operations are completed. This way, reducers continue to function synchronously and deterministically, while asynchronous logic is placed within thunk functions.
>
> Example usage of Redux Thunk (without RTK):
> ```
> const fetchDataThunk = () => async (dispatch, getState) => {
>  dispatch({ type: 'FETCH_START' });
>
>  try {
>    const response = await fetch('https://api.example.com/data');
>    const data = await response.json();
>
>    dispatch({ type: 'FETCH_SUCCESS', payload: data });
>  } catch (error) {
>    dispatch({ type: 'FETCH_FAILURE', payload: error.message });
>  }
> };
>```

## 5. Create react component with RTK

``` js
// features/counter/Counter.js
import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
  decrement,
  increment,
  incrementByAmount,
  incrementAsync,
  selectCount
} from './counterSlice'
import styles from './Counter.module.css'

export function Counter() {
  const count = useSelector(selectCount)
  const dispatch = useDispatch()
  const [incrementAmount, setIncrementAmount] = useState('2')

  return (
    <div>
      <div className={styles.row}>
        <button
          className={styles.button}
          aria-label="Increment value"
          onClick={() => dispatch(increment())}
        >
          +
        </button>
        <span className={styles.value}>{count}</span>
        <button
          className={styles.button}
          aria-label="Decrement value"
          onClick={() => dispatch(decrement())}
        >
          -
        </button>
      </div>
      {/* omit additional rendering output here */}
    </div>
  )
}
```

as you can see we are calling a hook from redux called useSelector and there is a selectCount which we will create after this.

## 6. Reading Data with useSelector

In Redux, a selector function is a function used to retrieve specific data from the Redux state. 

The useSelector hook lets our component extract whatever pieces of data it needs from the Redux store state.

``` js
// The function below is called a selector and allows us to select a value from
// the state. Selectors can also be defined inline where they're used instead of
// in the slice file. For example: `useSelector((state) => state.counter.value)`
export const selectCount = state => state.counter.value
```

Maybe you might wondering what is the different between `selectCount` vs `getState`.
`useSelector` is used within React components to select and listen to specific parts of the Redux state, while `getState` is used outside the component context, such as in action creators or middleware, to access the entire Redux state at a specific point in time.

If we had access to a Redux store, we could retrieve the current counter value as:

```const count = selectCount(store.getState())
console.log(count)
// 0```

Our components can't talk to the Redux store directly, because we're not allowed to import it into component files. But, `useSelector` takes care of talking to the Redux store behind the scenes for us.

So, we can get the current store counter value by doing:

```const count = useSelector(selectCount)```

We don't have to only use selectors that have already been exported, either. For example, we could write a selector function as an inline argument to useSelector:

```const countPlusTwo = useSelector(state => state.counter.value + 2)```

## 7. Dispatching Actions with `useDispatch`
Since we don't have access to the store itself, we need some way to have access to just the dispatch method.

The useDispatch hook does that for us, and gives us the actual dispatch method from the Redux store:
```
const dispatch = useDispatch()
```
From there, we can dispatch actions when the user does something like clicking on a button:

```
<button
  className={styles.button}
  aria-label="Increment value"
  onClick={() => dispatch(increment())}
>
  +
</button>
```

## 8. Providing the Store

We've seen that our components can use the useSelector and useDispatch hooks to talk to the Redux store. But, since we didn't import the store, how do those hooks know what Redux store to talk to?

Now that we've seen all the different pieces of this application, it's time to circle back to the starting point of this application and see how the last pieces of the puzzle fit together.

```
// index.js
import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import App from './App'
import store from './app/store'
import { Provider } from 'react-redux'
import * as serviceWorker from './serviceWorker'

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
)
```

We always have to call ReactDOM.render(<App />) to tell React to start rendering our root <App> component. In order for our hooks like useSelector to work right, we need to use a component called <Provider> to pass down the Redux store behind the scenes so they can access it.

