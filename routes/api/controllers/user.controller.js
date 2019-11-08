const User = require('../../../models/User');
const Report = require('../../../models/Report');
const AWS = require('aws-sdk');
require('dotenv').config();

exports.getOne = (req, res) => {
  res.json({
    message: 'User Found successfully',
    userData: res.locals.userData
  });
};

exports.getAllReports = async(req, res, next) => {
  try {
    const reports = await Report
    .find({ created_by: req.params.user_id })
    .sort({ created_at: 'desc' });

    res.json({
      message: 'User templates loaded successfully',
      reports: reports
    });
  } catch(err) {
    next(new Error(err));
  }
}

exports.getPaginationReports = async(req, res, next) => {
  try {
    const pageNumber = parseInt(req.query.page_number);
    const pageSize =  parseInt(req.query.page_size);

    const reports = await Report
    .find({ created_by: req.params.user_id })
    .sort({ created_at: 'desc' })
    .skip((pageNumber - 1) * pageSize)
    .limit(pageSize);

    if (!reports.length) {
      return res.json({
        message: 'No report found',
        reports: []
      });
    }

    res.json({
      message: 'User templates loaded successfully',
      reports: reports
    });
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

exports.create = async(req, res, next) => {
  try {
    const userId = req.params.user_id;
    const { text, templateId, date } = req.body;

    const type = 'jpg';
    const buffer = req.files.photo[0].buffer;

    const s3 = new AWS.S3({
      accessKeyId:  process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION
    });

    const params = {
      Bucket: process.env.AWS_BUCKET,
      Key: `photos/${userId}_${date}`,
      Body: buffer,
      ACL: 'public-read',
      ContentEncoding: 'base64',
      ContentType: `image/${type}`
    };

    s3.upload(params, (err, data) => {
      if (err) {
        throw new Error('s3 upload failed');
      }
      const photoUrl = data.Location;
      saveReport(photoUrl);
    });

    const saveReport = async(photoUrl) => {
      const newReport = await new Report({
        created_by: userId,
        title: 'test',
        body: text,
        url: photoUrl,
        template_id: templateId
      }).save();

      const user = await User.updateOne(
        {
          _id: userId
        },
        {
          $addToSet: { reports : newReport._id },
          $inc: { points: 5 }
        }
      );

      res.json({ message: 'Report uploaded successfully '});
    }
  } catch(err) {
    next(new Error(err));
  }
};

exports.addTemplate = async(req, res) => {
  try {
    const userId = req.params.user_id;
    const { templateId, price } = req.body;
    // 템플릿 가격 빼주기
    // 중복 체크 한번 더
    await User.updateOne(
      {
        _id: userId
      },
      {
        $addToSet: { templates : templateId },
        $inc: { points: -price }
      }
    );

    res.json({ res: user });
  } catch(err) {
    next(new Error(err));
  }
};
