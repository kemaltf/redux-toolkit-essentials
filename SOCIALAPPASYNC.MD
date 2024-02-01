# Introduction

So far, all the data we've worked with has been directly inside of our React client application. However, most real applications need to work with data from a server, by making HTTP API calls to fetch and save items.

In this section, we'll convert our social media app to fetch the posts and users data from an API, and add new posts by saving them to the API.

> Redux Toolkit includes the RTK Query data fetching and caching API. RTK Query is a purpose built data fetching and caching solution for Redux apps, and can eliminate the need to write any thunks or reducers to manage data fetching. 

# Thunks and Async Logic

## Using Middleware to Enable Async Logic
*By itself, a Redux store doesn't know anything about async logic.*

It only knows how to synchronously dispatch actions, update the state by calling the root reducer function, and notify the UI that something has changed. **Any asynchronicity has to happen outside the store.**

*But, what if* you want to have async logic interact with the store by dispatching or checking the current store state? 
*That's where Redux middleware come in.*

They extend the store, and allow you to:
1. Execute extra logic when any action is dispatched (such as logging the action and state)
2. Pause, modify, delay, replace, or halt dispatched actions
3. Write extra code that has access to dispatch and getState
Teach dispatch how to accept other values besides plain action objects, such as functions and promises, by intercepting them and dispatching real action objects instead

> The most common reason to use middleware is to allow different kinds of async logic to interact with the store. 

There are many kinds of async middleware for Redux, and each lets you write your logic using different syntax. The most common async middleware is **redux-thunk**, which lets you write plain functions that may contain async logic directly. 

Redux Toolkit's `configureStore` function automatically sets up the `thunk` middleware by default, and we recommend using `thunks` as a standard approach for writing async logic with Redux. 

Earlier, we saw what the synchronous data flow for Redux looks like. When we introduce asynchronous logic, we add an extra step where middleware can run logic like AJAX requests, then dispatch actions.

| Synchronous | Asynchronous |
| ----------- | ----------- |
| ![Synchronous](image.png) | ![Asynchronous](image-1.png) |

# Thunk Functions

"Thunk" is a term used to describe a special type of function that delays the execution of code. Often to perform asynchronous operations, before dispatching an action to the Redux store.

## Adding thunk middleware
Thunk middleware is added to the Redux store to enable the dispatching of thunk function. Once added, we can pass thunk functions directly to `store.dispatch`.

## Thunk function stucture
A thunk function is a function that is always called with `(dispatch, getState)` as its arguments.

## Dispatching plain actions
Thunk typically dispatch actions using action creators (plain actions in redux means an object that has simple form which has type and payload as property.)

```js
const store = configureStore({ reducer: counterReducer })

const exampleThunkFunction = (dispatch, getState) => {
  const stateBefore = getState()
  console.log(`Counter before: ${stateBefore.counter}`)
  dispatch(increment())
  const stateAfter = getState()
  console.log(`Counter after: ${stateAfter.counter}`)
}

store.dispatch(exampleThunkFunction)
```

if your action has another param like `amount` you can make thunk action creator like this:
```js
const logAndAdd = amount => {
  return (dispatch, getState) => {
    const stateBefore = getState()
    console.log(`Counter before: ${stateBefore.counter}`)
    dispatch(incrementByAmount(amount))
    const stateAfter = getState()
    console.log(`Counter after: ${stateAfter.counter}`)
  }
}

store.dispatch(logAndAdd(5))
```

Thunks are typically written in "slice" files. `createSlice` itself does not have any special support for defining thunks, so you should write them as separate functions in the same slice file. 

## Writing async thunks
Thunks may have async logic inside of them, such as `setTimeout`, `Promises`, and `async`/`await`. This makes them a good place to put AJAX calls to a server API.

Data fetching logic for Redux typically follows a predictable pattern:

A "start" action is dispatched before the request, to indicate that the request is in progress. This may be used to track loading state to allow skipping duplicate requests or show loading indicators in the UI.

The async request is made
Depending on the request result, the async logic dispatches either a "success" action containing the result data, or a "failure" action containing error details. The reducer logic clears the loading state in both cases, and either processes the result data from the success case, or stores the error value for potential display.

These steps are not required, but are commonly used. (If all you care about is a successful result, you can just dispatch a single "success" action when the request finishes, and skip the "start" and "failure" actions.)

Redux Toolkit provides a createAsyncThunk API to implement the creation and dispatching of these actions, and we'll look at how to use it shortly.

> If we were to write out the code for a typical async thunk by hand, it might look like this:
> ```js
> const getRepoDetailsStarted = () => ({
>  type: 'repoDetails/fetchStarted'
> })
> const getRepoDetailsSuccess = repoDetails => ({
>  type: 'repoDetails/fetchSucceeded',
>  payload: repoDetails
> })
> const getRepoDetailsFailed = error => ({
>  type: 'repoDetails/fetchFailed',
>  error
> })
> const fetchIssuesCount = (org, repo) => async dispatch => {
>   dispatch(getRepoDetailsStarted())
>   try {
>     const repoDetails = await getRepoDetails(org, repo)
>    dispatch(getRepoDetailsSuccess(repoDetails))
>  } catch (err) {
>    dispatch(getRepoDetailsFailed(err.toString()))
>  }
> }
> ```
> However, writing code using this approach is tedious. Each separate type of request needs repeated similar implementation:
> - Unique action types need to be defined for the three different cases
> - Each of those action types usually has a corresponding action creator function
> - A thunk has to be written that dispatches the correct actions in the right sequence
> `createAsyncThunk` abstracts this pattern by generating the action types and action creators, and generating a thunk that dispatches those actions automatically. You provide a callback function that makes the async call and returns a Promise with the result.