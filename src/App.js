import { AddPostForm } from "./features/posts/AddPostForm";
import { PostsList } from "./features/posts/PostList";
import "./styles.css";

export default function App() {
  return (
    <div className="App">
      <AddPostForm />
      <PostsList />
    </div>
  );
}
