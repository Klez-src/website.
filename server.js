const express = require('express');
const fs = require('fs').promises;
const cors = require('cors');
const app = express();
const PORT = 3000;
const HTML_FILE = '123.html';

app.use(cors());
app.use(express.json());

// In-memory user list for validation
let users = [];

app.post('/signup', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }

    if (users.find(user => user.username === username)) {
        return res.status(400).json({ message: 'Username already exists' });
    }

    users.push({ username, password });

    try {
        // Read current 123.html
        let htmlContent = await fs.readFile(HTML_FILE, 'utf8');

        // Update user list in HTML
        const userListStart = htmlContent.indexOf('<ul id="user-list"');
        const userListEnd = htmlContent.indexOf('</ul>', userListStart) + 5;
        const beforeList = htmlContent.substring(0, userListEnd - 5);
        const afterList = htmlContent.substring(userListEnd - 5);
        const newUserItem = `<li class="py-2">${username}</li>`;
        htmlContent = beforeList + newUserItem + afterList;

        // Update users array in script tag
        const scriptStart = htmlContent.indexOf('const users = [');
        const scriptEnd = htmlContent.indexOf('];', scriptStart) + 2;
        const beforeScript = htmlContent.substring(0, scriptStart);
        const afterScript = htmlContent.substring(scriptEnd);
        const newUsersArray = `const users = ${JSON.stringify(users)};`;
        htmlContent = beforeScript + newUsersArray + afterScript;

        // Write updated HTML back to file
        await fs.writeFile(HTML_FILE, htmlContent);
        res.status(200).json({ message: 'Signup successful' });
    } catch (error) {
        console.error('Error updating HTML:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

app.get('/users', async (req, res) => {
    res.status(200).json(users);
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});