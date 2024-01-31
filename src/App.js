import { AddPostForm } from "./features/posts/AddPostForm";
import { PostsList } from "./features/posts/PostList";
import { SinglePostPage } from "./features/posts/SinglePostPage";
import { Navbar } from "./features/navbar/Navbar";

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
        <Navbar />
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
