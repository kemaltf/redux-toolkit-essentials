import { counterSlice } from './counterSlice.js';
import counterReducer, { increment } from './counterSlice.js';

const counterSliceState = counterSlice.getInitialState();
console.log(counterSliceState);
const reducerPath = counterSlice.reducerPath;
console.log('reducerpath', reducerPath);

const initialState = {
  value: 0,
};

console.log('State awal:', initialState);
console.log('icrementt type:', increment.type);

// Memanggil reducer dengan state awal dan action
const nextState0 = counterReducer(undefined, { type: 'unknown' });
const nextState1 = counterReducer(initialState, increment());
const nextState2 = counterReducer(nextState1, { type: increment.type });
const nextState3 = counterReducer(nextState2, { type: 'counter/increment' });
console.log('State unknown:', nextState0);
console.log('State setelah increment:', nextState1);
console.log('State setelah increment:', nextState2);
console.log('State setelah increment:', nextState3);
