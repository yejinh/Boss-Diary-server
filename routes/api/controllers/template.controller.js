const Template = require('../../../models/Template');

exports.getAll = async(req, res, next) => {
  try {
    const templates = await Template.find();

    res.json({
      message: 'Templates loaded successfully',
      templates: templates
    });

  } catch(err) {
    next(new Error(err));
  }
};
