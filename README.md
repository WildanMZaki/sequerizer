# Sequerizer

Sequerizer is a simple and powerful ORM (Object Relational Mapper) built on top of Sequelize. It provides a clean and easy-to-use interface for interacting with your database models.

## Features

- **CRUD Operations**: Create, Read, Update, and Delete data.
- **Query Building**: Build complex queries with ease.
- **Middleware**: Add custom middleware for additional logic.
- **Pagination**: Easily paginate your results with `limit` and `offset`.
- **Error Handling**: Comprehensive error handling for all operations.

## Installation

Install via npm:

```bash
npm install sequerizer
```

## Usage

### Setup

First, you need to configure your Sequelize instance and define your models. Here's an example setup using a `posts` table:

```javascript
const { Sequelize } = require("sequelize");
const { Sequerizer, Op, ModelError } = require("sequerizer");
const { posts } = require("./blueprints.js");

const sequelize = new Sequelize("database", "username", "password", {
  host: "localhost",
  dialect: "mysql",
});

const table = sequelize.define(...posts());

class PostModel extends Sequerizer {
  constructor() {
    super(table);
  }

  async readWhere(conditions = {}) {
    try {
      const posts = await this.where(conditions).update({
        has_read: true,
      });
      return posts;
    } catch (error) {
      throw new ModelError("Error updating has_read: " + error.message);
    }
  }

  async getRecentPosts(limit = 10) {
    try {
      const recentPosts = await this.orderBy("createdAt", "DESC")
        .limit(limit)
        .get();
      return recentPosts;
    } catch (error) {
      throw new ModelError("Error fetching recent posts: " + error.message);
    }
  }
}

const Post = new PostModel();

module.exports = Post;
```

### CRUD Operations

#### Create

To create a new record:

```javascript
const post = new Post();

async function createPost() {
  try {
    const newPost = await post.create({
      sender_id: 1,
      receiver_id: 2,
      content: "Hello, World!",
      is_media: false,
      has_read: false,
    });
    console.log(newPost);
  } catch (error) {
    console.error(error.message);
  }
}

createPost();
```

#### Read

To fetch records:

```javascript
async function getPosts() {
  try {
    const posts = await post.where("has_read", false).get();
    console.log(posts);
  } catch (error) {
    console.error(error.message);
  }
}

getPosts();
```

#### Update

To update records:

```javascript
async function updatePost(id) {
  try {
    const updated = await post.where("id", id).update({ has_read: true });
    console.log(updated);
  } catch (error) {
    console.error(error.message);
  }
}

updatePost(1);
```

#### Delete

To delete records:

```javascript
async function deletePost(id) {
  try {
    const deleted = await post.where("id", id).delete();
    console.log(deleted);
  } catch (error) {
    console.error(error.message);
  }
}

deletePost(1);
```

### Pagination

To paginate results:

```javascript
async function getPaginatedPosts() {
  try {
    const posts = await post.limit(10).offset(20).get();
    console.log(posts);
  } catch (error) {
    console.error(error.message);
  }
}

getPaginatedPosts();
```

### Middleware

To add custom middleware:

```javascript
async function createVerifiedPost(data) {
  try {
    const newPost = await post
      .verify(async (model) => {
        const exists = await model
          .where("receiver_id", data.receiver_id)
          .exists();
        return !exists;
      })
      .create(data);
    console.log(newPost);
  } catch (error) {
    console.error(error.message);
  }
}

createVerifiedPost({
  sender_id: 1,
  receiver_id: 2,
  content: "Verified Post",
  is_media: false,
  has_read: false,
});
```

### Error Handling

Sequerizer includes comprehensive error handling for all operations. You can catch and handle specific errors:

```javascript
const {
  ModelError,
  CreateError,
  ReadError,
  UpdateError,
  DeleteError,
} = require("sequerizer");

try {
  // Your code here...
} catch (error) {
  if (error instanceof CreateError) {
    console.error("Create Error: ", error.message);
  } else if (error instanceof ReadError) {
    console.error("Read Error: ", error.message);
  } else if (error instanceof UpdateError) {
    console.error("Update Error: ", error.message);
  } else if (error instanceof DeleteError) {
    console.error("Delete Error: ", error.message);
  } else {
    console.error("Unknown Error: ", error.message);
  }
}
```

### Custom Methods

#### readWhere

Marks posts as read based on conditions.

```javascript
async function markPostsAsRead(conditions) {
  try {
    const updatedPosts = await post.readWhere(conditions);
    console.log(updatedPosts);
  } catch (error) {
    console.error(error.message);
  }
}

markPostsAsRead({ receiver_id: 2 });
```

#### getRecentPosts

Fetches the most recent posts, limited by the specified number.

```javascript
async function getRecentPosts(limit) {
  try {
    const recentPosts = await post.getRecentPosts(limit);
    console.log(recentPosts);
  } catch (error) {
    console.error(error.message);
  }
}

getRecentPosts(5);
```

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.

```

This README includes:

1. **Introduction**: Briefly explains what Sequerizer is.
2. **Features**: Lists the main features of Sequerizer.
3. **Installation**: Provides instructions on how to install Sequerizer via npm.
4. **Usage**:
   - **Setup**: Shows how to configure Sequelize and define models using a `posts` table.
   - **CRUD Operations**: Provides examples of Create, Read, Update, and Delete operations.
   - **Pagination**: Demonstrates how to limit and offset results for pagination.
   - **Middleware**: Explains how to add custom middleware for additional logic.
   - **Error Handling**: Details how to catch and handle specific errors.
   - **Custom Methods**: Describes the custom methods (`readWhere`, `getRecentPosts`) and provides examples of how to use them.
5. **License**: States the licensing information for the project.

This should help users understand how to effectively use your Sequerizer library with the custom `PostModel` class.
```
