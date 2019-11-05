const AWS = require('aws-sdk');
const User = require('../../../models/User');
const Template = require('../../../models/Template');
require('dotenv').config();

const s3 = new AWS.S3( {
  accessKeyId:  process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

exports.getObjects = function (req, res) {
  var item = req.body;
  var params = { Bucket: req.params.bucketName };
  s3.getObject(params, function (err, data) {
    if (err) {
      return res.send({ "error": err });
    }
    res.send({ data });
  });
};

exports.getOne = (req, res) => {
  res.json({
    message: 'User Found successfully',
    userData: res.locals.userData
  });
};

exports.update = async(req, res) => {
  try {
    const userId = req.params.user_id;
    const { templateId, price } = req.body;
// 템플릿 가격 빼주기
// 중복 체크 한번 더
    await User.update(
      {
        _id: userId
      },
      {
        $addToSet: { templates : templateId }
      }
    );

    res.json({ res: user });
  } catch(err) {
    next(new Error(err));
  }
};

exports.getUserTemplates = async(req, res, next) => {
  try {
    const user = await User.findOne({ _id: req.params.user_id }).populate('templates');

    res.json({
      message: 'User templates loaded successfully',
      templates: user.templates
    });
  } catch(err) {
    next(new Error(err));
  }
};
