const { AuthenticationError } = require('@apollo/server-express');
const { signToken } = require('../utils/auth');
const { User } = require('../models');

const resolvers = {
  Query: {
    me: async (parent, args, context) => {
      if (context.user) {
        data = await User.fundOne({ _id: context.user._id }).select('-__v -password');
        return data;
      }
      throw new AuthenticationError('You must be logged in')
    },
  },

}