# TEST_PLAN.md

Defines the test coverage and verification strategy for the Taqelah Android application.

## 1. Authentication Module
| Test ID | Description | Strategy | Status |
| :--- | :--- | :--- | :--- |
| **TC-L01** | should verify that the login page elements are visible | Universal POM | ✅ Verified |
| **TC-L02** | should toggle password visibility and maintain layout stability | Safe-Zone Interaction | ✅ Verified |
| **TC-L03** | should preserve credential state when backgrounded (Home) | Universal Interruption | ✅ Verified |
| **TC-L04** | should lose unsaved credential state when exited (Back) | Android-Only Interruption | ✅ Verified |
| **TC-L05** | should successfully login with valid demo credentials | Universal E2E | ✅ Verified |
| **TC-L06** | should persist session and successfully logout | Universal App State | ✅ Verified |
| **TC-N01** | should show validation errors when fields are left empty | Universal POM | ✅ Verified |
| **TC-N02** | should show error for invalid username (format) | Universal Negative | ✅ Verified |
| **TC-N03** | should show error for valid username with invalid password | Universal Negative | ✅ Verified |

## 2. Catalog Module
| Test ID | Description | Strategy | Status |
| :--- | :--- | :--- | :--- |
| **TC-C01** | Homepage default state & full scroll | Universal Safe-Zone | ✅ Verified |
| **TC-C02** | Cart icon and empty state verification | Universal POM | ✅ Verified |
| **TC-C03** | "All Dresses" page default state | Universal POM | ✅ Verified |
| **TC-C04** | Dynamic metadata updates during scroll | Universal Loop | ✅ Verified |
| **TC-C05** | Sorting functionality and scroll reset | Universal Reset | ✅ Verified |
| **TC-C06** | Cart empty state from Grid | Universal POM | ✅ Verified |
| **TC-C07** | "View All" hyperlink navigation | Universal E2E | ✅ Verified |
| **TC-C08** | Casual Dresses Data Integrity | Data-Driven | ✅ Verified |
| **TC-C09** | Evening Dresses Data Integrity | Data-Driven | ✅ Verified |
| **TC-C10** | Party Dresses Data Integrity | Data-Driven | ✅ Verified |
| **TC-C11** | Boho Dresses Data Integrity | Data-Driven | ✅ Verified |

## 3. Navigation & Utility
| Test ID | Description | Strategy | Status |
| :--- | :--- | :--- | :--- |
| **TC-M01** | Global Routing Audit (12+ Items) | Functional E2E | ⏳ Pending |
| **TC-M02** | Dark Mode Theme Toggle | Component Interaction | ⏳ Pending |
| **TC-M03** | Structural Boundary Verification | Negative Boundary | ⏳ Pending |
| **TC-M04** | Drawer Persistence & Scroll Lock | State Integrity | ⏳ Pending |
| **TC-M05** | Centralized Logout Lifecycle | Destructive Flow | ⏳ Pending |

## 4. Shopping Cart
| Test ID | Description | Strategy | Status |
| :--- | :--- | :--- | :--- |
| **TC-S01** | Add single item to cart | E2E Flow | ⏳ Pending |
| **TC-S02** | Update item quantity in cart | UI Interaction | ⏳ Pending |
| **TC-S03** | Remove item from cart | UI Interaction | ⏳ Pending |

## 4. Checkout
| Test ID | Description | Strategy | Status |
| :--- | :--- | :--- | :--- |
| **TC-K01** | Complete purchase flow (Guest/User) | Full E2E | ⏳ Pending |
| **TC-K02** | Form validation on checkout | Negative | ⏳ Pending |
