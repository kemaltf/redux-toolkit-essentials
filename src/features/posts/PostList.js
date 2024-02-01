import React from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { PostAuthor } from "./PostAuthor";
import { TimeAgo } from "./TimeAgo";
import { ReactionButtons } from "./ReactionButtons";

export const PostsList = () => {
  const posts = useSelector((state) => state.posts);
  console.log(posts);
  // Sort posts in reverse chronological order by datetime string
  const orderedPosts = posts
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date));

  // Check if posts is not undefined before mapping
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
          <ReactionButtons post={post} />
        </article>
      ))
    : null;

  return (
    <section className="posts-list">
      <h2>Posts</h2>
      {renderedPosts}
    </section>
  );
};
