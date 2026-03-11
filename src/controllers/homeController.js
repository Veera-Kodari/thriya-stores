/**
 * Home Controller
 * Handles requests for the root endpoint
 */

const getHome = (req, res) => {
    res.json({ message: 'Welcome to the Node.js API' });
};

module.exports = { getHome };
