const request = require('supertest');
const { expect } = require('chai');
const app = require('../app');

const User = require('../models/User');
const Report = require('../models/Report');
const Template = require('../models/Template');

require('dotenv').config();

/*

Mock users

*/

describe('/api', function() {
  this.timeout(20000);
  const mongoose = require('mongoose');
  const db = mongoose.connection;

  const mockUsers = require('./users.json');
  const mockReports = require('./reports.json');
  const mockTemplates = require('./templates.json');

  let AUserId;
  let BUserId;
  let accessToken;
  let storedTemplates;

  const storeTemplates = async() => {
    for (let i = 0; i < mockTemplates.length; i++) {
      await new Template(mockTemplates[i]).save();
    }
  };

  const fetchAllTemplates = done => {
    storeTemplates().then(() => {
      Template.find().lean().exec(function (err, templates) {
        if (err) return done(err);
        storedTemplates = JSON.parse(JSON.stringify(templates));
        done();
      });
    });
  };

  const deleteAllData = done => {
    User.deleteMany({}, err => {
      if (err) return done(err);

      Report.deleteMany({}, err => {
        if (err) return done(err);

        Template.deleteMany({}, err => {
          if (err) return done(err);

          done();
        });
      });
    });
  };

  before(done => {
    console.log('start');

    (function checkDatabaseConnection() {
      if (db.readyState === 1) {
        return fetchAllTemplates(done);
      }

      setTimeout(checkDatabaseConnection, 1000);
    })();
  });

  after(done => {
    console.log('finish');
    return deleteAllData(done);
  });

  /*

  Create or Login User

  */

  describe('POST /auth/authenticate', () => {
    it('should add or find login user into the database', done => {
      request(app)
        .post('/api/auth/authenticate')
        .send(mockUsers[0])
        .end(async(err, res) => {
          if (err) return done(err);

          expect(res.body.message).to.exist;
          expect(res.body.message).to.eql('Logged in successfully');

          AUserId = res.body.user_id;
          accessToken = res.body.access_token;

          expect(res.body.user_id).to.exist;
          expect(mongoose.Types.ObjectId.isValid(AUserId)).to.be.true;

          expect(res.body.access_token).to.exist;
          expect(res.body.access_token).to.eql(accessToken);

          const addedUser = await User.findById(AUserId);

          expect(addedUser).to.exist;

          done();
        });
    });
  });

  /*

  Get User Data

  */

  describe('GET /users/:user_id', () => {

    it('should not get user data with invalid token', done => {
      request(app)
        .get(`/api/users/${AUserId}`)
        .set({ Authorization: 'Bearer fake', 'Content-Type': 'application/json' })
        .expect(500)
        .end(async(err, res) => {
          if (err) return done(err);

          expect(res.body.result).to.exist;
          expect(res.body.result).to.eql('err');

          done();
        });
    });

    it('should get user data with valid token', done => {

      request(app)
        .get(`/api/users/${AUserId}`)
        .set({ Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' })
        .end(async(err, res) => {
          if (err) return done(err);

          const user = await User.findById(AUserId);

          expect(res.body.message).to.exist;
          expect(res.body.message).to.eql('User found successfully');

          expect(user).to.exist;
          expect(user.name).to.eql(mockUsers[0].name);
          expect(user.email).to.eql(mockUsers[0].email);
          expect(user.profile_photo).to.eql(mockUsers[0].profilePhoto);

          done();
        });
    });

    it('should get user data with user email', done => {
      request(app)
        .post('/api/auth/authenticate')
        .send(mockUsers[1])
        .end(async(err, res) => {
          if (err) return done(err);
          BUserId = res.body.user_id;
        });

      request(app)
        .get(`/api/users/email/${mockUsers[1].email}`)
        .set({ Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' })
        .end(async(err, res) => {
          if (err) return done(err);

          expect(res.body.message).to.exist;
          expect(res.body.message).to.eql('User found successfully');

          const userA = await User.findOne({ email: mockUsers[1].email });
          const userB = await User.findById(BUserId);

          expect(userA).to.exist;
          expect(userA.name).to.eql(userB.name);
          expect(userA.email).to.eql(userB.email);
          expect(userA.profile_photo).to.eql(userB.profile_photo);

          done();
        });
    });
  });

  /*

  Create New Report

  */

  describe('POST /users/:user_id/reports', () => {
    const newReport = {
      photo: 'http://',
      text: 'test',
      templateId: mockTemplates[0]._id,
      date: new Date().toDateString()
    };

    xit('should not create new report with invalid token', done => {
      request(app)
        .post(`/api/users/${AUserId}/reports`)
        .set({ Authorization: 'Bearer fake', 'Content-Type': 'multipart/form-data' })
        .send(newReport)
        .end(async(err, res) => {
          if (err) return done(err);

          expect(res.body.message).to.not.exist;
          expect(res.body.result).to.exist;
          expect(res.body.result).to.eql('err');

          done();
        });
    });

    xit('should create new report with valid token', done => {
      request(app)
        .post(`/api/users/${AUserId}/reports`)
        .set({ Authorization: `Bearer ${accessToken}`, 'Content-Type': 'multipart/form-data' })
        .send(newReport)
        .end(async(err, res) => {
          if (err) return done(err);
          console.log(res.body, 'here?');
          done();
        });
    });
  });

  /*

  Get User Reports

  */

  describe('GET /users/:user_id/reports', () => {

    it('should return empty array when user has no reports', done => {
      request(app)
        .get(`/api/users/${AUserId}/reports`)
        .set({ Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' })
        .end(async(err, res) => {
          if (err) return done(err);

          expect(res.body.message).to.exist;
          expect(res.body.message).to.eql('User reports loaded successfully');

          const user = await User.findById(AUserId);
          const reports = await Report.find({ created_by: AUserId });

          expect(reports.length).to.eql(user.reports.length);
          done();
        });
    });
  });

  /*

  Update User Templates

  */

  describe('PUT /api/users/:user_id/templates', () => {
    it('should not add any templates with invalid token', done => {
      request(app)
        .put(`/api/users/${AUserId}/templates`)
        .set({ Authorization: 'Bearer fake', 'Content-Type': 'application/json' })
        .send({ templateId: storedTemplates[0]._id, price: storedTemplates[0].points })
        .end(async(err, res) => {
          if (err) return done(err);

          expect(res.body.result).to.exist;
          expect(res.body.result).to.eql('err');
          done();
        });
    });

    it('should add user templates with valid token', done => {
      request(app)
        .put(`/api/users/${AUserId}/templates`)
        .set({ Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' })
        .send({ templateId: storedTemplates[0]._id, price: storedTemplates[0].points })
        .end(async(err, res) => {
          if (err) return done(err);

          expect(res.body.message).to.exist;
          expect(res.body.message).to.eql('Template added successfully');

          const user = await User.findById(AUserId).populate('templates');
          const template = await Template.findById(storedTemplates[0]._id);

          expect(user.templates.length).to.not.eql(0);
          expect(user.templates[0].name).to.eql(template.name);
          done();
        });
    });
  });

  /*

  Get User Templates

  */

  describe('GET /api/users/:user_id/templates', () => {

    it('should not return any templates with invalid token', done => {
      request(app)
        .get(`/api/users/${AUserId}/templates`)
        .set({ Authorization: 'Bearer fake', 'Content-Type': 'application/json' })
        .end(async(err, res) => {
          if (err) return done(err);

          expect(res.body.result).to.exist;
          expect(res.body.result).to.eql('err');
          done();
        });
    });

    it('should return all templates user has with valid token', done => {
      request(app)
        .get(`/api/users/${AUserId}/templates`)
        .set({ Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' })
        .end(async(err, res) => {
          if (err) return done(err);
          const userTemplate = res.body.templates[0];

          expect(res.body.message).to.exist;
          expect(res.body.message).to.eql('User templates loaded successfully');

          const template = await Template.findById(userTemplate._id);

          expect(template).to.exist;
          expect(userTemplate.name).to.eql(template.name);

          done();
        });
    });
  });

  /*

  Get All Templates

  */

  describe('GET /api/templates', () => {

    it('should not return any templates with invalid token', done => {
      request(app)
        .get('/api/templates')
        .set({ Authorization: 'Bearer fake', 'Content-Type': 'application/json' })
        .end(async(err, res) => {
          if (err) return done(err);

          expect(res.body.result).to.exist;
          expect(res.body.result).to.eql('err');
          done();
        });
    });

    it('should return all templates with valid token', done => {
      request(app)
        .get('/api/templates')
        .set({ Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' })
        .end(async(err, res) => {
          if (err) return done(err);

          expect(res.body.message).to.exist;
          expect(res.body.message).to.eql('Templates loaded successfully');

          const templates = await Template.find();

          expect(templates.length).to.eql(storedTemplates.length);
          expect(templates[0].name).to.eql(storedTemplates[0].name);
          expect(templates[1].url).to.eql(storedTemplates[1].url);
          done();
        });
    });
  });

  /*

  Delete Report

  */

  describe('DELETE /api/users/:user_id/reports/:report_id', () => {

    xit('should not delete any reports with invalid token', done => {
      request(app)
        .delete(`/api/users/${AUserId}/reports/:report_id`)
        .set({ Authorization: 'Bearer fake', 'Content-Type': 'application/json' })
        .end(async(err, res) => {
          if (err) return done(err);

          expect(res.body.result).to.exist;
          expect(res.body.result).to.eql('err');
          done();
        });
    });

    xit('should delete report with valid token', done => {
      request(app)
        .delete(`/api/users/${AUserId}/reports/:report_id`)
        .set({ Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' })
        .end(async(err, res) => {
          if (err) return done(err);

          expect(res.body.message).to.exist;
          expect(res.body.message).to.eql('Templates loaded successfully');

          const templates = await Template.find();

          expect(templates.length).to.eql(storedTemplates.length);
          expect(templates[0].name).to.eql(storedTemplates[0].name);
          expect(templates[1].url).to.eql(storedTemplates[1].url);
          done();
        });
    });
  });
});
