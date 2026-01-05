describe("User Authentication API - Critical Paths", () => {
  const API_BASE = "/api/auth";

  describe("POST /api/auth/register", () => {
    it.only("creates a new user with valid credentials", () => {
      const username = `testuser_${Date.now()}`;
      const email = `test_${Date.now()}@example.com`;
      const password = "SecurePassword123!";

      cy.request({
        method: "POST",
        url: `${API_BASE}/register`,
        body: { username, email, password },
      }).then((response) => {
        expect(response.status).to.equal(201);
        expect(response.body).to.have.property("id");
        expect(response.body).to.have.property("username", username);
        expect(response.body).to.have.property("email", email);
        expect(response.body).to.have.property("emailVerified", false);
        expect(response.body).to.not.have.property("password");
      });
    });

    it("rejects registration with duplicate email", () => {
      const email = `duplicate_${Date.now()}@example.com`;
      const password = "SecurePassword123!";

      // Register first user
      cy.request({
        method: "POST",
        url: `${API_BASE}/register`,
        body: {
          username: `user1_${Date.now()}`,
          email,
          password,
        },
      });

      // Attempt to register second user with same email
      cy.request({
        method: "POST",
        url: `${API_BASE}/register`,
        body: {
          username: `user2_${Date.now()}`,
          email,
          password,
        },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.equal(400);
        expect(response.body.error).to.include("already exists");
      });
    });

    it("rejects registration with duplicate username", () => {
      const username = `duplicateuser_${Date.now()}`;
      const password = "SecurePassword123!";

      // Register first user
      cy.request({
        method: "POST",
        url: `${API_BASE}/register`,
        body: {
          username,
          email: `email1_${Date.now()}@example.com`,
          password,
        },
      });

      // Attempt to register second user with same username
      cy.request({
        method: "POST",
        url: `${API_BASE}/register`,
        body: {
          username,
          email: `email2_${Date.now()}@example.com`,
          password,
        },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.equal(400);
        expect(response.body.error).to.include("already taken");
      });
    });

    it("enforces password minimum length requirement", () => {
      cy.request({
        method: "POST",
        url: `${API_BASE}/register`,
        body: {
          username: `user_${Date.now()}`,
          email: `test_${Date.now()}@example.com`,
          password: "Short1!",
        },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.equal(400);
        expect(response.body.error).to.include("at least 8 characters");
      });
    });

    it("enforces valid email format", () => {
      cy.request({
        method: "POST",
        url: `${API_BASE}/register`,
        body: {
          username: `user_${Date.now()}`,
          email: "not-an-email",
          password: "SecurePassword123!",
        },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.equal(400);
        expect(response.body.error).to.include("Invalid email");
      });
    });

    it("enforces username format requirements", () => {
      cy.request({
        method: "POST",
        url: `${API_BASE}/register`,
        body: {
          username: "user@invalid!",
          email: `test_${Date.now()}@example.com`,
          password: "SecurePassword123!",
        },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.equal(400);
        expect(response.body.error).to.include(
          "letters, numbers, hyphens, and underscores"
        );
      });
    });

    it("enforces username minimum length", () => {
      cy.request({
        method: "POST",
        url: `${API_BASE}/register`,
        body: {
          username: "ab",
          email: `test_${Date.now()}@example.com`,
          password: "SecurePassword123!",
        },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.equal(400);
        expect(response.body.error).to.include("at least 3 characters");
      });
    });

    it("normalizes username and email to lowercase", () => {
      const username = `TestUser_${Date.now()}`;
      const email = `Test_${Date.now()}@Example.COM`;

      cy.request({
        method: "POST",
        url: `${API_BASE}/register`,
        body: {
          username,
          email,
          password: "SecurePassword123!",
        },
      }).then((response) => {
        expect(response.body.username).to.equal(username.toLowerCase());
        expect(response.body.email).to.equal(email.toLowerCase());
      });
    });

    it("does not expose password in response", () => {
      cy.request({
        method: "POST",
        url: `${API_BASE}/register`,
        body: {
          username: `user_${Date.now()}`,
          email: `test_${Date.now()}@example.com`,
          password: "SecurePassword123!",
        },
      }).then((response) => {
        expect(response.body).to.not.have.property("password");
        expect(JSON.stringify(response.body)).to.not.include(
          "SecurePassword123!"
        );
      });
    });
  });

  // describe("POST /api/auth/login", () => {
  //   it("authenticates user with valid credentials", () => {
  //     const username = `loginuser_${Date.now()}`;
  //     const email = `login_${Date.now()}@example.com`;
  //     const password = "SecurePassword123!";

  //     // Register user
  //     cy.request({
  //       method: "POST",
  //       url: `${API_BASE}/register`,
  //       body: { username, email, password },
  //     });

  //     // Login
  //     cy.request({
  //       method: "POST",
  //       url: `${API_BASE}/login`,
  //       body: { email, password },
  //     }).then((response) => {
  //       expect(response.status).to.equal(200);
  //       expect(response.body).to.have.property("id");
  //       expect(response.body).to.have.property("username", username);
  //       expect(response.body).to.have.property("email", email);
  //       expect(response.body).to.not.have.property("password");
  //     });
  //   });

  //   it("sets session cookie on successful login", () => {
  //     const username = `sessionuser_${Date.now()}`;
  //     const email = `session_${Date.now()}@example.com`;
  //     const password = "SecurePassword123!";

  //     cy.request({
  //       method: "POST",
  //       url: `${API_BASE}/register`,
  //       body: { username, email, password },
  //     });

  //     cy.request({
  //       method: "POST",
  //       url: `${API_BASE}/login`,
  //       body: { email, password },
  //     }).then((response) => {
  //       expect(response.headers).to.have.property("set-cookie");
  //       const cookie = response.headers["set-cookie"][0];
  //       expect(cookie).to.include("session=");
  //       expect(cookie).to.include("HttpOnly");
  //     });
  //   });

  //   it("rejects login with non-existent email", () => {
  //     cy.request({
  //       method: "POST",
  //       url: `${API_BASE}/login`,
  //       body: {
  //         email: `nonexistent_${Date.now()}@example.com`,
  //         password: "SecurePassword123!",
  //       },
  //       failOnStatusCode: false,
  //     }).then((response) => {
  //       expect(response.status).to.equal(401);
  //       expect(response.body.error).to.include("Invalid credentials");
  //     });
  //   });

  //   it("rejects login with incorrect password", () => {
  //     const email = `wrongpass_${Date.now()}@example.com`;

  //     cy.request({
  //       method: "POST",
  //       url: `${API_BASE}/register`,
  //       body: {
  //         username: `user_${Date.now()}`,
  //         email,
  //         password: "CorrectPassword123!",
  //       },
  //     });

  //     cy.request({
  //       method: "POST",
  //       url: `${API_BASE}/login`,
  //       body: {
  //         email,
  //         password: "WrongPassword123!",
  //       },
  //       failOnStatusCode: false,
  //     }).then((response) => {
  //       expect(response.status).to.equal(401);
  //       expect(response.body.error).to.include("Invalid credentials");
  //     });
  //   });

  //   it("allows login with email case insensitivity", () => {
  //     const email = `CaseSensitive_${Date.now()}@Example.COM`;
  //     const password = "SecurePassword123!";

  //     cy.request({
  //       method: "POST",
  //       url: `${API_BASE}/register`,
  //       body: {
  //         username: `user_${Date.now()}`,
  //         email,
  //         password,
  //       },
  //     });

  //     // Login with different case
  //     cy.request({
  //       method: "POST",
  //       url: `${API_BASE}/login`,
  //       body: {
  //         email: email.toLowerCase(),
  //         password,
  //       },
  //     }).then((response) => {
  //       expect(response.status).to.equal(200);
  //     });
  //   });

  //   it("does not leak user existence through timing or error messages", () => {
  //     const validEmail = `valid_${Date.now()}@example.com`;
  //     const invalidEmail = `invalid_${Date.now()}@example.com`;
  //     const password = "SecurePassword123!";

  //     // Register valid user
  //     cy.request({
  //       method: "POST",
  //       url: `${API_BASE}/register`,
  //       body: {
  //         username: `user_${Date.now()}`,
  //         email: validEmail,
  //         password,
  //       },
  //     });

  //     // Try login with non-existent user
  //     cy.request({
  //       method: "POST",
  //       url: `${API_BASE}/login`,
  //       body: { email: invalidEmail, password },
  //       failOnStatusCode: false,
  //     }).then((invalidResponse) => {
  //       // Try login with valid user but wrong password
  //       cy.request({
  //         method: "POST",
  //         url: `${API_BASE}/login`,
  //         body: { email: validEmail, password: "WrongPassword123!" },
  //         failOnStatusCode: false,
  //       }).then((wrongPassResponse) => {
  //         // Both should return same status and generic error message
  //         expect(invalidResponse.status).to.equal(401);
  //         expect(wrongPassResponse.status).to.equal(401);
  //         expect(invalidResponse.body.error).to.equal(
  //           wrongPassResponse.body.error
  //         );
  //       });
  //     });
  //   });
  // });

  // describe("POST /api/auth/verify-email", () => {
  //   it("verifies email with valid token", () => {
  //     const email = `verify_${Date.now()}@example.com`;
  //     const password = "SecurePassword123!";
  //     let userId: string;
  //     let verificationToken: string;

  //     // Register user
  //     cy.request({
  //       method: "POST",
  //       url: `${API_BASE}/register`,
  //       body: {
  //         username: `user_${Date.now()}`,
  //         email,
  //         password,
  //       },
  //     }).then((response) => {
  //       userId = response.body.id;
  //       expect(response.body.emailVerified).to.be.false;

  //       // In a real app, you'd get the token from email
  //       // For now, we'll need to get it somehow or have a test endpoint
  //       // Since we can't access the database, we need another way

  //       // Option 1: Have a test-only endpoint that returns the token
  //       // Option 2: Mock email service to capture token
  //       // Option 3: Include token in registration response (test mode only)
  //     });
  //   });

  //   it("rejects verification with invalid token", () => {
  //     cy.request({
  //       method: "POST",
  //       url: `${API_BASE}/verify-email`,
  //       body: { token: "invalid-token-12345" },
  //       failOnStatusCode: false,
  //     }).then((response) => {
  //       expect(response.status).to.equal(400);
  //       expect(response.body.error).to.include("Invalid verification token");
  //     });
  //   });

  //   it("rejects verification with already used token", () => {
  //     // This test demonstrates the need for observable token behavior
  //     // Without database access, we need the API to expose this state
  //   });
  // });

  // describe("POST /api/auth/forgot-password", () => {
  //   it("returns success for valid email", () => {
  //     const email = `reset_${Date.now()}@example.com`;

  //     cy.request({
  //       method: "POST",
  //       url: `${API_BASE}/register`,
  //       body: {
  //         username: `user_${Date.now()}`,
  //         email,
  //         password: "SecurePassword123!",
  //       },
  //     });

  //     cy.request({
  //       method: "POST",
  //       url: `${API_BASE}/forgot-password`,
  //       body: { email },
  //     }).then((response) => {
  //       expect(response.status).to.equal(200);
  //       expect(response.body).to.have.property("success", true);
  //     });
  //   });

  //   it("does not leak user existence for non-existent email", () => {
  //     // Security: should return success even for non-existent email
  //     cy.request({
  //       method: "POST",
  //       url: `${API_BASE}/forgot-password`,
  //       body: { email: `nonexistent_${Date.now()}@example.com` },
  //     }).then((response) => {
  //       // Should return 200 even if user doesn't exist
  //       // to prevent email enumeration attacks
  //       expect(response.status).to.equal(200);
  //       expect(response.body).to.have.property("success", true);
  //     });
  //   });
  // });

  // describe("POST /api/auth/reset-password", () => {
  //   it("rejects password reset if passwords do not match", () => {
  //     cy.request({
  //       method: "POST",
  //       url: `${API_BASE}/reset-password`,
  //       body: {
  //         token: "some-token",
  //         password: "NewPassword123!",
  //         confirmPassword: "DifferentPassword123!",
  //       },
  //       failOnStatusCode: false,
  //     }).then((response) => {
  //       expect(response.status).to.equal(400);
  //       expect(response.body.error).to.include("do not match");
  //     });
  //   });

  //   it("rejects invalid reset token", () => {
  //     cy.request({
  //       method: "POST",
  //       url: `${API_BASE}/reset-password`,
  //       body: {
  //         token: "invalid-reset-token",
  //         password: "NewPassword123!",
  //         confirmPassword: "NewPassword123!",
  //       },
  //       failOnStatusCode: false,
  //     }).then((response) => {
  //       expect(response.status).to.equal(400);
  //       expect(response.body.error).to.include("Invalid reset token");
  //     });
  //   });

  //   it("enforces password requirements during reset", () => {
  //     cy.request({
  //       method: "POST",
  //       url: `${API_BASE}/reset-password`,
  //       body: {
  //         token: "some-token",
  //         password: "short",
  //         confirmPassword: "short",
  //       },
  //       failOnStatusCode: false,
  //     }).then((response) => {
  //       expect(response.status).to.equal(400);
  //       expect(response.body.error).to.include("at least 8 characters");
  //     });
  //   });
  // });

  // describe("Authentication Flow Integration", () => {
  //   it("completes full registration and login flow", () => {
  //     const username = `fullflow_${Date.now()}`;
  //     const email = `fullflow_${Date.now()}@example.com`;
  //     const password = "SecurePassword123!";

  //     // Register
  //     cy.request({
  //       method: "POST",
  //       url: `${API_BASE}/register`,
  //       body: { username, email, password },
  //     }).then((registerResponse) => {
  //       expect(registerResponse.status).to.equal(201);
  //       expect(registerResponse.body.emailVerified).to.be.false;

  //       // Login (should work even without email verification)
  //       cy.request({
  //         method: "POST",
  //         url: `${API_BASE}/login`,
  //         body: { email, password },
  //       }).then((loginResponse) => {
  //         expect(loginResponse.status).to.equal(200);
  //         expect(loginResponse.body.id).to.equal(registerResponse.body.id);
  //       });
  //     });
  //   });

  //   it("prevents password reuse vulnerability", () => {
  //     const email = `reuse_${Date.now()}@example.com`;
  //     const oldPassword = "OldPassword123!";
  //     const newPassword = "NewPassword123!";

  //     // Register
  //     cy.request({
  //       method: "POST",
  //       url: `${API_BASE}/register`,
  //       body: {
  //         username: `user_${Date.now()}`,
  //         email,
  //         password: oldPassword,
  //       },
  //     });

  //     // Initiate password reset
  //     cy.request({
  //       method: "POST",
  //       url: `${API_BASE}/forgot-password`,
  //       body: { email },
  //     });

  //     // Without database access, we can't complete this test
  //     // This demonstrates the limitation of pure API testing
  //     // Alternative: Have test endpoint that returns token
  //   });
  // });

  // describe("Security Constraints", () => {
  //   it("enforces rate limiting on registration endpoint", () => {
  //     // Make multiple rapid requests
  //     const requests = Array.from({ length: 10 }, (_, i) =>
  //       cy.request({
  //         method: "POST",
  //         url: `${API_BASE}/register`,
  //         body: {
  //           username: `ratetest_${Date.now()}_${i}`,
  //           email: `ratetest_${Date.now()}_${i}@example.com`,
  //           password: "SecurePassword123!",
  //         },
  //         failOnStatusCode: false,
  //       })
  //     );

  //     // At least one should be rate limited
  //     cy.wrap(requests).then(() => {
  //       // This would need rate limiting implemented in the API
  //     });
  //   });

  //   it("session cookie has secure attributes in production", () => {
  //     if (Cypress.env("NODE_ENV") === "production") {
  //       const email = `secure_${Date.now()}@example.com`;
  //       const password = "SecurePassword123!";

  //       cy.request({
  //         method: "POST",
  //         url: `${API_BASE}/register`,
  //         body: {
  //           username: `user_${Date.now()}`,
  //           email,
  //           password,
  //         },
  //       });

  //       cy.request({
  //         method: "POST",
  //         url: `${API_BASE}/login`,
  //         body: { email, password },
  //       }).then((response) => {
  //         const cookie = response.headers["set-cookie"][0];
  //         expect(cookie).to.include("Secure");
  //         expect(cookie).to.include("SameSite=Strict");
  //       });
  //     }
  //   });
  // });
});
