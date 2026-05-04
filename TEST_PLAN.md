# TEST_PLAN.md

Defines the test coverage and verification strategy for the Taqelah mobile application.

**Current scope:** Android emulators (Pixel 8, Pixel Tablet) — full 28/28 baseline on both.
**Roadmap:** iOS platform support (iPhone 15 Pro, iPad) post-June workshop.

> Status legend: ✅ Verified · ⚠️ Under investigation · ⏳ Pending · — Not applicable

## 1. Authentication Module
| Test ID | Description | Strategy | Pixel 8 | Pixel Tablet |
| :--- | :--- | :--- | :---: | :---: |
| **TC-L01** | should verify that the login page elements are visible | Universal POM | ✅ | ✅ |
| **TC-L02** | should toggle password visibility and maintain layout stability | Safe-Zone Interaction | ✅ | ✅ |
| **TC-L03** | should preserve credential state when backgrounded (Home) | Universal Interruption | ✅ | ✅ |
| **TC-L04** | should clear unsaved credential state when exited (Back) | Android-Only Interruption | ✅ | ✅ |
| **TC-L05** | should successfully login with valid demo credentials | Universal E2E | ✅ | ✅ |
| **TC-L06** | should persist session and successfully logout | Universal App State | ✅ | ✅ |
| **TC-N01** | should show validation errors when fields are left empty | Universal POM | ✅ | ✅ |
| **TC-N02** | should show error for invalid username (format) | Universal Negative | ✅ | ✅ |
| **TC-N03** | should show error for valid username with invalid password | Universal Negative | ✅ | ✅ |

## 2. Catalog Module
| Test ID | Description | Strategy | Pixel 8 | Pixel Tablet |
| :--- | :--- | :--- | :---: | :---: |
| **TC-C01** | Homepage default state, scroll to last category, reset to top | Universal Safe-Zone | ✅ | ✅ |
| **TC-C02** | Cart empty state from Homepage | Universal POM | ✅ | ✅ |
| **TC-C03** | "All Dresses" page default state (alpha-first anchor) | Universal POM | ✅ | ✅ |
| **TC-C04** | Full Catalog Data Integrity (32-item visual scan) | Data-Driven Audit | ✅ | ✅ |
| **TC-C05** | All four sorting modes verified against Universal Truths | Universal Anchor | ✅ | ✅ |
| **TC-C06** | Cart empty state from Grid | Universal POM | ✅ | ✅ |
| **TC-C07** | "View All" hyperlink routing | Universal E2E | ✅ | ✅ |
| **TC-C08** | Casual Dresses data + sort + cart integrity | Data-Driven | ✅ | ✅ |
| **TC-C09** | Evening Dresses data + sort + cart integrity | Data-Driven | ✅ | ✅ |
| **TC-C10** | Party Dresses data + sort + cart integrity | Data-Driven | ✅ | ✅ |
| **TC-C11** | Boho Dresses data + sort + cart integrity | Data-Driven | ✅ | ✅ |

## 3. Navigation & Gestures
| Test ID | Description | Strategy | Pixel 8 | Pixel Tablet |
| :--- | :--- | :--- | :---: | :---: |
| **TC-M01** | Nav Menu default state + Home routing (above & below fold) | Functional E2E | ✅ | ✅ |
| **TC-M02** | Cart routing from drawer + empty state | Functional E2E | ✅ | ✅ |
| **TC-M03** | About routing + content integrity + Dark Mode toggle (pixel-sampled) | Component + Pixel Sample | ✅ | ✅ |
| **TC-M04** | Randomized sequential swipe (favorite/delete) for 5 cards | W3C Pointer Actions | ✅ | ✅ |
| **TC-M05** | Randomized drag-and-drop reorder with state tracking | Long-press Drag | ✅ | ✅ |
| **TC-M06** | Long-press popup with all three option interactions | Pointer + Toast | ✅ | ✅ |
| **TC-M07** | Double-tap to zoom + pan canvas, verify content via pixel scan | mobile:doubleClickGesture | ✅ | ✅ |
| **TC-M08** | Pinch to zoom + full page reset verification | Multi-finger Pointer | ✅ | ✅ |

> **Tablet-specific implementations** (phone path is byte-identical to before):
> - `getPinchCenterBrightness` uses a dark-pixel count across the full canvas on tablet (sparse icons in a wide canvas defeat a 3×3 brightness average).
> - `verifyCanvasHasContent` uses a dense canvas-wide scan on tablet (after pan, the icon moves ~1748px — well outside a small center cross).
> - `scrollToDragSection` adds a single page bump on tablet, anchored to the white-space gap below `swipeCard(5)`, so all 5 drag items enter the accessibility tree after re-navigation.

## 4. Shopping Cart (planned)
| Test ID | Description | Strategy | Status |
| :--- | :--- | :--- | :---: |
| **TC-S01** | Add single item to cart | E2E Flow | ⏳ |
| **TC-S02** | Update item quantity in cart | UI Interaction | ⏳ |
| **TC-S03** | Remove item from cart | UI Interaction | ⏳ |

## 5. Checkout (planned)
| Test ID | Description | Strategy | Status |
| :--- | :--- | :--- | :---: |
| **TC-K01** | Complete purchase flow (Guest/User) | Full E2E | ⏳ |
| **TC-K02** | Form validation on checkout | Negative | ⏳ |
