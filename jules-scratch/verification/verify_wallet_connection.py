from playwright.sync_api import sync_playwright, expect

def run_verification():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        try:
            # Navigate to the correct page with the /app basePath
            page.goto("http://localhost:3000/app", timeout=60000)

            # Expect the "Connect Wallet" link to be visible
            connect_wallet_link = page.get_by_role("link", name="Connect Wallet")
            expect(connect_wallet_link).to_be_visible(timeout=30000)

            # Take a screenshot of the initial state
            page.screenshot(path="jules-scratch/verification/01_initial_state.png")

            # Click the "Connect Wallet" link
            # NOTE: In a real scenario, this would open a wallet extension modal.
            # Playwright cannot interact with browser extensions by default.
            # However, for this test, the mock connector should handle this "click"
            # and change the state of the application directly.
            connect_wallet_link.click()

            # Wait for the "Disconnect" link to appear.
            disconnect_link = page.get_by_role("link", name="Disconnect")
            expect(disconnect_link).to_be_visible(timeout=30000)

            # We also expect the NiebieskaKarta to appear, which contains the address
            address_card = page.get_by_text("Address:")
            expect(address_card).to_be_visible(timeout=10000)

            # Take a screenshot of the connected state
            page.screenshot(path="jules-scratch/verification/02_connected_state.png")
            print("Verification script completed successfully.")

        except Exception as e:
            print(f"An error occurred during verification: {e}")
            # On error, save the HTML to a file for debugging
            page.screenshot(path="jules-scratch/verification/error_screenshot.png")
            with open("jules-scratch/verification/error_page_source.html", "w") as f:
                f.write(page.content())
            raise # re-raise the exception to fail the script
        finally:
            browser.close()

if __name__ == "__main__":
    run_verification()
