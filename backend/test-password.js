
const bcrypt = require("bcrypt");

async function testPassword() {
    const password = "TestPassword123";

    const passwordHash = await bcrypt.hash(
        password,
        10
    );

    const correctPassword = await bcrypt.compare(
        password,
        passwordHash
    );

    const wrongPassword = await bcrypt.compare(
        "WrongPassword",
        passwordHash
    );

    console.log("Correct Password:", correctPassword);
    console.log("Wrong Password:", wrongPassword);
}

testPassword();
