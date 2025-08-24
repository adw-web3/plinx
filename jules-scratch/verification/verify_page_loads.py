from playwright.sync_api import sync_playwright, expect

def run_verification():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        try:
            # Navigate to the correct page with the /app basePath
            page.goto("http://localhost:3000/app", timeout=60000)

            # Expect the "Connect Wallet" link to be visible.
            # The component is an 'a' tag, so we look for a link.
            connect_wallet_link = page.get_by_role("link", name="Connect Wallet")
            expect(connect_wallet_link).to_be_visible(timeout=30000)

            # Check that it is centered, which implies styles are loaded correctly
            bounding_box = connect_wallet_link.bounding_box()
            page_viewport_size = page.viewport_size

            if bounding_box and page_viewport_size:
                # Check if the button is roughly in the center
                center_x = bounding_box['x'] + bounding_box['width'] / 2
                page_center_x = page_viewport_size['width'] / 2

                # Allow for some tolerance
                assert abs(center_x - page_center_x) < 50, "Button is not horizontally centered."

            # Take a screenshot of the initial state
            page.screenshot(path="jules-scratch/verification/simplified_test.png")
            print("Simplified verification script completed successfully.")

        except Exception as e:
            print(f"An error occurred during simplified verification: {e}")
            page.screenshot(path="jules-scratch/verification/simplified_test_error.png")
            with open("jules-scratch/verification/simplified_test_error.html", "w") as f:
                f.write(page.content())
            raise
        finally:
            browser.close()

if __name__ == "__main__":
    run_verification()
