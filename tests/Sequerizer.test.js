const { sequelize, blueprints } = require("../jest.setup");
const {
  Sequerizer,
  NotFoundError,
  CreateError,
  ModelError,
} = require("../lib/Sequerizer");

const Users = new Sequerizer(sequelize.define(...blueprints.users));

describe("Sequerizer Class", () => {
  beforeAll(async () => {
    await Users.truncate();

    await Users.create({
      name: "User 1",
      phone: "1234567890",
      password: "password1",
    });

    await Users.create({
      name: "User 2",
      phone: "1234567891",
      password: "password2",
    });
  });

  it("should create a user", async () => {
    const newUser = await Users.create({
      name: "User 3",
      phone: "1234567892",
      password: "password3",
    });

    expect(newUser).toHaveProperty("id");
    expect(newUser.name).toBe("User 3");
  });

  it("should insert multiple users", async () => {
    const usersToInsert = [
      {
        name: "User 4",
        phone: "1234567893",
        password: "password4",
      },
      {
        name: "User 5",
        phone: "1234567894",
        password: "password5",
      },
    ];

    const newUsers = await Users.insert(usersToInsert);

    expect(newUsers.length).toBe(2);
    expect(newUsers[0]).toHaveProperty("id");
    expect(newUsers[1]).toHaveProperty("id");
    expect(newUsers[0].name).toBe("User 4");
    expect(newUsers[1].name).toBe("User 5");
  });

  it("should retrieve users by condition", async () => {
    const users = await Users.where("name", "User 1").get();

    expect(users.length).toBe(1);
    expect(users[0].name).toBe("User 1");
  });

  it("should retrieve users by whereIn condition", async () => {
    const users = await Users.whereIn("name", ["User 1", "User 2"]).get();

    expect(users.length).toBe(2);
    expect(users.some((user) => user.name === "User 1")).toBe(true);
    expect(users.some((user) => user.name === "User 2")).toBe(true);
  });

  it("should update a user's phone number", async () => {
    await Users.where("name", "User 1").update({ phone: "0987654321" });
    const updatedUser = await Users.where("name", "User 1").get();

    expect(updatedUser.length).toBe(1);
    expect(updatedUser[0].phone).toBe("0987654321");
  });

  it("should delete a user by condition", async () => {
    await Users.where("name", "User 5").delete();
    const deletedUser = await Users.where("name", "User 5").get();

    expect(deletedUser.length).toBe(0);
  });

  it("should find a user by id", async () => {
    const user = await Users.find(1);
    expect(user).toHaveProperty("id");
    expect(user.name).toBe("User 1");
  });

  it("should throw an error if user not found and withError is true", async () => {
    try {
      await Users.withError(true).find(99999);
    } catch (error) {
      expect(error).toBeInstanceOf(NotFoundError);
    }
  });

  it("should create a new user or find the existing one", async () => {
    const userData = {
      name: "User i",
      phone: "1234567899",
      password: "password9",
    };

    const user = await Users.getOrCreate(userData);

    expect(user).toHaveProperty("id");
    expect(user.name).toBe("User i");

    const sameUser = await Users.getOrCreate(userData);
    expect(sameUser.id).toBe(user.id);
  });

  it("should throw an error if user already exists and withError is true", async () => {
    const userData = {
      name: "User h",
      phone: "1234567898",
      password: "password8",
    };

    await Users.create(userData);

    try {
      await Users.withError(true).getOrCreate(userData);
    } catch (error) {
      expect(error).toBeInstanceOf(CreateError);
    }
  });

  it("should get the first user", async () => {
    const firstUser = await Users.first();
    expect(firstUser).toHaveProperty("id");
    expect(firstUser.name).toBe("User 1");
  });

  it("should throw an error if no user is found and withError is true", async () => {
    await Users.truncate();

    try {
      await Users.withError(true).first();
    } catch (error) {
      expect(error).toBeInstanceOf(NotFoundError);
    }
  });

  it("should truncate the users table", async () => {
    const usersToInsert = [
      {
        name: "User x",
        phone: "1234567893",
        password: "passwordx",
      },
      {
        name: "User y",
        phone: "1234567894",
        password: "passwordy",
      },
    ];

    const inserted = await Users.insert(usersToInsert);

    await Users.truncate();
    const users = await Users.get();

    expect(inserted.length).toBe(usersToInsert.length);
    expect(users.length).toBe(0);
  });

  it("should get data with limited rows", async () => {
    const usersToInsert = [
      {
        name: "User x",
        phone: "1234567893",
        password: "passwordx",
      },
      {
        name: "User y",
        phone: "1234567894",
        password: "passwordy",
      },
      {
        name: "User z",
        phone: "1234567895",
        password: "passwordz",
      },
    ];

    const inserted = await Users.insert(usersToInsert);
    const users = await Users.limit(2).get();

    expect(inserted.length).toBe(usersToInsert.length);
    expect(users.length).toBe(2);
  });

  it("exists method must return boolean", async () => {
    await Users.create({
      name: "User Exists",
      phone: "123321",
      password: "passwordEixsts",
    });

    Users.exists({
      phone: "123321",
    }).then((value) => {
      expect(value).toBe(true);
    });
    Users.exists({
      phone: "12332xx",
    }).then((value) => {
      expect(value).toBe(false);
    });
  });

  it("verify middleware must throwing ModelError", async () => {
    const userData = {
      name: "User Unique",
      phone: "1223",
      password: "passwordUnique",
    };
    await Users.create(userData);

    try {
      const user = await (
        await Users.verify(async (model) => {
          const exists = await model.where("phone", "1223").exists();
          return !exists;
        })
      ).create(userData);
    } catch (error) {
      expect(error).toBeInstanceOf(ModelError);
    }
  });

  it("offset method must skipping rows", async () => {
    await Users.truncate();
    const usersToInsert = [
      {
        name: "User x",
        phone: "1234567893",
        password: "passwordx",
      },
      {
        name: "User y",
        phone: "1234567894",
        password: "passwordy",
      },
      {
        name: "User z",
        phone: "1234567895",
        password: "passwordz",
      },
      {
        name: "User a",
        phone: "1234567896",
        password: "passworda",
      },
      {
        name: "User b",
        phone: "1234567897",
        password: "passwordb",
      },
      {
        name: "User c",
        phone: "1234567898",
        password: "passwordc",
      },
    ];

    const inserted = await Users.insert(usersToInsert);
    const users = await Users.offset(3).limit(2).get();

    expect(inserted.length).toBe(usersToInsert.length);
    expect(users.length).toBe(2);
    expect(users[0].name).toBe("User a");
    expect(users[1].name).toBe("User b");
  });

  it("should return count of the user", async () => {
    const userCount = await Users.count();
    await Users.create({
      name: "User x",
      phone: "12345678990",
      password: "passwordx",
    });
    const userX = await Users.count({
      name: "User x",
    });

    expect(userCount).toBe(6);
    expect(userX).toBe(2);
  });

  it("should groping by groupBy method", async () => {
    const userCount = await Users.count();

    const userByName = await Users.groupBy("name").get();
    console.log(userByName);

    expect(userCount).toBe(7);
    expect(userByName.length).toBe(6);
  });
});
