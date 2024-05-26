Sure, here's the modified README.md to include an example blueprint for the `posts` table and all the required fields.

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
npm install @wildanmzaki/sequerizer
```

## Usage

### Setup

First, you need to configure your Sequelize instance and define your models. Here's an example setup using a `posts` table:

#### Blueprint

Create a blueprint file for your table definition, e.g., `blueprints.js`:

```javascript
const { DataTypes } = require("sequelize");

const posts = () => [
  "posts",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    thumbnail: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    views: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    timestamps: true,
  },
];

module.exports = { posts };
```

#### Model Definition

Define your model using Sequerizer and the blueprint:

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
const Post = require("./path_to_PostModel");

async function createPost() {
  try {
    const newPost = await Post.create({
      title: "New Post",
      thumbnail: "image.jpg",
      content: "This is the content of the post",
      views: 0,
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
    const posts = await Post.where("views", 0).get();
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
    const updated = await Post.where("id", id).update({ views: 10 });
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
    const deleted = await Post.where("id", id).delete();
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
    const posts = await Post.limit(10).offset(20).get();
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
    const newPost = await (
      await post.verify(async (model) => {
        const exists = await model.where("title", data.title).exists();

        // Return true mean verified, return false would throw Error
        return !exists;
      })
    ).create(data);
    console.log(newPost);
  } catch (error) {
    console.error(error.message);
  }
}

createVerifiedPost({
  title: "Unique Post",
  thumbnail: "unique_image.jpg",
  content: "This is unique content",
  views: 0,
});
```

### Methods

#### async methods

Please note that async method must be called with await or use .then chaining method with callback function inside .then method

```javascript
// Callback way
Post.get().then(function (posts) {
  // do something with posts that returned from get method
});

Post.verify(async (model) => {
  // Do something like verifying the data exists or no
  const isExists = await model.where({ ...conditions }).exists();
  return !isExists;
}).then(async (model) => {
  await model.create({
    ...data,
  });
});

// await way
const posts = await Post.get();
```

#### create (async)

Create a single row of data.

```javascript
Post.create({
  title: "Hot News",
  content: "Lorem ipsum ...",
});
```

#### insert (async)

Insert one or multiple rows of data into the table.

```javascript
// Single insert:
Post.insert({
  title: "Hot News",
  content: "Lorem ipsum ...",
});

// Multiple inserts:
Post.insert([
  {
    title: "Hot News",
    content: "Lorem ipsum ...",
  },
  {
    title: "Common News",
    content: "Lorem ipsum ...",
  },
  // ...
]);
```

#### get (async)

Fetch data from the table in the database.

```javascript
Post.get(); // Fetch all data

// Variants:
Post.where('column', 'value')     // Set condition
    .orderBy('id', 'DESC')        // Order data
    .limit(15)                    // Limit the data
    .offset(10)                   // Set offset/starting row
    .get(['column1', 'column2', ...]); // Specify columns to fetch
```

#### getWhere (async)

Fetch specified data based on conditions defined in the parameter.

```javascript
Post.getWhere({
  status: 'published',
  views: {
    [Op.gt]: 50, // 'gt' is from Sequelize, meaning 'greater than'
  },
});

// Specify the columns:
Post.needColumns(['column1', 'column2', ...])
    .getWhere({
      ...conditions
    });
```

#### find (async)

Get data based on the primary key in the table.

```javascript
Post.find(id);
// Returns null or an object

// Throw an error if the data is not found
Post.withError().find("xxxxx");
```

#### needColumns

Specify the columns you need.

```javascript
Post.needColumns(['column1', 'column2', ...])
    .get();
```

#### where

Define the conditions of the rows that you want to fetch, update, or delete.

```javascript
Post.where("column", "value").get();

Post.where({
  column1: "value1",
  column2: "value2",
}).get();

Post.where("column1", "value1").where("column2", "value2").get();
```

#### orderBy

Order fetched data.

```javascript
Post.orderBy("createdAt", "DESC").get();

Post.orderBy("title", "ASC").get();
```

#### groupBy

Group result by the column

```javascript
Post.groupBy("category").get();
```

#### groupWith

Group result by the columns

```javascript
Post.groupWith(["category", "tag"]).get();
```

#### limit

Limit the number of rows fetched from the table.

```javascript
Post.limit(10).get();
```

#### offset

Set the starting point for fetching rows from the table (useful for pagination).

```javascript
Post.limit(10).offset(20).get();
```

#### verify (async)

Add custom verification logic using a callback function.

```javascript
Post.verify(async (model) => {
  const exists = await model.where("title", "Some Title").exists();
  return !exists;
}).create({
  title: "Unique Title",
  content: "Unique Content ...",
});
```

#### verifySync

Add custom verification logic using a callback function. But now the process of verification is synchronous

```javascript
Post.verifySync((model) => {
  const exists = true;
  return !exists;
}).create({
  title: "Unique Title",
  content: "Unique Content ...",
});
```

#### count (async)

Count total of the rows based on the condition

```javascript
Post.count(); // Count all

const total = await Post.count({ status: "published" });
console.log(total); // Returns total of the rows
```

#### exists (async)

Check if any row exists based on specified conditions.

```javascript
const exists = await Post.where("column", "value").exists();
console.log(exists); // Returns true or false
```

#### update (async)

Update rows based on specified conditions.

```javascript
Post.where("status", "draft").update({
  status: "published",
});
```

#### delete (async)

Delete rows based on specified conditions.

```javascript
Post.where("status", "obsolete").delete();
```

#### first (async)

Fetch the first row that matches the specified conditions.

```javascript
Post.where("status", "published").orderBy("createdAt", "ASC").first();
```

#### getOrCreate (async)

Fetch a row based on specified conditions or create it if it doesn't exist.

```javascript
Post.getOrCreate({
  title: "Breaking News",
  content: "This just in ...",
});
```

#### option

Add custom options to the query.

```javascript
Post.option("raw", true).get();
```

#### withError

Enable error throwing for not found conditions.

```javascript
Post.withError().find("nonexistent-id");
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

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.

This README includes:

- **Blueprint Example**: Adds an example blueprint for the `posts` table.
- **Model Definition**: Shows how to define the model using the blueprint.
- **Usage Examples**: Includes examples of how to create, read, update, delete, and paginate posts.
- **Middleware**: Shows how to add custom middleware.
- **Methods**: Description for each method
- **Error Handling**: Describes how to handle different types of errors.
