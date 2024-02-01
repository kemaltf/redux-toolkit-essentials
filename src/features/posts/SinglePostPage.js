import React from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { selectPostById } from "./postsSlice";
/* eslint-disable react/prop-types */
export const SinglePostPage = ({ match }) => {
  const { postId } = match.params;

  const post = useSelector(selectPostById);

  if (!post) {
    return (
      <section>
        <h2>Post not found!</h2>
      </section>
    );
  }

  return (
    <section>
      <article className="post">
        <Link to={`/editPost/${post.id}`} className="button">
          Edit Post
        </Link>
        <h2>{post.title}</h2>
        <p className="post-content">{post.content}</p>
      </article>
    </section>
  );
};
