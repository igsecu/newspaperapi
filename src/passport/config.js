const LocalStrategy = require("passport-local").Strategy;

const usersAccountsServices = require("../services/usersAccount");
const adminAccountServices = require("../services/adminAccount");
const writerAccountServices = require("../services/writerAccount");

const bcrypt = require("bcryptjs");

require("dotenv").config();

module.exports = (passport) => {
  passport.use(
    new LocalStrategy(
      { usernameField: "email" },
      async (email, password, done) => {
        try {
          // Match email
          const accountFound = await usersAccountsServices.checkEmailExist(
            email
          );
          if (accountFound) {
            // Match password

            bcrypt.compare(
              password,
              accountFound.password,
              async (err, isMatch) => {
                if (err) {
                  return done(err, null);
                }
                if (isMatch) {
                  const account = await usersAccountsServices.getAccountById(
                    accountFound.id
                  );

                  if (account.isBanned === true) {
                    return done(null, false, {
                      statusCode: 400,
                      msg: "This account is banned! Please contact the admin of the page...",
                    });
                  }

                  if (account.isVerified === false) {
                    return done(null, false, {
                      statusCode: 400,
                      msg: "Please verify your account!",
                    });
                  }

                  return done(null, account);
                } else {
                  return done(null, false, {
                    statusCode: 400,
                    msg: `Incorrect password!`,
                  });
                }
              }
            );
          } else {
            return done(null, false, {
              statusCode: 404,
              msg: `Email address not found!`,
            });
          }
        } catch (error) {
          return done(error, null);
        }
      }
    )
  ),
    passport.use(
      "admin",
      new LocalStrategy(
        { usernameField: "email" },
        async (email, password, done) => {
          try {
            // Match email
            const accountFound = await adminAccountServices.checkEmailExist(
              email
            );
            if (accountFound) {
              // Match password

              bcrypt.compare(
                password,
                accountFound.password,
                async (err, isMatch) => {
                  if (err) {
                    return done(err, null);
                  }
                  if (isMatch) {
                    const account = await adminAccountServices.getAccountById(
                      accountFound.id
                    );

                    return done(null, account);
                  } else {
                    return done(null, false, {
                      statusCode: 400,
                      msg: `Incorrect password!`,
                    });
                  }
                }
              );
            } else {
              return done(null, false, {
                statusCode: 404,
                msg: `Email address not found!`,
              });
            }
          } catch (error) {
            return done(error, null);
          }
        }
      )
    ),
    passport.use(
      "writer",
      new LocalStrategy(
        { usernameField: "email" },
        async (email, password, done) => {
          try {
            // Match email
            const accountFound = await writerAccountServices.checkEmailExist(
              email
            );
            if (accountFound) {
              // Match password

              bcrypt.compare(
                password,
                accountFound.password,
                async (err, isMatch) => {
                  if (err) {
                    return done(err, null);
                  }
                  if (isMatch) {
                    const account = await writerAccountServices.getAccountById(
                      accountFound.id
                    );

                    if (account.isBanned === true) {
                      return done(null, false, {
                        statusCode: 400,
                        msg: "This account is banned! Please contact the admin of the page...",
                      });
                    }

                    return done(null, account);
                  } else {
                    return done(null, false, {
                      statusCode: 400,
                      msg: `Incorrect password!`,
                    });
                  }
                }
              );
            } else {
              return done(null, false, {
                statusCode: 404,
                msg: `Email address not found!`,
              });
            }
          } catch (error) {
            return done(error, null);
          }
        }
      )
    ),
    passport.serializeUser((user, done) => {
      done(null, user.id);
    });

  passport.deserializeUser(async (id, done) => {
    try {
      const accountFound = await usersAccountsServices.getAccountById(id);
      if (accountFound) {
        done(null, { type: "USER", ...accountFound });
      } else {
        const adminFound = await adminAccountServices.getAccountById(id);

        if (adminFound) {
          done(null, { type: "ADMIN", ...adminFound });
        } else {
          const writerFound = await writerAccountServices.getAccountById(id);

          if (writerFound) {
            done(null, { type: "WRITER", ...writerFound });
          } else {
            done(null, { msg: `Account not found!` });
          }
        }
      }
    } catch (error) {
      done(error, null);
    }
  });
};
