const randomstring = require('randomstring');
const username = randomstring.generate();
const email = `${username}@test.com`;
const password = 'greaterthanten';


describe('Login', () => {
	it('should display the sign in form', () => {
		cy
			.visit('/login')
			.get('h1').contains('login')
			.get('form')
			.get('input[disabled]')
			.get('.validation-list')
			.get('.validation-list > .error').first().contains(
				'Email is required.');
	});

	it('should allow a user to sign in', () => {
		// register user
		cy
			.visit('/register')
			.get('input[name="username"]').type(username)
			.get('input[name="email"]').type(email)
			.get('input[name="password"]').type(password)
			.get('input[type="submit"]').click()
		// log a user out
		cy
			.contains('Log Out').click();
		// log a user in
		cy
			.get('a').contains('Log In').click()
			.get('input[name="email"]').type(email)
			.get('input[name="password"]').type(password)
			.get('input[type="submit"]').click()
			.wait(100);
		// assert user is redirected to '/'
		// assert '/' is displayed properly
		// cy.get('.navbar-collapse').click();
		cy.get('.alert-success').contains('Welcome!');
		cy.contains('Users').click(); // New
		cy.contains('All Users');
		cy
			.get('table')
			.find('tbody > tr').last()
			.find('td').contains(username);
		cy.get('.alert-success').contains('Welcome!');
		cy.get('.navbar-nav').within(() => {
			cy
				.get('a').contains('User Status')
				.get('a').contains('Log Out')
				.get('a').contains('Log In').should('not.be.visible')
				.get('a').contains('Register').should('not.be.visible');
		});
		cy.location().should((loc) => { expect(loc.pathname).to.eq('/all-users') });
		// log a user out
		cy
			.get('a').contains('Log Out').click();
		// assert '/logout' is displayed properly
		cy.get('p').contains('You are now logged out');
		cy.get('.navbar-nav').within(() => {
			cy
				.get('a').contains('User Status').should('not.be.visible')
				.get('a').contains('Log Out').should('not.be.visible')
				.get('a').contains('Log In')
				.get('a').contains('Register');
		});
	});

	it('should throw an error if the credentials are incorrect', () => {
		// attempt to log in
		cy
			.visit('/login')
			.get('input[name="email"]').type('incorrect@email.com')
			.get('input[name="password"]').type(password)
			.get('input[type="submit"]').click();
		// assert user login failed
		cy.contains('All Users').should('not.be.visible');
		cy.contains('login');
		cy.get('.navbar-collapse').click();
		cy.get('.navbar-nav').within(() => {
		cy
			.get('a').contains('User Status').should('not.be.visible')
			.get('a').contains('Log Out').should('not.be.visible')
			.get('a').contains('Log In')
			.get('a').contains('Register');
		});
		cy
			.get('.alert-success').should('not.be.visible')
			.get('.alert-danger').contains('User does not exist.');
		// attempt to log in
		cy
			.get('a').contains('Log In').click()
			.get('input[name="email"]').type(email)
			.get('input[name="password"]').type('incorrectpassword')
			.get('input[type="submit"]').click()
			.wait(100);
			// assert user login failed
			cy.contains('All Users').should('not.be.visible');
			cy.contains('login');
			cy.get('.navbar-collapse').click();
			cy.get('.navbar-nav').within(() => {
			cy
				.get('a').contains('User Status').should('not.be.visible')
				.get('a').contains('Log Out').should('not.be.visible')
				.get('a').contains('Log In')
				.get('a').contains('Register');
			});
			cy
				.get('.alert-success').should('not.be.visible')
				.get('.alert-danger').contains('User does not exist.');
		});
});