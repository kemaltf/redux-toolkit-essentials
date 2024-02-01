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


# 5. Editing Posts

Let's add a new `<EditPostForm>` component that has the ability:
- to take an existing post ID
- read that post from the store
- edit the title and post content
- save the changes to update the post in the store.

## Updating post entries
First, we need to update our `postsSlice` to create a new reducer function and an action so that the store knows how to actually update posts.

Inside of the `createSlice()` call, we should add a new function into the reducers object.

> Remember that the name of this reducer should be a good description of what's happening.

Because it is used for update `post` object, let's call this one `postUpdated`. Before moving forward, to edit the `post` object, we need to know:
- ID Post
- The new `title` & `content`

Redux action objects are required to have a `type` field, which is normally a descriptive string, and may also contain other fields with more information about what happened. By convention, we normally put the additional info in a field called `action.payload`, but it's up to us to decide what the `payload` field contains - it could be a string, a number, an object, an array, or something else. In this case, since we have three pieces of information we need, let's plan on having the `payload` field be an object with the three fields inside of it. That means the action object will look like `{type: 'posts/postUpdated', payload: {id, title, content}}`.

By default, the action creators generated by createSlice expect you to pass in one argument, and that value will be put into the action object as action.payload. So, we can pass an object containing those fields as the argument to the postUpdated action creator.

We also know that the reducer is responsible for determining how the state should actually be updated when an action is dispatched. Given that, we should have the reducer find the right post object based on the ID, and specifically update the `title` and `content` fields in that post.

Finally, we'll need to export the action creator function that `createSlice` generated for us, so that the UI can dispatch the new `postUpdated` action when the user saves the post.

``` js
const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    postAdded(state, action) {
      state.push(action.payload)
    },
    postUpdated(state, action) {
      const { id, title, content } = action.payload
      const existingPost = state.find(post => post.id === id)
      if (existingPost) {
        existingPost.title = title
        existingPost.content = content
      }
    }
  }
})

export const { postAdded, postUpdated } = postsSlice.actions

export default postsSlice.reducer
```
## Creating an Edit Post Form
Our new <EditPostForm> component will look similar to the <AddPostForm>, but the logic needs to be a bit different. 

We need to retrieve the right post object from the store, **then use that to initialize the state fields in the component** so the user can make changes. 

We'll save the changed title and content values back to the store after the user is done. We'll also use React Router's history API to switch over to the single post page and show that post.

``` js
// features/posts/EditPostForm.js
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";

import { postUpdated } from "./postsSlice";

/* eslint-disable react/prop-types */
export const EditPostForm = ({ match }) => {
  const { postId } = match.params;

  const post = useSelector((state) =>
    state.posts.find((post) => post.id === postId),
  );

  const [title, setTitle] = useState(post.title);
  const [content, setContent] = useState(post.content);

  const dispatch = useDispatch();
  const history = useHistory();

  const onTitleChanged = (e) => setTitle(e.target.value);
  const onContentChanged = (e) => setContent(e.target.value);

  const onSavePostClicked = () => {
    if (title && content) {
      dispatch(postUpdated({ id: postId, title, content }));
      history.push(`/posts/${postId}`);
    }
  };

  return (
    <section>
      <h2>Edit Post</h2>
      <form>
        <label htmlFor="postTitle">Post Title:</label>
        <input
          type="text"
          id="postTitle"
          name="postTitle"
          placeholder="What's on your mind?"
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
      </form>
      <button type="button" onClick={onSavePostClicked}>
        Save Post
      </button>
    </section>
  );
};

```

Like with SinglePostPage, we'll need to import it into App.js and add a route that will render this component with the postId as a route parameter.
``` js
// App.js
...
 <Route exact path="/posts/:postId" component={SinglePostPage} />
 <Route exact path="/editPost/:postId" component={EditPostForm} />
...
```

One last thing, we should also add a new link to our `SingePostPage`.

``` js
// features/post/SinglePostPage.js
  // omit other contents

        <p  className="post-content">{post.content}</p>
        <Link to={`/editPost/${post.id}`} className="button">
          Edit Post
        </Link>
```

# Preparing Action Payload
Before moving forward, let's examine what we have created. Previously, we have created postAdded, where before dispatching the action, we perform specific tasks:
1. Generating a unique ID for the latest post.
2. Defining the shape of the payload object {id, title, content}.

### Issues arise. 
When creating the ID (or performing additional actions in the React component), and then passing the generated payload object into the postAdded action creator, this leads to several problems:
1. Duplication of logic, as we might repeat the same logic to prepare the complex payload.
2. Component dependency, as we need to know the payload structure for this action.

### Solution: 
Centralize the preparation of action payloads. This makes it easy for us to maintain and ensure consistency across various applications to perform the same dispatch. This can be achieved using middleware or other patterns.

If we were writing the postAdded action creator by hand, we could have put the setup logic inside of it ourselves:

``` js
// hand-written action creator
function postAdded(title, content) {
  const id = nanoid()
  return {
    type: 'posts/postAdded',
    payload: { id, title, content }
  }
}
```
FORTUNATELY, Redux Toolkit's `createSlice` is generating these action creators for us. That makes the code shorter because we don't have to write them ourselves, but we still need a way to customize the contents of action.payload.

Fortunately, `createSlice` lets us define a "prepare callback" function when we write a reducer. The "prepare callback" function can take multiple arguments, generate random values like unique IDs, and run whatever other synchronous logic is needed to decide what values go into the action object. It should then return an object with the payload field inside. (The return object may also contain a `meta` field, which can be used to add extra descriptive values to the action, and an error field, which should be a boolean indicating whether this action represents some kind of an error.)

Inside of the reducers field in createSlice, we can define one of the fields as an object that looks like {reducer, prepare}:

``` js
const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    postAdded: {
      reducer(state, action) {
        state.push(action.payload)
      },
      prepare(title, content) {
        return {
          payload: {
            id: nanoid(),
            title,
            content
          }
        }
      }
    }
    // other reducers here
  }
})
```

Now our component doesn't have to worry about what the payload object looks like - the action creator will take care of putting it together the right way. So, we can update the component so that it passes in `title` and `content` as arguments when it dispatches postAdded:

``` js
// features/posts/AddPostForm.js
const onSavePostClicked = () => {
  if (title && content) {
    dispatch(postAdded(title, content))
    setTitle('')
    setContent('')
  }
}
```

# Users and Posts
So far, we only have one slice of state. The logic is defined in `postsSlice.js`, the data is stored in `state.posts`, and all of our components have been related to the posts feature. Real applications will probably have many different slices of state, and several different "feature folders" for the Redux logic and React components.

You can't have a "social media" app if there aren't any other people involved. Let's add the ability to keep track of a list of users in our app, and update the post-related functionality to make use of that data.

## Adding a Users Slice

Since the concept of "users" is different than the concept of "posts", we want to keep the code and data for the users separated from the code and data for posts. We'll add a new `features/users` folder, and put a `usersSlice` file in there. Like with the posts slice, for now we'll add some initial entries so that we have data to work with.

``` js
// features/users/usersSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = [
  { id: "0", name: "Tianna Jenkins" },
  { id: "1", name: "Kevin Grant" },
  { id: "2", name: "Madison Price" },
];

const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {},
});

export default usersSlice.reducer;

```

we'll import the usersReducer into our store file and add it to the store setup:
``` js
// app/store.js
import { configureStore } from '@reduxjs/toolkit'

import postsReducer from '../features/posts/postsSlice'
import usersReducer from '../features/users/usersSlice'

export default configureStore({
  reducer: {
    posts: postsReducer,
    users: usersReducer
  }
})
```

## Adding Authors for Posts

Every post in our app was written by one of our users, and every time we add a new post, we should keep track of which user wrote that post. In a real app, we'd have some sort of a `state.currentUser` field that keeps track of the current logged-in user, and use that information whenever they add a post.

To keep things simpler for this example, we'll update our `<AddPostForm>` component so that we can select a user from a dropdown list, and we'll include that user's ID as part of the post.

First, we need to update our `postAdded` action creator to accept a user ID as an argument, and include that in the action.

We'll also update the existing post entries in initialState to have a post.user field with one of the example user IDs.

``` js
// features/posts/postsSlice.js
reducers: {
    postAdded: {
      reducer(state, action) {
        state.push(action.payload)
      },
      prepare(title, content, userId) {
        return {
          payload: {
            id: nanoid(),
            title,
            content,
            user: userId
          }
        }
      }
    }
    // other reducers
  }
```

Now, in our `<AddPostForm>`, we can read the list of users from the store with useSelector and show them as a dropdown.
We'll then take the ID of the selected user and pass that to the `postAdded` action creator. 

``` js
// features/posts/AddPostForm.js
//...
import { useDispatch, useSelector } from 'react-redux'
//...

export const AddPostForm = () => {
  //...
  const [userId, setUserId] = useState('')

  const dispatch = useDispatch()

  const users = useSelector(state => state.users)

  // ...
  const onAuthorChanged = e => setUserId(e.target.value)

  const onSavePostClicked = () => {
    if (title && content) {
      dispatch(postAdded(title, content, userId))
      setTitle('')
      setContent('')
    }
  }

  const canSave = Boolean(title) && Boolean(content) && Boolean(userId)

  const usersOptions = users.map(user => (
    <option key={user.id} value={user.id}>
      {user.name}
    </option>
  ))

  return (
    <section>
    {/* ... */}
        <label htmlFor="postAuthor">Author:</label>
        <select id="postAuthor" value={userId} onChange={onAuthorChanged}>
          <option value=""></option>
          {usersOptions}
        </select>
        <label htmlFor="postContent">Content:</label>
        <textarea
          id="postContent"
          name="postContent"
          value={content}
          onChange={onContentChanged}
        />
        <button type="button" onClick={onSavePostClicked} disabled={!canSave}>
          Save Post
        </button>
      </form>
    </section>
  )
}
```

Now, we need a way to show the name of the post's author inside of our post list items and `<SinglePostPage>`

``` js
// features/posts/PostAuthor.js
import React from 'react'
import { useSelector } from 'react-redux'

export const PostAuthor = ({ userId }) => {
  const author = useSelector(state =>
    state.users.find(user => user.id === userId)
  )

  return <span>by {author ? author.name : 'Unknown author'}</span>
}
```

We can now import the `PostAuthor` component into both `PostsList.js` and `SinglePostPage.js`, and render it as <`PostAuthor userId={post.user} />`, and every time we add a post entry, the selected user's name should show up inside of the rendered post.

# More Post Feature

## Storing dates for posts

Social media feeds are typically sorted by when the post was created, and show us the post creation time as a relative description like "5 hours ago". In order to do that, we need to start tracking a date field for our post entries.

Like with the post.user field, we'll update our postAdded prepare callback to make sure that post.date is always included when the action is dispatched. However, it's not another parameter that will be passed in. We want to always use the exact timestamp from when the action is dispatched, so we'll let the prepare callback handle that itself.

> Redux actions and state should only contain plain JS values like objects, arrays, and primitives. Don't put class instances, functions, or other non-serializable values into Redux!.

Since we can't just put a Date class instance into the Redux store, we'll track the post.date value as a timestamp string: 
``` js
// features/posts/postsSlice.js
    postAdded: {
      reducer(state, action) {
        state.push(action.payload)
      },
      prepare(title, content, userId) {
        return {
          payload: {
            id: nanoid(),
            date: new Date().toISOString(),
            title,
            content,
            user: userId,
          },
        }
      },
    },
```

we need to show the relative timestamp description in both our `<PostsList>` and `<SinglePostPage>` components. We'll add a `<TimeAgo>` component to handle formatting a timestamp string as a relative description. 

Libraries like `date-fns` have some useful utility functions for parsing and formatting dates, which we can use here:

``` js
import React from 'react'
import { parseISO, formatDistanceToNow } from 'date-fns'

export const TimeAgo = ({ timestamp }) => {
  let timeAgo = ''
  if (timestamp) {
    const date = parseISO(timestamp)
    const timePeriod = formatDistanceToNow(date)
    timeAgo = `${timePeriod} ago`
  }

  return (
    <span title={timestamp}>
      &nbsp; <i>{timeAgo}</i>
    </span>
  )
}
```

##  Sorting the Posts List

Our `<PostsList>` is currently showing all the posts in the same order the posts are kept in the Redux store. Our example has the oldest post first, and any time we add a new post, it gets added to the end of the posts array. **That means the newest post is always at the bottom of the page.**

In theory, since we know that the state.posts array is already sorted, we could just reverse the list. But, it's better to go ahead and sort it ourselves just to be sure.

Since `array.sort()` mutates the existing array, we need to make a copy of `state.posts` and sort that copy. We know that our post.date fields are being kept as date timestamp strings, and we can directly compare those to sort the posts in the right order:

``` js
// features/posts/PostsList.js
// Sort posts in reverse chronological order by datetime string
// slice() is a method on array objects in JavaScript.
// This method is used to create a copy of some or all of the array elements. The method has two optional parameters: start and end. 
// If no parameters are given, slice() will create a copy of the entire array.
// Sort function accept comparation function in the parameter
// a and b is two variable that we will compare
// if b > a it will return +
// if b = a it will return 0
// if b < a it will return -
// and sort function will rearange based on the result.
const orderedPosts = posts.slice().sort((a, b) => b.date.localeCompare(a.date))

const renderedPosts = orderedPosts.map(post => {
  return (
   {/* */}
```

We also need to add the `date` field to `initialState` in `postsSlice.js`. We'll use `date-fns `here again to subtract minutes from the current date/time so they differ from each other.

``` js
// features/posts/postsSlice.js
import { createSlice, nanoid } from '@reduxjs/toolkit'
import { sub } from 'date-fns'

const initialState = [
  {
    // omitted fields
    content: 'Hello!',
    date: sub(new Date(), { minutes: 10 }).toISOString()
  },
  {
    // omitted fields
    content: 'More text',
    date: sub(new Date(), { minutes: 5 }).toISOString()
  }
]
```

Add `<TimeAgo>` component:
``` js
// PostList.js
const renderedPosts = orderedPosts
    ? orderedPosts.map((post) => (
        <article className="post-excerpt" key={post.id}>
          <h3>{post.title}</h3>
          <PostAuthor userId={post.user} />
          <TimeAgo timestamp={post.date} />
          <p className="post-content">{post.content.substring(0, 100)}</p>{" "}
          <Link to={`/posts/${post.id}`} className="button muted-button">
            View Post
          </Link>
        </article>
      ))
    : null;
```

## Post Reaction Buttons

We'll add a row of emoji reaction buttons at the bottom of each post in `<PostsList>` and `<SinglePostPage>`. Every time a user clicks one of the reaction buttons, we'll need to update a matching counter field for that post in the Redux store. Since the reaction counter data is in the Redux store, switching between different parts of the app should consistently show the same values in any component that uses that data.

``` js
// features/posts/ReactionButtons.js
import React from 'react'

const reactionEmoji = {
  thumbsUp: '👍',
  hooray: '🎉',
  heart: '❤️',
  rocket: '🚀',
  eyes: '👀'
}

export const ReactionButtons = ({ post }) => {
  const reactionButtons = Object.entries(reactionEmoji).map(([name, emoji]) => {
    return (
      <button key={name} type="button" className="muted-button reaction-button">
        {emoji} {post.reactions[name]}
      </button>
    )
  })

  return <div>{reactionButtons}</div>
}
```

We don't yet have a `post.reactions` field in our data, so we'll need to update the `initialState` post objects and our `postAdded` prepare callback function to make sure that every post has that data inside, like reactions: `{thumbsUp: 0, hooray: 0, heart: 0, rocket: 0, eyes: 0}`.

Now, we can define a new reducer that will handle updating the reaction count for a post when a user clicks the reaction button.

Like with editing posts, we need to know the ID of the post, and which reaction button the user clicked on. We'll have our `action.payload` be an object that looks like `{id, reaction}`. The reducer can then find the right post object, and update the correct reactions field.

``` js
const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    reactionAdded(state, action) {
      const { postId, reaction } = action.payload
      const existingPost = state.find(post => post.id === postId)
      if (existingPost) {
        existingPost.reactions[reaction]++
      }
    }
    // other reducers
  }
})

export const { postAdded, postUpdated, reactionAdded } = postsSlice.actions
```

As we've seen already, createSlice lets us write "mutating" logic in our reducers. If we weren't using createSlice and the Immer library, the line existingPost.reactions[reaction]++ would indeed mutate the existing post.reactions object, and this would probably cause bugs elsewhere in our app because we didn't follow the rules of reducers. But, since we are using createSlice, we can write this more complex update logic in a simpler way, and let Immer do the work of turning this code into a safe immutable update.

Notice that our action object just contains the minimum amount of information needed to describe what happened. We know which post we need to update, and which reaction name was clicked on. We could have calculated the new reaction counter value and put that in the action, but it's always better to keep the action objects as small as possible, and do the state update calculations in the reducer. This also means that reducers can contain as much logic as necessary to calculate the new state.

Now we need to dispatch the action

```js
// features/posts/ReactionButtons.jsx
import React from 'react'
import { useDispatch } from 'react-redux'

import { reactionAdded } from './postsSlice'

//..

export const ReactionButtons = ({ post }) => {
  const dispatch = useDispatch()

  const reactionButtons = Object.entries(reactionEmoji).map(([name, emoji]) => {
    return (
      <button
        key={name}
        type="button"
        className="muted-button reaction-button"
        onClick={() =>
          dispatch(reactionAdded({ postId: post.id, reaction: name }))
        }
      >
        {emoji} {post.reactions[name]}
      </button>
    )
  })

  return <div>{reactionButtons}</div>
}

```

