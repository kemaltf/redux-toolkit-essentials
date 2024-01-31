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

# 3. Adding New Posts

## Adding the New Post Form:

``` js
// features/posts/AddPostForm.js
import React, { useState } from 'react'

export const AddPostForm = () => {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')

  const onTitleChanged = e => setTitle(e.target.value)
  const onContentChanged = e => setContent(e.target.value)

  return (
    <section>
      <h2>Add a New Post</h2>
      <form>
        <label htmlFor="postTitle">Post Title:</label>
        <input
          type="text"
          id="postTitle"
          name="postTitle"
          value={title}
          onChange={onTitleChanged}
        />
        <label htmlFor="postContent">Content:</label>
        <textarea
          id="postContent"
          name="postContent"
          value={content}
          onChange={onContentChanged}
        />
        <button type="button">Save Post</button>
      </form>
    </section>
  )
}
```

## Add `AddPostForm` into `App.js`

``` js
...
export default function App() {
  return (
    <div className="App">
      <AddPostForm />
      <PostsList />
    </div>
  );
}
```

## Update our posts slice 

Upddate our posts slice to add new post entries to the Redux store.

> Our posts slice is responsible for handling all updates to the posts data. Inside of the createSlice call, there's an object called reducers. We need to add a reducer function inside of there to handle the case of a post being added.

``` js
// features/posts/postsSlice.js
const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    postAdded(state, action) {
      state.push(action.payload)
    }
  }
})

export const { postAdded } = postsSlice.actions

export default postsSlice.reducer
```

Inside of reducers, add a function named `postAdded`, which will receive two arguments: the current `state` value, and the `action` object that was dispatched. Since the posts slice only knows about the data it's responsible for, the state argument will be the array of posts by itself, and not the entire Redux state object.

The `action` object will have our new post entry as the `action.payload` field, and we'll put that new post object into the state array.

When we write the `postAdded` reducer function, `createSlice` will **automatically** generate an "action creator" function with the same name. 

We can export that action creator and use it in our UI components to dispatch the action when the user clicks "Save Post".

``` js
export const { postAdded } = postsSlice.actions
```

## Update our posts slice 

Our AddPostForm has text inputs and a "Save Post" button, but the button doesn't do anything yet. We need to add a click handler that will dispatch the postAdded action creator and pass in a new post object containing the title and content the user wrote.

Right now, our initial test posts are using some fake numbers for their IDs. We could write some code that would figure out what the next incrementing ID number should be, but it would be better if we generated a random unique ID instead. Redux Toolkit has a nanoid function we can use for that.

In order to dispatch actions from a component, we need access to the store's `dispatch` function.

We get this by calling the `useDispatch` hook from React-Redux.

We also need to import the `postAdded` action creator into this file.

Once we have the dispatch function available in our component, we can call `dispatch(postAdded())` in a click handler. 

 ``` js
import React, { useState } from "react";

import { useDispatch } from "react-redux";
import { nanoid } from "@reduxjs/toolkit";

import { postAdded } from "./postsSlice";

export const AddPostForm = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const dispatch = useDispatch();

  const onTitleChanged = (e) => setTitle(e.target.value);
  const onContentChanged = (e) => setContent(e.target.value);

  const onSavedPostClicked = () => {
    if (title && content) {
      dispatch(postAdded({ id: nanoid(), title, content }));
    }
    setTitle("");
    setContent("");
  };
  return (
    <section>
      <h2>Add a New Post</h2>
      <form>
        <label htmlFor="postTitle">Post Title:</label>
        <input
          type="text"
          id="postTitle"
          name="postTitle"
          value={title}
          onChange={onTitleChanged}
        />
        <label htmlFor="postContent">Content:</label>
        <textarea
          id="postContent"
          name="postContent"
          value={content}
          onChange={onContentChanged}
        />
        <button type="button" onClick={onSavedPostClicked}>
          Save Post
        </button>
      </form>
    </section>
  );
};
```

# 4. Showing single post

## Create single post page

First, we need to add a new `SinglePostPage` component to our `posts` feature folder. We'll use React Router to show this component when the page URL looks like `/posts/123`, where the `123` part should be the ID of the post we want to show.

``` js
// features/posts/SinglePostPage.js
import React from 'react'
import { useSelector } from 'react-redux'

export const SinglePostPage = ({ match }) => {
  const { postId } = match.params

  const post = useSelector(state =>
    state.posts.find(post => post.id === postId)
  )

  if (!post) {
    return (
      <section>
        <h2>Post not found!</h2>
      </section>
    )
  }

  return (
    <section>
      <article className="post">
        <h2>{post.title}</h2>
        <p className="post-content">{post.content}</p>
      </article>
    </section>
  )
}
```

Once we have that postId value, we can use it inside a selector function to find the right post object from the Redux store. We know that state.posts should be an array of all post objects, so we can use the Array.find() function to loop through the array and return the post entry with the ID we're looking for.

> It's important to note that the component will re-render any time the value returned from useSelector changes to a new reference.     


## Adding the Single Post Route

``` js
// App.js
import { AddPostForm } from "./features/posts/AddPostForm";
import { PostsList } from "./features/posts/PostList";
import { SinglePostPage } from "./features/posts/SinglePostPage";
import "./styles.css";
import {
  BrowserRouter as Router,
  Route,
  Switch,
  Redirect,
} from "react-router-dom";
import React from "react";

export default function App() {
  return (
    <div className="App">
      <Router>
        <Switch>
          <Route
            exact
            path="/"
            render={() => (
              <React.Fragment>
                <AddPostForm />
                <PostsList />
              </React.Fragment>
            )}
          />
          <Route exact path="/posts/:postId" component={SinglePostPage} />

          <Redirect to="/" />
        </Switch>
      </Router>
    </div>
  );
}

```
Then, in `<PostsList>`, we'll update the list rendering logic to include a `<Link>` that routes to that specific post:

``` js
...
import { Link } from "react-router-dom";
export const PostsList = () => {
  ...
  const renderedPosts = posts.map((post) => (
    <article className="post-excerpt" key={post.id}>
      <h3>{post.title}</h3>
      <p className="post-content">{post.content.substring(0, 100)}</p>{" "}
      <Link to={`/posts/${post.id}`} className="button muted-button">
        View Post
      </Link>
    </article>
  ));
```
And we also need to create `Navbar` component as well

``` js
// features/Navbar/Navbar.js
import React from "react";

import { Link } from "react-router-dom";

export const Navbar = () => {
  return (
    <nav>
      <section>
        <h1>Redux Essentials Example</h1>

        <div className="navContent">
          <div className="navLinks">
            <Link to="/">Posts</Link>
          </div>
        </div>
      </section>
    </nav>
  );
};

```