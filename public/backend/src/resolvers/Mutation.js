const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { randomBytes } = require('crypto');
const { promisify } = require('util');

const Mutations = {
  async createItem(parent, args, ctx, info) {
    // TODO: Check if they are logged in
    const item = await ctx.db.mutation.createItem(
      {
        data: {
          ...args
        }
      },
      info
    );

    return item;
  },

  updateItem(parent, args, ctx, info) {
    // Take a copy of the updates
    const updates = { ...args };
    // remove the ID from the updates
    delete updates.id;
    // run the update method
    return ctx.db.mutation.updateItem(
      {
        data: updates,
        where: { id: args.id }
      },
      info
    );
  },

  async deleteItem(parent, args, ctx, info) {
    const where = { id: args.id };
    // find item
    const item = await ctx.db.query.item({ where }, `{id title}`);
    // check if they own item or have permissions
    // delete it
    return ctx.db.mutation.deleteItem({ where }, info);
  },

  async signup(parent, args, ctx, info) {
    args.email = args.email.toLowerCase();
    // hash their password
    const password = await bcrypt.hash(args.password, 10);
    // create the user in the database
    const user = await ctx.db.mutation.createUser(
      {
        data: {
          ...args,
          password,
          permissions: { set: ['USER'] }
        }
      },
      info
    );

    // create the JWT token for them
    const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);
    // set cookie on response
    ctx.response.cookie('token', token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365 // 1 year cookie
    });

    return user;
  },

  async signin(parent, { email, password }, ctx, info) {
    // Check if there is a user with that email
    const user = await ctx.db.query.user({ where: { email } });

    if (!user) {
      throw new Error(`No user found for email: ${email}`);
    }
    // Check if their password is correct
    const valid = await bcrypt.compare(password, user.password);

    if (!valid) {
      throw new Error('Invalid password!');
    }
    // Generate the jwt token
    const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);
    // Set the cookie with the token
    ctx.response.cookie('token', token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365 // 1 year cookie
    });

    return user;
  },

  signout(parent, args, ctx, info) {
    ctx.response.clearCookie('token');

    return { message: 'good bye!' };
  },

  async requestReset(parent, args, ctx, info) {
    // Check if this is a real user
    const user = await ctx.db.query.user({ where: { email: args.email } });

    if (!user) {
      throw new Error(`No such user found for email: ${args.email}`);
    }
    // Set a reset token and expiry on that user
    const resetToken = (await promisify(randomBytes)(20)).toString('hex');
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour from now
    // Email them the reset token
    const res = await ctx.db.mutation.updateUser({
      where: { email: args.email },
      data: { resetToken, resetTokenExpiry }
    });

    return { message: 'Reset under way!' };
  },

  async resetPassword(parent, args, ctx, info) {
    // Check if the passwords match
    const { password, confirmedPassword } = args;
    if (password !== confirmedPassword) {
      throw new Error(
        'These passwords do not match. Please enter matching passwords.'
      );
    }
    // Check if it is a legit reset token
    const [user] = await ctx.db.query.users({
      where: {
        resetToken: args.resetToken,
        resetTokenExpiry: Date.now - 3600000
      }
    });

    if (!user) {
      throw new Error('This token is either valid or expired ');
    }

    // Hash their new password
    const hashedPassword = await bcrypt.hash(args.password, 10);
    // save the new password to the user and remove old reset token fields
    const updatedUser = await ctx.db.mutation.updateUser({
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null
      },
      where: { id: user.id }
    });
    // Generate the jwt token
    const token = jwt.sign({ userId: updatedUser.id }, process.env.APP_SECRET);
    // Set the cookie with the token
    ctx.response.cookie('token', token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365 // 1 year cookie
    });

    // return the new user
    return user;
  }
};

module.exports = Mutations;
