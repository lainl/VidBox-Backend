const request = require('supertest');
const chai = require('chai');
const expect = chai.expect;
const app = require('../index'); 

describe('Auth: Login & Logout', function () {
    let accessToken;
    let refreshToken;

    it('Should register a new user', async function () {
        const response = await request(app)
            .post('/user')
            .send({
                username: 'testUser',
                password: 'testPassword',
                email: 'test@example.com'
            });

        expect(response.status).to.equal(201);
        expect(response.body).to.have.property('username', 'testUser');
    });

    it('Should login successfully', async function () {
        const response = await request(app)
            .post('/login')
            .send({
                username: 'testUser',
                password: 'testPassword'
            });

        expect(response.status).to.equal(200);
        expect(response.body).to.have.property('accessToken');
        expect(response.body).to.have.property('refreshToken');

        accessToken = response.body.accessToken;
        refreshToken = response.body.refreshToken;
    });

    it('Should access protected route with valid token', async function () {
        const response = await request(app)
            .get('/testAuthPage')
            .set('Authorization', `Bearer ${accessToken}`);

        expect(response.status).to.equal(200);
        expect(response.body).to.have.property('message');
    });

    it('Should logout and blacklist the access token', async function () {
        const response = await request(app)
            .post('/logout')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({ refreshToken });

        expect(response.status).to.equal(200);
        expect(response.body).to.have.property('message', 'Logged out successfully, access token revoked.');
    });

    it('Should deny access to protected route after logout', async function () {
        const response = await request(app)
            .get('/testAuthPage')
            .set('Authorization', `Bearer ${accessToken}`);

        expect(response.status).to.equal(401);
        expect(response.body).to.have.property('error', 'Token revoked. Please log in again.');
    });

    it('Should not allow refresh with revoked token', async function () {
        const response = await request(app)
            .post('/refresh-token')
            .send({ refreshToken });

        expect(response.status).to.equal(403);
        expect(response.body).to.have.property('error', 'Invalid refresh token.');
    });
});

//mainly chat gpt generated file
