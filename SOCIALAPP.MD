# Social APP

We're going to build a small social media feed app, which will include a number of features that demonstrate some real-world use cases.

Exploring the Initial Project
Let's take a quick look at what the initial project contains:

- /public: the HTML host page template and other static files like icons
- /src
    - index.js: the entry point file for the application. It renders the React-Redux <Provider> component and the main <App> component.
    - App.js: the main application component. Renders the top navbar and handles client-side routing for the other content.
    - index.css: styles for the complete application
- /api
    - client.js: a small AJAX request client that allows us to make GET and POST requests
    - server.js: provides a fake REST API for our data. Our app will fetch data from these fake endpoints later.
- /app
    - Navbar.js: renders the top header and nav content
    - store.js: creates the Redux store instance


# 1. Creating the post slice

The first step is to create a new Redux "slice" that will contain the data for our posts. 

``` js
// features/posts/postsSlice.js
import { createSlice } from '@reduxjs/toolkit'

const initialState = [
  { id: '1', title: 'First Post!', content: 'Hello!' },
  { id: '2', title: 'Second Post', content: 'More text' }
]

const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {}
})

export default postsSlice.reducer
```

> Every time we create a new slice, we need to add its reducer function to our Redux store.

``` js
// app/store.js
import { configureStore } from '@reduxjs/toolkit'

import postsReducer from '../features/posts/postsSlice'

export default configureStore({
  reducer: {
    posts: postsReducer
  }
})
```
> This tells Redux that we want our top-level state object to have a field named `posts` inside, and all the data for state.posts will be updated by the `postsReducer` function when actions are dispatched.


# 2. Showing the Posts List

Create a new file named PostsList.js.

we're going to render a list of posts, we need to get the data from somewhere. React components can read data from the Redux store using the useSelector hook from the React-Redux library. **The "selector functions" that you write will be called with the entire Redux state object as a parameter, and should return the specific data.**

``` js
// features/posts/PostsList.js
import React from 'react'
import { useSelector } from 'react-redux'

export const PostsList = () => {
  const posts = useSelector(state => state.posts)

  const renderedPosts = posts.map(post => (
    <article className="post-excerpt" key={post.id}>
      <h3>{post.title}</h3>
      <p className="post-content">{post.content.substring(0, 100)}</p>
    </article>
  ))

  return (
    <section className="posts-list">
      <h2>Posts</h2>
      {renderedPosts}
    </section>
  )
}
```

update App.js
```
import { PostsList } from "./features/posts/PostList";
import "./styles.css";

export default function App() {
  return (
    <div className="App">
      <PostsList />
    </div>
  );
}

```