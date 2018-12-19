const randomstring = require('randomstring');
const username = randomstring.generate();
const email = `${username}@test.com`;
const password = 'greaterthanten';


describe('Status', () => {
	it('should not display user info if a user is not logged in', () => {
		cy
			.visit('/status')
			.get('p').contains('You must be logged in to view this.')
			.get('a').contains('User Status').should('not.be.visible')
			.get('a').contains('Log Out').should('not.be.visible')
			.get('a').contains('Register')
			.get('a').contains('Log In');
	});
});