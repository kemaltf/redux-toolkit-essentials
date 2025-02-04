# Essentials Knowledge

## What is Redux?
Redux is a pattern and library for managing and updating application state, using events called "actions". It serves as a centralized store for state that needs to be used across your entire application, with rules ensuring that the state can only be updated in a predictable fashion.

## Why redux?
1. Global State Management: Redux ensures easy handling of global state across components.
2. Predictable State Updates: Redux provides clear patterns for understanding when, where, and how state changes occur in your application.
3. Application Logic Clarity: Centralized store and predefined patterns enhance clarity in your application logic.
4. Testability: Redux promotes highly testable code with predictable state changes and clear separation of concerns.
5. Confidence in Application Behavior: Following Redux principles instills confidence in your application's behavior by facilitating a clear understanding of state changes.

# Terms
I suggest you to read this before we start this project:
1. [State Management](https://redux.js.org/tutorials/essentials/part-1-overview-concepts#state-management)
2. [Immutability vs Mutabbility](https://redux.js.org/tutorials/essentials/part-1-overview-concepts#immutability)
3. [What is "action" in Redux](https://redux.js.org/tutorials/essentials/part-1-overview-concepts#actions): Action basically just an object that has type property and payload (optional). Usually written that type string like `"domain/eventName"` , where the first part is the feature or category that this action belongs to, and the second part is the specific thing that happened. example: `"todos/todoAdded"`
4. [What is "action creator" in Redux](https://redux.js.org/tutorials/essentials/part-1-overview-concepts#actions): Function that return an action called as Action Creator.
5. [What is "reducer" in Redux](https://redux.js.org/tutorials/essentials/part-1-overview-concepts#reducers): A function that receives current state and an action. It decides how to update the state and return a new state. `(state, action) => newState`. You can think it is similar with event listener.
6. [What is "store" in Redux](https://redux.js.org/tutorials/essentials/part-1-overview-concepts#store): to create a store we need to pass the reducer into `ConfigureStore()` function. And it will return `getState`, `dispatch` method.
7. [What is "dispatch" method](https://redux.js.org/tutorials/essentials/part-1-overview-concepts#dispatch): The only way to update the state is to call store.dispatch() and pass in an action object.
8. [What is "selector" method](https://redux.js.org/tutorials/essentials/part-1-overview-concepts#selectors)
9. [Conventional state (one way data flow) vs Redux](https://redux.js.org/tutorials/essentials/part-1-overview-concepts#redux-application-data-flow)

# What we are going to make?
The sample project we'll look at is a small counter application that lets us add or subtract from a number as we click buttons.

# Rule of reducer
Reducers must always follow some special rules:
1. They should only calculate the new state value based on the state and action arguments
2. They are not allowed to modify the existing state. Instead, they must make immutable updates, by copying the existing state and making changes to the copied values.
3. They must not do any asynchronous logic or other "side effects"

In Redux, our reducers are never allowed to mutate the original / current state values!
``` js
// ❌ Illegal - by default, this will mutate the state!
state.value = 123
```

Reducers can only make copies of the original values, and then they can mutate the copies.
``` js
// ✅ This is safe, because we made a copy
return {
  ...state,
  value: 123
}
```

> if you're thinking that **"writing immutable updates by hand this way looks hard to remember and do correctly"...** yeah, you're right! :)
> **That's why Redux Toolkit's createSlice function lets you write immutable updates an easier way!**

So, instead of this:
``` js
function handwrittenReducer(state, action) {
  return {
    ...state,
    first: {
      ...state.first,
      second: {
        ...state.first.second,
        [action.someId]: {
          ...state.first.second[action.someId],
          fourth: action.someValue
        }
      }
    }
  }
}
```
You can write code that looks like this:
``` js
function reducerWithImmer(state, action) {
  state.first.second[action.someId].fourth = action.someValue
}
```