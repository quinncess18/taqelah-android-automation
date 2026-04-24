# TEST_PLAN.md

Defines the test coverage and verification strategy for the Taqelah Android application.

## 1. Authentication Module
| Test ID | Description | Strategy | Status |
| :--- | :--- | :--- | :--- |
| **TC-L01** | should verify that the login page elements are visible | POM Visibility | ✅ Verified |
| **TC-L02** | should toggle password visibility and maintain layout stability | UI Interaction | ✅ Verified |
| **TC-L03** | should preserve credential state when backgrounded (Home) | Interruption | ✅ Verified |
| **TC-L04** | should lose unsaved credential state when exited (Back) | Interruption | ✅ Verified |
| **TC-L05** | should successfully login with valid demo credentials | E2E Flow | ✅ Verified |
| **TC-L06** | should persist session and successfully logout | App State | ✅ Verified |
| **TC-N01** | should show validation errors when fields are left empty | UI Validation | ✅ Verified |
| **TC-N02** | should show error for invalid username (format) | Negative | ✅ Verified |
| **TC-N03** | should show error for valid username with invalid password | Negative | ✅ Verified |

## 2. Catalog Module
| Test ID | Description | Strategy | Status |
| :--- | :--- | :--- | :--- |
| **TC-C01** | Homepage default state & full scroll | POM Visibility | ✅ Verified |
| **TC-C02** | "All Dresses" page default state | POM Visibility | ✅ Verified |
| **TC-C03** | Dynamic metadata updates during scroll | Data-Driven Loop | ⏳ Pending |

## 3. Shopping Cart
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
