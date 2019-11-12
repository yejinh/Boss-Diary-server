const request = require('supertest');
const { expect } = require('chai');
const jwt = require('jsonwebtoken');
const app = require('../app');
require('dotenv').config();

const user = { email: 4, name: 'test', picture: 'http://' };

describe('/api', function() {
  this.timeout(10000);
  const mongoose = require('mongoose');
  const db = mongoose.connection;

  const Report = require('../models/Report');
  const mockReports = require('./reports.json');
  let storedReports;

  const storeMockReports = async () => {
    for (let i = 0; i < mockReports.length; i++) {
      await new Report(mockReports[i]).save();
    }
  };

  const fetchAllReports = done => {
    storeMockReports().then(() => {
      Report.find().lean().exec(function (err, reports) {
        if (err) return done(err);
        storedReports = JSON.parse(JSON.stringify(reports));
        done();
      });
    });
  };

  const deleteAllReports = done => {
    // 위에서 생성한 데이터만 지워야하는데.?
    Report.deleteMany({}, function (err) {
      if (err) return done(err);
      storedReports = null;
      done();
    });
  };

  before(done => {
    (function checkDatabaseConnection() {
      if (db.readyState === 1) {
        return done();
      }

      setTimeout(checkDatabaseConnection, 1000);
    })();
  });

  describe('', () => {
    beforeEach(fetchAllReports);
    afterEach(deleteAllReports);

    it('should generate token to login user', done => {
      request(app)
        .post('/api/auth/authenticate')
        .send({ email: 4, name: 'test', picture: 'http://' })
        .expect('Content-Type', /json/)
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.body).to.eql({
            result: 'logged in successfully',
            user_id: 'qwer',
            access_token: jwt.sign(user, process.env.SECRET_KEY)
          });
          done();
        });
    });
  });

});
