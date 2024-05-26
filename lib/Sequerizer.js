const { Op } = require("sequelize");
const ModelError = require("./errors/ModelError.js");
const CreateError = require("./errors/CreateError.js");
const ReadError = require("./errors/ReadError.js");
const NotFoundError = require("./errors/NotFoundError.js");
const UpdateError = require("./errors/UpdateError.js");
const DeleteError = require("./errors/DeleteError.js");

class Sequerizer {
  constructor(table) {
    if (table == undefined)
      throw new ModelError(
        "Sequelize model table must be define in constructor"
      );

    this.table = table;
    this.identifier = table.name;

    this.conditions = {};
    this.inspectValue = null;
    this.orders = [];
    this.attributes = [];
    this.options = {};
    this.throwError = false;
    this.limitValue = null;
    this.offsetValue = null;
  }

  // validator utility
  inspect = (data) => {
    this.inspectValue = data;
    return this;
  };

  mustBeAn = (type, messageIfError = "Type Error") => {
    const knownTypes = [
      "undefined",
      "object",
      "boolean",
      "number",
      "bigint",
      "string",
      "symbol",
      "function",
    ];
    if (!knownTypes.includes(type)) throw new Error("Unknown type");
    if (typeof this.inspectValue !== type) throw new TypeError(messageIfError);
  };

  // Clearing utilities (all setter to default)
  resetConditions = () => {
    this.conditions = {};
  };

  resetOptions = () => {
    this.options = {};
  };

  resetThrowError = () => {
    this.throwError = false;
  };

  clear = () => {
    this.conditions = {};
    this.options = {};
    this.attributes = [];
    this.orders = [];
    this.throwError = false;
    this.limitValue = null;
    this.offsetValue = null;
  };

  // Middleware utilities
  verifySync = (callback) => {
    // this is refered to sequelizer itself so like query or something like that
    const verified = callback(this);
    this.inspect(verified).mustBeAn(
      "boolean",
      "verifySync callback must return boolean value"
    );

    if (!verified) throw new ModelError("Unverified state occured");
    return this;
  };

  verify = async (callback) => {
    // this is refered to sequelizer itself so like query or something like that
    const verified = await callback(this);
    this.inspect(verified).mustBeAn(
      "boolean",
      "verify callback must return boolean value"
    );
    if (!verified) {
      throw new ModelError("Unverified state occured");
    }
    return this;
  };

  // Options builder utilites
  where = (columnOrConditions, value) => {
    if (typeof columnOrConditions == "string") {
      this.conditions[columnOrConditions] = value;
    } else if (typeof columnOrConditions == "object") {
      Object.assign(this.conditions, columnOrConditions);
    }
    return this;
  };

  whereIn = (column, values) => {
    this.inspect(values).mustBeAn(
      "object",
      "values in whereIn method must be an array"
    );

    this.conditions[column] = {
      [Op.in]: values,
    };
    return this;
  };

  orderBy = (column, direction = "ASC") => {
    if (!["ASC", "DESC"].includes(direction.toUpperCase()))
      throw new ModelError("Order available: ASC or DESC");
    this.orders.push([column, direction.toUpperCase()]);
    return this;
  };

  // setting orders hardly
  setOrders = (orders) => {
    this.orders = orders;
    return this;
  };

  needColumns = (columns) => {
    this.inspect(columns).mustBeAn(
      "object",
      "columns in needColumns method must be an array"
    );
    this.attributes = columns;
    return this;
  };

  limit = (limitValue) => {
    this.inspect(limitValue).mustBeAn(
      "number",
      "limit in limit method must be a number"
    );
    this.limitValue = limitValue;
    return this;
  };

  offset = (offset) => {
    this.inspect(offset).mustBeAn("number", "Offset must be a number");
    this.offsetValue = offset;
    return this;
  };

  buildOptions = () => {
    if (!this.options.hasOwnProperty("where")) {
      this.options.where = this.conditions;
    }
    if (
      this.attributes.length > 0 &&
      !this.options.hasOwnProperty("attributes")
    ) {
      this.options.attributes = this.attributes;
    }
    if (this.orders.length > 0 && !this.options.hasOwnProperty("order")) {
      this.options.order = this.orders;
    }
    if (this.limitValue !== null && !this.options.hasOwnProperty("limit")) {
      this.options.limit = this.limitValue;
    }
    if (this.offsetValue !== null && !this.options.hasOwnProperty("offset")) {
      this.options.offset = this.offsetValue;
    }
  };

  option = (keyOrOptions, value) => {
    if (typeof keyOrOptions === "string") {
      this.options[keyOrOptions] = value;
    } else if (typeof keyOrOptions === "object") {
      Object.assign(this.options, keyOrOptions);
    }
    return this;
  };

  withError = (value = true) => {
    this.throwError = value;
    return this;
  };

  // CRUD
  create = async (data) => {
    this.inspect(data).mustBeAn(
      "object",
      "Inserted data must have type of object"
    );

    try {
      const newItem = await this.table.create(data);
      return newItem;
    } catch (error) {
      throw new CreateError(
        `Error creating ${this.identifier}: ${error.message}`
      );
    }
  };

  insert = async (data) => {
    this.inspect(data).mustBeAn(
      "object",
      "Inserted data must be an object or array of objects"
    );

    try {
      let newItem;
      if (Array.isArray(data)) {
        newItem = await this.table.bulkCreate(data);
      } else {
        newItem = await this.table.create(data);
      }
      return newItem;
    } catch (error) {
      throw new CreateError(
        `Error inserting into ${this.identifier}: ${error.message}`
      );
    }
  };

  get = async (columns = [], conditions = null) => {
    this.inspect(columns).mustBeAn(
      "object",
      "columns in whereIn method must be an array"
    );
    try {
      this.buildOptions();
      if (typeof conditions == "object" && conditions !== null) {
        this.options.where = conditions;
      }
      if (columns.length > 0) {
        this.options.attributes = columns;
      }
      const items = await this.table.findAll(this.options);
      this.clear();
      return items;
    } catch (error) {
      throw new ReadError("Fail fetching data: " + error.message);
    }
  };

  getOrCreate = async (data) => {
    this.inspect(data).mustBeAn(
      "object",
      "Inserted data must have type of object"
    );

    try {
      const [item, created] = await this.table.findOrCreate({ where: data });
      if (!created && this.throwError) {
        throw new CreateError(
          `${this.identifier} already exists with data ${JSON.stringify(data)}`
        );
      }
      this.resetThrowError();
      return item;
    } catch (error) {
      throw error instanceof CreateError
        ? error
        : new ModelError(
            `Error creating or finding ${this.identifier}: ${error.message}`
          );
    }
  };

  // Khusus get, untuk custom column gunakan method needColumns
  getWhere = async (conditions = null) => {
    try {
      const withOptions = {};
      withOptions.where = conditions !== null ? conditions : this.conditions;
      if (this.attributes.length > 0) {
        withOptions.attributes = this.attributes;
      }
      const items = await this.table.findAll(withOptions);
      this.clear();
      return items;
    } catch (error) {
      throw new ReadError("Fail fetching data: " + error.message);
    }
  };

  find = async (id) => {
    try {
      const item = await this.table.findByPk(id);
      if (!item && this.throwError) {
        throw new NotFoundError(`${this.identifier} not found with id ${id}`);
      }
      this.resetThrowError();
      return item;
    } catch (error) {
      throw error instanceof NotFoundError
        ? error
        : new ReadError(
            `Error finding ${this.identifier} with id ${id}: ${error.message}`
          );
    }
  };

  first = async () => {
    try {
      this.buildOptions();
      const item = await this.table.findOne(this.options);
      if (!item && this.throwError) {
        throw new NotFoundError(`${this.identifier} not found`);
      }
      this.clear();
      return item;
    } catch (error) {
      throw error instanceof NotFoundError
        ? error
        : new ReadError(
            `Error finding ${this.identifier} with id ${id}: ${error.message}`
          );
    }
  };

  exists = async (conditions = null) => {
    this.inspect(conditions).mustBeAn(
      "object",
      "conditions in exists method must be an object"
    );
    try {
      this.buildOptions();
      if (conditions !== null) {
        this.options.where = conditions;
      }
      const item = await this.table.findOne(this.options);
      this.clear();
      return item !== null;
    } catch (error) {
      throw new ReadError("Error in exists method: " + error.message);
    }
  };

  update = async (payload, conditions = null) => {
    this.buildOptions();
    if (conditions !== null && typeof conditions === "object") {
      this.options.where = conditions;
    }

    try {
      const items = this.table.update(payload, this.options);
      this.clear();
      return items;
    } catch (error) {
      throw UpdateError(
        `Error updating ${this.identifier} table: ${error.message}`
      );
    }
  };

  delete = async (conditions = null) => {
    this.buildOptions();
    if (conditions !== null && typeof conditions === "object") {
      this.options.where = conditions;
    }

    try {
      const result = await this.table.destroy(this.options);
      this.clear();
      return result;
    } catch (error) {
      throw new DeleteError(
        `Error deleting from ${this.identifier}: ${error.message}`
      );
    }
  };

  truncate = async () => {
    try {
      await this.table.destroy({ where: {}, truncate: true });
    } catch (error) {
      throw new DeleteError(
        `Error truncating ${this.identifier}: ${error.message}`
      );
    }
  };
}

module.exports = {
  Sequerizer,
  Op,
  ModelError,
  CreateError,
  ReadError,
  NotFoundError,
  UpdateError,
  DeleteError,
};
