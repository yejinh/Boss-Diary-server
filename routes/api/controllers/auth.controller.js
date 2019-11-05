const jwt = require('jsonwebtoken');
const User = require('../../../models/User');
const { vaildEmail } = require('../../../constants/regex');

exports.authenticate = async (req, res, next) => {
  try {
    const { email, name, picture } = req.body;

    if (!vaildEmail.test(email)) {
      throw new Error('Invaild email');
    }

    const user = await User.findOne({ email: email });

    if (!user) {
      const userData = await new User({
        name,
        email,
        profilePhoto: picture.data.url,
        resports: [],
        templates: []
      }).save();

      const { _id } = userData;
      const token = jwt.sign(
        {
          email,
          name,
          _id
        },
        process.env.SECRET_KEY,
        {
          expiresIn: '7d'
        }
      );

      return res.json({
        message: 'logged in successfully',
        user_id: _id,
        access_token: token
      });
    }

    const token = jwt.sign(
      {
        email,
        name,
        _id: user._id
      },
      process.env.SECRET_KEY,
      {
        expiresIn: '7d'
      }
    );

    res.json({
      message: 'logged in successfully',
      user_id: user._id,
      access_token: token
    });
  } catch(err) {
    console.log(err);
    next(new Error(err));
  }
};
