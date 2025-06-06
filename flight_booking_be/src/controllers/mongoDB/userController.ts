const userMongoService = require("../../services/mongoDB/userService");

const getUserByID = async (req: any, res: any) => {
  try {
    const user = await userMongoService.getUserByID(req.params.id);
    res.status(200).json({
      message: "User retrieved successfully",
      user,
    });
  } catch (err) {
    res.status(500).json({
      message: "Error retrieving user",
      error: err,
    });
  }
};

const getUserByField = async (req: any, res: any) => {
  try {
    const criteria = req.query;

    console.log("criteria", criteria);

    const user = await userMongoService.getUserByField(criteria);
    res.status(200).json({
      message: "User retrieved successfully",
      user,
    });
  } catch (err) {
    res.status(500).json({
      message: "Error retrieving user",
      error: err,
    });
  }
};

const createUser = async (req: any, res: any) => {
  try {
    const user = await userMongoService.createUser(req.body);

    res.status(201).json({
      message: "User created successfully",
      user,
    });
  } catch (err) {
    res.status(500).json({
      message: "Error creating user",
      error: err,
    });
  }
};

export { getUserByID, getUserByField, createUser };
