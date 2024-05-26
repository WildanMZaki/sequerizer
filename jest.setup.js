const { Sequelize } = require("sequelize");

const sequelize = new Sequelize("sequerizer", "root", "", {
  host: "127.0.0.1",
  port: "3306",
  dialect: "mysql",
  logging: false,
});

const blueprints = {
  users: [
    "users",
    {
      id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      status: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      validated_at: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null,
      },
    },
    {
      tableName: "users",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  ],
};

function connectDatabase({ log = true } = {}) {
  sequelize
    .authenticate()
    .then(() => {
      if (log) {
        const info = `[DB] Connection to database has been established successfully`;
        console.info(info);
      }
    })
    .catch((error) => {
      if (log) {
        const err = `[DB] Unable connect to database: ${error}`;
        console.error(err);
      }
      process.exit(1);
    });
}

// Connect to the database before running tests
beforeAll(async () => {
  await connectDatabase({ log: false });
});

// Close the database connection after running tests
afterAll(async () => {
  await sequelize.close();
});

module.exports = { sequelize, blueprints };
