const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const passport = require("passport");

const User = require("../models/User");
const Locality = require("../models/Locality");
const { forwardAuthenticated } = require("../config/auth");

router.get("/login", forwardAuthenticated, (req, res) => res.render("login"));

router.get("/register", forwardAuthenticated, (req, res) =>
  res.render("register")
);

router.post("/register", (req, res) => {
  const { name, email, areaCode, vechicleCode, password, password2 } = req.body;
  let errors = [];

  if (!name || !email || !areaCode || !vechicleCode || !password || !password2) {
    errors.push({ msg: "Please enter all fields" });
  }

  if (password != password2) {
    errors.push({ msg: "Passwords do not match" });
  }

  if (password.length < 6) {
    errors.push({ msg: "Password must be at least 6 characters" });
  }

  if (errors.length > 0) {
    res.render("register", {
      errors,
      name,
      email,
      password,
      password2,
    });
  } else {
    User.findOne({ email: email }).then((user) => {
      if (user) {
        errors.push({ msg: "Email already exists" });
        res.render("register", {
          errors,
          name,
          email,
          password,
          password2,
          areaCode,
          vechicleCode,
          
        });
      } else {
        const newUser = new User({
          name,
          email,
          password,
          areaCode,
          vechicleCode,
        });

        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            newUser.password = hash;
            newUser
              .save()
              .then((user) => {
                req.flash(
                  "success_msg",
                  "You are now registered and can log in"
                );
                res.redirect("/login");
              })
              .catch((err) => console.log(err));
          });
        });
      }
    });
  }
});


// router.post("/registerlocality", (req, res) => {
//   const { state, areaPin, latt, longg, assignedCode } = req.body;
//   let errors = [];

//   if (!state || !areaPin || !latt || !longg || !assignedCode) {
//     errors.push({ msg: "Please enter all fields" });
//   }


//   if (errors.length > 0) {
//     res.render("register", {
//       state,
//       areaPin,
//       latt,
//       longg,
//       assignedCode,
//     });
//   } else {
//     const newLocality = new Locality({
//       state,
//       areaPin,
//       latt,
//       longg,
//       assignedCode,
//         });
//             newUser
//               .save()
//               .then((user) => {
//                 req.flash(
//                   "success_msg",
//                   "You are now registered and can log in"
//                 );
//                 res.redirect("/login");
//               })
//               .catch((err) => console.log(err));
//       }
//     }
// );

// Login
router.post("/login", (req, res, next) => {
  passport.authenticate("local", {
    successRedirect: "/dashboard",
    failureRedirect: "/login",
    failureFlash: true,
  })(req, res, next);
});

// Logout
router.get("/logout", (req, res) => {
  req.logout();
  req.flash("success_msg", "You are logged out");
  res.redirect("/login");
});



module.exports = router;
