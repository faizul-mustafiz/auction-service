import {
  testItemCreateRequestBody,
  testItemUpdateRequestBody,
  testBidRequestBody,
  testUserSignUpeRequestBody,
} from './common';
import { Server } from '../../../index';
import { AppConfig } from '../configs/app.config';
import { deleteDataFromRedis } from '../helpers/redis.helper';

/**
 * * import chai, chai-http dependencies
 * * also inject Server for mocha to run tests
 * * import should aggregator from chai
 * * import expect aggregator form chai
 * * use chai-http with chai to perform http request
 */
import chai from 'chai';
import chaiHttp from 'chai-http';
import { Item } from '../models/item.model';
import { ItemStatus } from '../enums/itemStatus.enum';
import { User } from '../models/user.model';
const { baseRoute } = AppConfig;
const should = chai.should();
chai.use(chaiHttp);

/**
 * * global variables needed for the entire test file
 */
let testItemId = '';
let verifyToken = '';
let verifyCode = '';
let accessToken = '';
let refreshToken = '';
/**
 * * all global variable reset method
 */
const resetAllTestVariables = () => {
  testItemId = '';
  verifyToken = '';
  verifyCode = '';
  accessToken = '';
  refreshToken = '';
};

/**
 * * item CRUD publish and bidding endpoint test cases
 */

describe('Item CRUD, publish and bidding endpoint tests', () => {
  /**
   * @before will run at the start of the test cases
   * * here we delete all the old data from items collection in auction_test_db
   */
  before((done) => {
    Item.deleteMany({}).then((result) => {
      done();
    });
  });

  /**
   * @after will run after the last test cases of the file
   * * here we reset all the global variables used for the entire test file
   * * also we do not need to perform any delete operation for item, as item delete
   * * test case does that for us.
   * * we need to flush redis data after test complete
   */
  after((done) => {
    resetAllTestVariables();
    deleteDataFromRedis();
    Item.deleteMany({}).then((result) => {
      User.deleteMany({}).then((result) => {
        done();
      });
    });
  });

  /**
   * * perform sign-up process test. Here this test will first request the /sign-up
   * * route and the get the verify token and code and using this token and code will
   * * compete sign-up using /verify route. for this verify request the accessToken
   * * and refreshToken will be stored in the global variables and used for the entire
   * * test cases of user controller. we do not need to perform users creation test as
   * * sign-up process will create one user for us
   */
  describe('[POST] /auth/sign-up |Sign-Up Process Test', () => {
    it('it should initiate sign-up process using route: [POST] /auth/sign-up', (done) => {
      chai
        .request(Server)
        .post(`${baseRoute}/auth/sign-up`)
        .send(testUserSignUpeRequestBody)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('success').eql(true);
          res.body.should.have.property('message');
          res.body.should.have.property('result');
          res.body.result.should.be.a('object');
          res.body.result.should.have.property('token');
          res.body.result.should.have.property('code');
          verifyToken = res.body.result.token;
          verifyCode = res.body.result.code;
          done();
        });
    });

    it('it should compete sign-up process by verifying using route: [POST] /auth/verify', (done) => {
      chai
        .request(Server)
        .post(`${baseRoute}/auth/verify`)
        .set('Authorization', `Bearer ${verifyToken}`)
        .send({ code: verifyCode })
        .end((err, res) => {
          res.should.have.status(201);
          res.body.should.be.a('object');
          res.body.should.have.property('success').eql(true);
          res.body.should.have.property('message');
          res.body.should.have.property('result');
          res.body.result.should.be.a('object');
          res.body.result.should.have
            .property('email')
            .eql(testUserSignUpeRequestBody.email);
          res.body.result.should.have.property('_id');
          res.body.result.should.have.property('accessToken');
          res.body.result.should.have.property('refreshToken');
          accessToken = res.body.result.accessToken;
          refreshToken = res.body.result.refreshToken;
          done();
        });
    });
  });

  /**
   * * create-one-item test case. here we will assign the returned objectId
   * * to our global variable testItemId. as this id will be used in our later test cases
   */
  describe('[POST] /items | Create One Item Process Test', () => {
    it('it should create-one-item in items collection', (done) => {
      chai
        .request(Server)
        .post(`${baseRoute}/items`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(testItemCreateRequestBody)
        .end((err, res) => {
          res.should.have.status(201);
          res.body.should.be.a('object');
          res.body.should.have.property('success').eql(true);
          res.body.should.have.property('message');
          res.body.should.have.property('result');
          res.body.result.should.be.a('object');
          res.body.result.should.have.property('_id');
          testItemId = res.body.result._id;
          res.body.result.should.have
            .property('name')
            .eql(testItemCreateRequestBody.name);
          res.body.result.should.have
            .property('startingPrice')
            .eql(testItemCreateRequestBody.startingPrice);
          res.body.result.should.have
            .property('duration')
            .eql(testItemCreateRequestBody.duration);
          res.body.result.should.have.property('isPublished').eql(false);
          res.body.result.should.have.property('status').eql(ItemStatus.draft);
          res.body.result.should.have.property('createdBy');
          res.body.result.should.have.property('created_at');
          res.body.result.should.have.property('updated_at');
          done();
        });
    });
  });

  /**
   * * get-all-item process test cases.
   */
  describe('[GET] /items | Get All Items Process Test', () => {
    it('it should get-all-items form items collection', (done) => {
      chai
        .request(Server)
        .get(`${baseRoute}/items`)
        .set('Authorization', `Bearer ${accessToken}`)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('success').eql(true);
          res.body.should.have.property('message');
          res.body.should.have.property('result');
          res.body.result.should.be.a('array');
          res.body.result[0].should.have.property('_id').eql(testItemId);
          res.body.result[0].should.have
            .property('name')
            .eql(testItemCreateRequestBody.name);
          res.body.result[0].should.have
            .property('startingPrice')
            .eql(testItemCreateRequestBody.startingPrice);
          res.body.result[0].should.have
            .property('duration')
            .eql(testItemCreateRequestBody.duration);
          res.body.result[0].should.have.property('isPublished').eql(false);
          res.body.result[0].should.have
            .property('status')
            .eql(ItemStatus.draft);
          res.body.result[0].should.have.property('createdBy');
          res.body.result[0].should.have.property('created_at');
          res.body.result[0].should.have.property('updated_at');
          done();
        });
    });
  });

  /**
   * * get-one-item process test cases
   */
  describe('[GET] /items/{id} | Get One Item Process Test', () => {
    it('it should get-one-item form items collection', (done) => {
      chai
        .request(Server)
        .get(`${baseRoute}/items/${testItemId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('success').eql(true);
          res.body.should.have.property('message');
          res.body.should.have.property('result');
          res.body.result.should.be.a('object');
          res.body.result.should.have.property('_id').eql(testItemId);
          res.body.result.should.have
            .property('name')
            .eql(testItemCreateRequestBody.name);
          res.body.result.should.have
            .property('startingPrice')
            .eql(testItemCreateRequestBody.startingPrice);
          res.body.result.should.have
            .property('duration')
            .eql(testItemCreateRequestBody.duration);
          res.body.result.should.have.property('isPublished').eql(false);
          res.body.result.should.have.property('status').eql(ItemStatus.draft);
          res.body.result.should.have.property('createdBy');
          res.body.result.should.have.property('created_at');
          res.body.result.should.have.property('updated_at');
          done();
        });
    });
  });

  /**
   * * update-one-item process test cases
   */
  describe('[POST] /items/{id} | Update One Item Process Test', () => {
    it('it should update-one-item form items collection', (done) => {
      chai
        .request(Server)
        .post(`${baseRoute}/items/${testItemId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(testItemUpdateRequestBody)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('success').eql(true);
          res.body.should.have.property('message');
          res.body.should.have.property('result');
          res.body.result.should.be.a('object');
          res.body.result.should.have.property('_id').eql(testItemId);
          res.body.result.should.have
            .property('name')
            .eql(testItemUpdateRequestBody.name);
          res.body.result.should.have
            .property('startingPrice')
            .eql(testItemUpdateRequestBody.startingPrice);
          res.body.result.should.have
            .property('duration')
            .eql(testItemUpdateRequestBody.duration);
          res.body.result.should.have.property('isPublished').eql(false);
          res.body.result.should.have.property('status').eql(ItemStatus.draft);
          res.body.result.should.have.property('createdBy');
          res.body.result.should.have.property('created_at');
          res.body.result.should.have.property('updated_at');
          done();
        });
    });
  });

  /**
   * * publish-one-item process test cases
   */
  describe('[POST] /items/publish/{id} | Publish One Item Process Test', () => {
    it('it should publish-one-item from items collection', (done) => {
      chai
        .request(Server)
        .post(`${baseRoute}/items/publish/${testItemId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('success').eql(true);
          res.body.should.have.property('message');
          res.body.should.have.property('result');
          res.body.result.should.be.a('object');
          res.body.result.should.have.property('_id').eql(testItemId);
          res.body.result.should.have
            .property('name')
            .eql(testItemUpdateRequestBody.name);
          res.body.result.should.have
            .property('startingPrice')
            .eql(testItemUpdateRequestBody.startingPrice);
          res.body.result.should.have
            .property('duration')
            .eql(testItemUpdateRequestBody.duration);
          res.body.result.should.have.property('isPublished').eql(true);
          res.body.result.should.have
            .property('status')
            .eql(ItemStatus.ongoing);
          res.body.result.should.have.property('createdBy');
          res.body.result.should.have.property('created_at');
          res.body.result.should.have.property('updated_at');
          res.body.result.should.have.property('windowStartTime');
          res.body.result.should.have.property('windowEndTime');
          done();
        });
    });
  });

  /**
   * * bid-one-item process test cases
   */
  describe('[POST] /bid/{id} | Bid One Item Process Test', () => {
    it('it should bid-one-item from items collection', (done) => {
      chai
        .request(Server)
        .post(`${baseRoute}/bid/${testItemId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(testBidRequestBody)
        .end((err, res) => {
          res.should.have.status(201);
          res.body.should.be.a('object');
          res.body.should.have.property('success').eql(true);
          res.body.should.have.property('message');
          res.body.should.have.property('result');
          res.body.result.should.be.a('object');
          res.body.result.should.have
            .property('lastHeightBid')
            .eql(testItemUpdateRequestBody.startingPrice);
          res.body.result.should.have
            .property('placesBid')
            .eql(testBidRequestBody.bid);
          done();
        });
    });
  });

  /**
   * * delete-one-item process test cases
   */
  describe('[DELETE] /items/{id} | Delete One Item Process Test', () => {
    it('it should delete-one-item form items collection', (done) => {
      chai
        .request(Server)
        .delete(`${baseRoute}/items/${testItemId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('success').eql(true);
          res.body.should.have.property('message');
          res.body.should.have.property('result');
          res.body.result.should.be.a('object');
          res.body.result.should.have.property('_id').eql(testItemId);
          res.body.result.should.have
            .property('name')
            .eql(testItemUpdateRequestBody.name);
          res.body.result.should.have
            .property('startingPrice')
            .eql(testItemUpdateRequestBody.startingPrice);
          res.body.result.should.have
            .property('duration')
            .eql(testItemUpdateRequestBody.duration);
          res.body.result.should.have.property('isPublished').eql(true);
          res.body.result.should.have
            .property('status')
            .eql(ItemStatus.ongoing);
          res.body.result.should.have.property('createdBy');
          res.body.result.should.have.property('created_at');
          res.body.result.should.have.property('updated_at');
          res.body.result.should.have.property('windowEndTime');
          res.body.result.should.have.property('windowStartTime');
          res.body.result.should.have
            .property('currentHighestBid')
            .eql(testBidRequestBody.bid);
          res.body.result.should.have.property('currentHighestBidder');
          done();
        });
    });
  });
});
