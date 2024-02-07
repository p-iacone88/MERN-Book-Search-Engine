const { AuthenticationError, UserInputError } = require('apollo-server-express');
const { User } = require('../models');
const { signToken } = require('../utils/auth');

const resolvers = {
  Query: {
    me: async (parent, args, context) => {
      //Check if user is authenticated
      if (!context.user) {
        //throw AuthenticationError
        throw new AuthenticationError('You must be logged in');
      }

      try {
        // Find the user by ID, exclude sensitive data
        const data = await User.findOne({ _id: context.user._id }).select('-__v -password');
        // If user not found, throw AuthenticationError
        if (!data) {
          throw new AuthenticationError('User not found.');
        }
        // Return user data
        return data;
        // Catch and log errors
      } catch (error) {
        console.error(error);
        // Throw error message
        throw new Error('An internal server error occurred.');
      }
    },
  },

  Mutation: {
    // Resolver for the 'addUser' mutation
    addUser: async (parent, { username, email, password }) => {
      try {
        // Create new user
        const user = await User.create({ username, email, password });
        // Generate JWT token for the new user
        const token = signToken(user);
        // Return token and user data
        return { token, user };
      } catch (error) {
        console.error(error);
        throw new Error('An internal server error occurred.');
      }
    },
    // Resolver for the 'login' mutation
    login: async (parent, { email, password }) => {
      try {
        // Find user by email
        const user = await User.findOne({ email });

        if (!user) {
          throw new UserInputError('User not found. Do you have an account?', {
            invalidArgs: ['email'],
          });
        }
        // Check if password is correct     
        const correctPw = await user.isCorrectPassword(password);

        if (!correctPw) {
          throw new AuthenticationError('Incorrect credentials!');
        }
        // Generate JWT token for the user
        const token = signToken(user);
        // Return token and user data
        return { token, user };
      } catch (error) {
        console.error(error);
        throw new Error('An internal server error occurred.');
      }
    },
    // Resolver for the 'saveBook' mutation
    saveBook: async (parent, { newBook }, context) => {
      if (!context.user) {
        throw new AuthenticationError('You need to be logged in!');
      }

      try {
        // Find user by ID and update savedBooks array
        const updatedUser = await User.findByIdAndUpdate(
          { _id: context.user._id },
          { $push: { savedBooks: newBook } },
          { new: true }
        );

        if (!updatedUser) {
          throw new UserInputError('User not found.', {
            invalidArgs: ['_id'],
          });
        }

        return updatedUser;
      } catch (error) {
        console.error(error);
        throw new Error('An internal server error occurred.');
      }
    },
    // Resolver for the 'removeBook' mutation
    removeBook: async (parent, { bookId }, context) => {
      if (!context.user) {
        throw new AuthenticationError('You need to be logged in!');
      }

      try {
        // Find user by ID and update savedBooks array
        const updatedUser = await User.findByIdAndUpdate(
          { _id: context.user._id },
          { $pull: { savedBooks: { bookId } } },
          { new: true }
        );

        if (!updatedUser) {
          throw new UserInputError('User not found.', {
            invalidArgs: ['_id'],
          });
        }

        // Return updated user data
        return updatedUser;
      } catch (error) {
        console.error(error);
        throw new Error('An internal server error occurred.');
      }
    },
  },
};

module.exports = resolvers;
