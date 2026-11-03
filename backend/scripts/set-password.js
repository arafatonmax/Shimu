
const fs = require("fs/promises");
const path = require("path");
const bcrypt = require("bcrypt");
const readline = require("readline/promises");

// Accounts JSON file
const accountsFilePath = path.join(
    __dirname,
    "../data/accounts.json"
);

// Readline interface
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

async function setPassword() {
    try {
        // Read username
        const username = (
            await rl.question("Enter username: ")
        ).trim();

        if (!username) {
            console.log("Username is required.");
            return;
        }

        // Read accounts JSON
        const fileContent = await fs.readFile(
            accountsFilePath,
            "utf-8"
        );

        const jsonData = JSON.parse(fileContent);

        if (!Array.isArray(jsonData.accounts)) {
            throw new Error("Invalid accounts data");
        }

        // Find account
        const account = jsonData.accounts.find(
            (item) => item.username === username
        );

        if (!account) {
            console.log("Account not found.");
            return;
        }

        // Check account status
        if (account.account_status !== "active") {
            console.log("Cannot set password for inactive account.");
            return;
        }

        // Read password
        const password = await rl.question(
            "Enter temporary password: "
        );

        const confirmPassword = await rl.question(
            "Confirm password: "
        );

        // Validate password
        if (password.length < 8) {
            console.log(
                "Password must be at least 8 characters."
            );
            return;
        }

        if (password !== confirmPassword) {
            console.log("Passwords do not match.");
            return;
        }

        // Generate bcrypt hash
        const passwordHash = await bcrypt.hash(
            password,
            10
        );

        // Update account
        account.password_hash = passwordHash;
        account.must_change_password = true;

        // Save JSON
        const updatedData = JSON.stringify(
            jsonData,
            null,
            2
        );

        const tempFilePath = accountsFilePath + ".tmp";

        await fs.writeFile(
            tempFilePath,
            updatedData,
            "utf-8"
        );

        await fs.rename(
            tempFilePath,
            accountsFilePath
        );

        console.log("--------------------------------");
        console.log("Password setup successful!");
        console.log("Username:", account.username);
        console.log("Role:", account.role);
        console.log("Password hash saved.");
        console.log("Must change password: true");
        console.log("--------------------------------");

    } catch (error) {
        console.error("Password setup failed:", error.message);
    } finally {
        rl.close();
    }
}

setPassword();
