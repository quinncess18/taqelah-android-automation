// @ts-check

/**
 * Form Validation Test Data — The Source of Truth for Form Validation tests.
 * Contains valid/invalid test data and expected error messages.
 */
module.exports = {
  // Valid test data for happy path submission (used by TC-F02)
  valid: {
    name: "Jane Doe",
    altName: "John Smith", // used by TC-F05 to vary the valid Name input
    email: "jane.doe@example.com",
    phone: "+1-555-123-4567",
    number: 42,
    password: "SecureP@ss1",
    category: "Casual",
    size: "Medium",
    rating: 3
  },

  // Alternate valid set (used by TC-F03 + TC-F06) — different name/email/
  // phone/number/password so each happy-path submission proves a distinct
  // input rather than re-running F02's data.
  validAlt: {
    name: "Alex Tan",
    email: "alex.tan@taqelah.sg",
    phone: "+65-9876-5432",
    number: 7,
    password: "P@ssw0rd123",
  },

  // Invalid test data for negative testing
  invalid: {
    // Emails with invalid format — both should trigger "Enter a valid email".
    // Two cases cover the two distinct failure modes: missing @, missing domain.
    emails: [
      "notanemail",
      "user@"
    ],
    // Phones with fewer than 10 digits — both should trigger "At least 10 digits".
    // "abc" is excluded — the phone EditText filters non-digit input to empty,
    // which triggers "Phone is required" (wrong error) instead of the digit-count error.
    phones: [
      "12345",
      "555-123"
    ],
    // Passwords shorter than 6 characters — all should trigger "Min 6 characters"
    passwords: [
      "Ab1",
      "Short"
    ],
    // Number values outside the 1-100 range — should trigger "Enter 1-100"
    numberOutOfRange: [0, 101]
  },
};
