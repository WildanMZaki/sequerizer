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

First, you need to configure your Sequelize instance and define your models. Here's an example setup:

```javascript
const { Sequelize } = require("sequelize");
const { Sequerizer, Op, ModelError } = require("sequerizer");

const sequelize = new Sequelize("database", "username", "password", {
  host: "localhost",
  dialect: "mysql",
});

const messagesBlueprint = [
  "messages",
  {
    id: {
      type: Sequelize.BIGINT,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    sender_id: {
      type: Sequelize.BIGINT,
      allowNull: false,
    },
    receiver_id: {
      type: Sequelize.BIGINT,
      allowNull: false,
    },
    message: {
      type: Sequelize.TEXT,
      allowNull: false,
    },
    is_media: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    has_read: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    tableName: "messages",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
];

const table = sequelize.define(...messagesBlueprint);

class Message extends Sequerizer {
  constructor() {
    super(table);
  }
}

module.exports = {
  Message,
  sequelize,
};
```

### CRUD Operations

#### Create

To create a new record:

```javascript
const message = new Message();

async function createMessage() {
  try {
    const newMessage = await message.create({
      sender_id: 1,
      receiver_id: 2,
      message: "Hello, World!",
      is_media: false,
      has_read: false,
    });
    console.log(newMessage);
  } catch (error) {
    console.error(error.message);
  }
}

createMessage();
```

#### Read

To fetch records:

```javascript
async function getMessages() {
  try {
    const messages = await message.where("has_read", false).get();
    console.log(messages);
  } catch (error) {
    console.error(error.message);
  }
}

getMessages();
```

#### Update

To update records:

```javascript
async function updateMessage(id) {
  try {
    const updated = await message.where("id", id).update({ has_read: true });
    console.log(updated);
  } catch (error) {
    console.error(error.message);
  }
}

updateMessage(1);
```

#### Delete

To delete records:

```javascript
async function deleteMessage(id) {
  try {
    const deleted = await message.where("id", id).delete();
    console.log(deleted);
  } catch (error) {
    console.error(error.message);
  }
}

deleteMessage(1);
```

### Pagination

To paginate results:

```javascript
async function getPaginatedMessages() {
  try {
    const messages = await message.limit(10).offset(20).get();
    console.log(messages);
  } catch (error) {
    console.error(error.message);
  }
}

getPaginatedMessages();
```

### Middleware

To add custom middleware:

```javascript
async function createVerifiedMessage(data) {
  try {
    const newMessage = await message
      .verify(async (model) => {
        const exists = await model
          .where("receiver_id", data.receiver_id)
          .exists();
        return !exists;
      })
      .create(data);
    console.log(newMessage);
  } catch (error) {
    console.error(error.message);
  }
}

createVerifiedMessage({
  sender_id: 1,
  receiver_id: 2,
  message: "Verified Message",
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

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.

```

### Explanation of Sections:

1. **Introduction**: Briefly explains what Sequerizer is.
2. **Features**: Lists the main features of the Sequerizer.
3. **Installation**: Provides instructions on how to install Sequerizer via npm.
4. **Usage**:
   - **Setup**: Shows how to configure Sequelize and define models.
   - **CRUD Operations**: Provides examples of Create, Read, Update, and Delete operations.
   - **Pagination**: Demonstrates how to limit and offset results for pagination.
   - **Middleware**: Explains how to add custom middleware for additional logic.
   - **Error Handling**: Details how to catch and handle specific errors.
5. **License**: States the licensing information for the project.

This README should help users understand how to use your Sequerizer library effectively.
```
