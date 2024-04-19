const express = require('express');
const mysql = require('mysql');
const path = require('path');
const readline = require('readline');   

const app = express();

// Database connect
const connect = mysql.createConnection({
    host: 'webcourse.cs.nuim.ie',
    user: 'u230529',
    password: 'tait3eg2ahW0ku8r',
    database: 'cs230_u230529'
});

connect.connect((err) => {
    if (err) {
        console.error('Error connecting to database:', err);
        return;
    }
    console.log('Connected to database');
    createTables(); // create tables on the database
    commandLineInterface(); // allow user to preform crud in command line
});

function createTables() {
    connect.query(`CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(2),
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        mobile VARCHAR(20) NOT NULL,
        email VARCHAR(100) NOT NULL
    )`, (err) => {
        if (err) {
            console.error('Error creating users table:', err);
            return;
        }
        console.log("User table created or exists");
    });
    connect.query(`CREATE TABLE IF NOT EXISTS home_address (
        user_id INT,
        address_line_1 VARCHAR(255) NOT NULL,
        address_line_2 VARCHAR(255),
        town VARCHAR(100) NOT NULL,
        county_city VARCHAR(100) NOT NULL,
        eircode VARCHAR(20),
        FOREIGN KEY (user_id) REFERENCES users(id)
    )`, (err) => {
        if (err) {
            console.error('Error creating home address table:', err);
            return;
        }
        console.log("Home Address table created or exists");
    });
    connect.query(`CREATE TABLE IF NOT EXISTS shipping_address (
        user_id INT,
        address_line_1 VARCHAR(255) NOT NULL,
        address_line_2 VARCHAR(255),
        town VARCHAR(100) NOT NULL,
        county_city VARCHAR(100) NOT NULL,
        eircode VARCHAR(20),
        FOREIGN KEY (user_id) REFERENCES users(id)
    )`, (err) => {
        if (err) {
            console.error('Error creating Shipping address table:', err);
            return;
        }
        console.log("Shipping Address table created or exists");
    });
}

function commandLineInterface() { // crud through command line
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    rl.question(`Select operation: (C. Create, R. Read, U. Update, D. Delete): `, (operation) => {
        operation = operation.toUpperCase();
        switch (operation) {
            case 'C':
                createUser(rl);
                break;
            case 'R':
                readUser(rl);
                break;
            case 'U':
                updateUser(rl);
                break;
            case 'D':
                deleteUser(rl);
                break;
            default:
                console.log('Invalid operation.');
                rl.close();
                connect.end();
                break;
        }
    });
}

app.use(express.static(path.join(__dirname))); // serve static files from  directory
app.use(express.json());

// load index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'assignment-04.html'));
});
app.listen(3000, () => {
    console.log('Server is running on port 3000');
});

// POST FUNCTIONS - CREATE
app.post('/api/users', (req, res) => {
    const userData = req.body;
    insertUser(userData, res);
});
app.post('/api/home_address', (req, res) => {
    const homeData = req.body;
    insertHome(homeData, res);
});
app.post('/api/shipping_address', (req, res) => {
    const shippingData = req.body;
    insertShipping(shippingData, res);
});

// GET FUNCTIONS - RETRIEVE
app.get('/api/users', (req, res) => {
    retrieveUsers(res);
});
app.get('/api/home_address', (req, res) => {
    retrieveHome(res);
});
app.get('/api/shipping_address', (req, res) => {
    retrieveShipping(res);
});

// PUT FUNCTIONS -  UPDATE
app.put('/api/users/:userId', (req, res) => {
    const userId = req.params.userId;
    const updatedUserData = req.body;
    updateUser(userId, updatedUserData, res);
});
app.put('/api/home_address/:addressId', (req, res) => {
    const addressId = req.params.addressId;
    const updatedAddressData = req.body;
    updateHome(addressId, updatedAddressData, res);
});
app.put('/api/shipping_address/:shippingid', (req, res) => {
    const shippingid = req.params.shippingid;
    const updatedShippingData = req.body;
    updateShipping(shippingid, updatedShippingData, res);
});

// DELETE FUNCTIONS
app.delete('/api/users/:userId', (req, res) => {
    const userId = req.params.userId;
    deleteUser(userId, res);
});
app.delete('/api/home_address/:addressId', (req, res) => {
    const addressId = req.params.addressId;
    deleteAddress(addressId, res);
});
app.delete('/api/home_address/:shippingid', (req, res) => {
    const shippingid = req.params.shippingid;
    deleteShipping(shippingid, res);
});




/* INSERT FUNCTIONS FOR USERS AND ADDRESSES
    For all functions 500 is an error when processing the function, 200 is a success
*/
function insertUser(userData, res) {
    connect.query('INSERT INTO users SET ?', userData, (err, result) => {
        if (err) {
            console.error('Error inserting user:', err);
            res.status(500).send('Error inserting user');
        } else {
            console.log("User record inserted");
            res.status(200).json(result);
        }
    });
}
function insertHome(homeData, res) {
    connect.query('INSERT INTO home_address SET ?', homeData, (err, result) => {
        if (err) {
            console.error('Error inserting home_address:', err);
            res.status(500).send('Error inserting home_address');
        } else {
            console.log("home_address record inserted");
            res.status(200).json(result);
        }
    });

}
function insertShipping(shippingData, res) {
    connect.query('INSERT INTO shipping_address SET ?', shippingData, (err, result) => {
        if (err) {
            console.error('Error inserting shipping_address:', err);
            res.status(500).send('Error inserting shipping_address');
        } else {
            console.log("shipping_address record inserted");
            res.status(200).json(result);
        }
    });

}

// RETRIEVE FUNCTIONS
function retrieveUsers(res) {
    connect.query('SELECT * FROM users', (err, result) => {
        if (err) {
            console.error('Error retrieving users:', err);
            res.status(500).send('Error retrieving users');
        } else {
            res.status(200).json(result);
        }
    });
}
function retrieveHome(res) {
    connect.query('SELECT * FROM home_address', (err, result) => {
        if (err) {
            console.error('Error retrieving addresses:', err);
            res.status(500).send('Error retrieving addresses');
        } else {
            res.status(200).json(result);
        }
    });
}
function retrieveShipping(res) {
    connect.query('SELECT * FROM shipping_address', (err, result) => {
        if (err) {
            console.error('Error retrieving shipping_address:', err);
            res.status(500).send('Error retrieving shipping_address');
        } else {
            res.status(200).json(result);
        }
    });
}

/* UPDATE FUNCTIONS
    userid, addressid and shipid are all the same value represented across different tables.
*/
function updateUser(userId, updatedUserData, res) {
    connect.query('UPDATE users SET ? WHERE id = ?', [updatedUserData, userId], (err, result) => {
        if (err) {
            console.error('Error updating user:', err);
            res.status(500).send('Error updating user');
        } else {
            console.log("User record updated");
            res.status(200).json(result);
        }
    });
}
function updateHome(addressId, updatedAddressData, res) {
    connect.query('UPDATE home_address SET ? WHERE id = ?', [updatedAddressData, addressId], (err, result) => {
        if (err) {
            console.error('Error updating address:', err);
            res.status(500).send('Error updating address');
        } else {
            console.log("Address record updated");
            res.status(200).json(result);
        }
    });
}
function updateShipping(shippingid, updatedShippingData, res) {
    connect.query('UPDATE shipping_address SET ? WHERE id = ?', [updatedShippingData, shippingid], (err, result) => {
        if (err) {
            console.error('Error updating shipping_address:', err);
            res.status(500).send('Error updating shipping_address');
        } else {
            console.log("Address record updated");
            res.status(200).json(result);
        }
    });
}

// DELETE FUNCTIONS
function deleteUser(userId, res) {
    connect.query('DELETE FROM users WHERE id = ?', userId, (err, result) => {
        if (err) {
            console.error('Error deleting user:', err);
            res.status(500).send('Error deleting user');
        } else {
            console.log("User record deleted");
            res.status(200).json(result);
        }
    });
}

function deleteAddress(addressId, res) {
    connect.query('DELETE FROM home_address WHERE id = ?', addressId, (err, result) => {
        if (err) {
            console.error('Error deleting address:', err);
            res.status(500).send('Error deleting address');
        } else {
            console.log("Address record deleted");
            res.status(200).json(result);
        }
    });
}
function deleteShipping(addressId, res) {
    connect.query('DELETE FROM shipping_address WHERE id = ?', shippingid, (err, result) => {
        if (err) {
            console.error('Error deleting shipping_address:', err);
            res.status(500).send('Error deleting shipping_address');
        } else {
            console.log("shipping_address record deleted");
            res.status(200).json(result);
        }
    });
}

//While these  2 functions are techincally backend, they only affect the front end
// GET function for user search with address details
app.get('/api/users/search', (req, res) => {
    const firstName = req.query.firstName;
    const query = `
        SELECT users.id, users.first_name, users.last_name, users.email, users.mobile,
            home_address.address_line_1, home_address.address_line_2, home_address.town, 
            home_address.county_city, home_address.eircode,
            shipping_address.address_line_1 AS shipping_address_line_1,
            shipping_address.address_line_2 AS shipping_address_line_2,
            shipping_address.town AS shipping_town,
            shipping_address.county_city AS shipping_county_city,
            shipping_address.eircode AS shipping_eircode
        FROM users
        LEFT JOIN home_address ON users.id = home_address.user_id
        LEFT JOIN shipping_address ON users.id = shipping_address.user_id
        WHERE users.first_name LIKE ?
    `;
    // this queury joins all the data together to make it easier to display as a search results 
    // would have been easier to do this from the start but oh well
    connect.query(query, [`%${firstName}%`], (err, results) => {
        if (err) {
            console.error('Error searching users:', err);
            res.status(500).send('Error searching users');
        } else {
            res.status(200).json(results);
        }
    });
});


// SEARCH FUNCTION BY FIRST NAME
function searchName(firstName, res) {
    connect.query('SELECT * FROM users WHERE first_name LIKE ?', [`${firstName}%`], (err, result) => {
        if (err) {
            console.error('Error searching users by first name:', err);
            res.status(500).send('Error searching users by first name');
        } else {
            res.status(200).json(result);
        }
    });
}

// These functions are for the commandline part of this assignment, full backend
function createUser(rl) {
    const userData = {};
    rl.question('Enter title: ', (title) => {
        userData.title = title;
    });
    rl.question('Enter first name: ', (firstName) => {
        userData.first_name = firstName;
    });
    rl.question('Enter last name: ', (lastName) => {
        userData.last_name = lastName;
    });
    rl.question('Enter mobile: ', (mobile) => {
        userData.mobile = mobile;
    });
    rl.question('Enter email: ', (email) => {
        userData.email = email;
    });
    rl.question('Enter home address line 1: ', (homeAddressLine1) => {
        userData.address_line_1 = homeAddressLine1;
    });
    rl.question('Enter home address line 2: ', (homeAddressLine2) => {
        userData.address_line_2 = homeAddressLine2;
    });
    rl.question('Enter town: ', (homeTown) => {
        userData.town = homeTown;
    });
    rl.question('Enter county/city: ', (homeCountyCity) => {
        userData.county_city = homeCountyCity;
    });
    rl.question('Enter Eircode: ', (homeEircode) => {
        userData.eircode = homeEircode;
    });
    // Check if the addresses are the same, if yes insert the same data into both tables.
    rl.question('Are the home address and shipping address the same? (yes/no): ', (sameAddress) => {
        if (sameAddress.toLowerCase() === 'yes') {
            // If home and shipping address are the same, insert data into both tables
            connect.query('INSERT INTO users SET ?', userData, (err, result) => {
                if (err) {
                    console.error('Error inserting user:', err);
                    rl.close();
                    connect.end();
                    return;
                }
                const userId = result.insertId;
                const addressData = {
                    user_id: userId,
                    address_line_1: userData.address_line_1,
                    address_line_2: userData.address_line_2,
                    town: userData.town,
                    county_city: userData.county_city,
                    eircode: userData.eircode
                };
                // Insert address data into home and shipping tables
                insertHome(addressData, rl);
                insertShipping(addressData, rl);
            });
        } else {

            // If home and shipping address are different, ask for shipping address
            rl.question('Enter shipping address line 1: ', (shippingAddressLine1) => {
                userData.shipping_address_line_1 = shippingAddressLine1;
                rl.question('Enter shipping address line 2: ', (shippingAddressLine2) => {
                    userData.shipping_address_line_2 = shippingAddressLine2;
                    rl.question('Enter shipping town: ', (shippingTown) => {
                        userData.shipping_town = shippingTown;
                        rl.question('Enter shipping county/city: ', (shippingCountyCity) => {
                            userData.shipping_county_city = shippingCountyCity;
                            rl.question('Enter shipping Eircode: ', (shippingEircode) => {
                                userData.shipping_eircode = shippingEircode;
                                // Insert data into users table
                                connect.query('INSERT INTO users SET ?', userData, (err, result) => {
                                    if (err) {
                                        console.error('Error inserting user:', err);
                                        rl.close();
                                        connect.end();
                                        return;
                                    }
                                    // Insert address data into shipping table
                                    const userId = result.insertId;
                                    const addressData = {
                                        user_id: userId,
                                        address_line_1: userData.shipping_address_line_1,
                                        address_line_2: userData.shipping_address_line_2,
                                        town: userData.shipping_town,
                                        county_city: userData.shipping_county_city,
                                        eircode: userData.shipping_eircode
                                    };
                                    insertAddress(addressData, rl);
                                });
                            });
                        });
                    });
                });
            });
        }
    });
}

function readUser(rl) {
    // read users from users table
    connect.query('SELECT * FROM users', (err, users) => {
        if (err) {
            console.error('Error retrieving users:', err);
        } else {
            console.log('Users:');
            console.table(users);
        }
        rl.close();
    });
}

function updateUser(rl) {
    rl.question('Enter user ID to update: ', (userId) => {
        connect.query('SELECT * FROM users WHERE id = ?', userId, (err, result) => {
            if (err) {
                console.error('Error reading user:', err);
                rl.close();
                connect.end();
                return;
            }
            if (result.length === 0) {
                console.log('User not found.');
                rl.close();
                connect.end();
                return;
            }

            const user = result[0];
            console.log('Current user details:');
            console.log(user);

            rl.question('Enter new title (or press Enter to keep current): ', (title) => {
                user.title = title || user.title;
            });
            rl.question('Enter new first name (or press Enter to keep current): ', (firstName) => {
                user.first_name = firstName || user.first_name;
            });
            rl.question('Enter new last name (or press Enter to keep current): ', (lastName) => {
                user.last_name = lastName || user.last_name;
            });
            rl.question('Enter new mobile (or press Enter to keep current): ', (mobile) => {
                user.mobile = mobile || user.mobile;
            });
            rl.question('Enter new email (or press Enter to keep current): ', (email) => {
                user.email = email || user.email;

                // Update user data in users table
                connect.query('UPDATE users SET ? WHERE id = ?', [user, userId], (err, result) => {
                    if (err) {
                        console.error('Error updating user:', err);
                        rl.close();
                        connect.end();
                        return;
                    }

                    // Update user data in home address table
                    rl.question('Enter new home address line 1 (or press Enter to keep current): ', (homeAddressLine1) => {
                    rl.question('Enter new home address line 2 (or press Enter to keep current): ', (homeAddressLine2) => {
                    rl.question('Enter new town (or press Enter to keep current): ', (homeTown) => {
                    rl.question('Enter new county/city (or press Enter to keep current): ', (homeCountyCity) => {
                    rl.question('Enter new Eircode (or press Enter to keep current): ', (homeEircode) => {
                        const homeData = {
                            address_line_1: homeAddressLine1 || user.address_line_1,
                            address_line_2: homeAddressLine2 || user.address_line_2,
                            town: homeTown || user.town,
                            county_city: homeCountyCity || user.county_city,
                            eircode: homeEircode || user.eircode
                            };
                            connect.query('UPDATE home_address SET ? WHERE user_id = ?', [homeData, userId], (err, result) => {
                            if (err) {
                                console.error('Error updating home address:', err);
                            } else {
                                console.log('Home address updated successfully.');
                                            }
                                        });
                                    });
                                });
                            });
                        });
                    });

                    // Update user data in shipping address table
                    rl.question('Enter new shipping address line 1 (or press Enter to keep current): ', (shippingAddressLine1) => {
                        rl.question('Enter new shipping address line 2 (or press Enter to keep current): ', (shippingAddressLine2) => {
                            rl.question('Enter new town (or press Enter to keep current): ', (shippingTown) => {
                                rl.question('Enter new county/city (or press Enter to keep current): ', (shippingCountyCity) => {
                                    rl.question('Enter new Eircode (or press Enter to keep current): ', (shippingEircode) => {
                                        const shippingData = {
                                            address_line_1: shippingAddressLine1 || user.address_line_1,
                                            address_line_2: shippingAddressLine2 || user.address_line_2,
                                            town: shippingTown || user.town,
                                            county_city: shippingCountyCity || user.county_city,
                                            eircode: shippingEircode || user.eircode
                                        };
                                        connect.query('UPDATE shipping_address SET ? WHERE user_id = ?', [shippingData, userId], (err, result) => {
                                            if (err) {
                                                console.error('Error updating shipping address:', err);
                                            } else {
                                                console.log('Shipping address updated successfully.');
                                            }
                                        });
                                    });
                                });
                            });
                        });
                    });

                    console.log('User updated successfully.');
                    rl.close();
                    connect.end();

                    // Loop back to command line interface
                    commandLineInterface();
                });
            });
        });
    });
}




function deleteUser(rl) { // delete using user id
    rl.question('Enter user ID to delete: ', (userId) => {
        // Delete user from users table
        connect.query('DELETE FROM users WHERE id = ?', userId, (err, result) => {
            if (err) {
                console.error('Error deleting user:', err);
            } else {
                console.log('User deleted successfully.');

                // Delete user's home address from home address table
                connect.query('DELETE FROM home_address WHERE user_id = ?', userId, (err, result) => {
                    if (err) {
                        console.error('Error deleting home address:', err);
                    } else {
                        console.log('Home address deleted successfully.');
                    }
                });

                // Delete user's shipping address from shipping address table
                connect.query('DELETE FROM shipping_address WHERE user_id = ?', userId, (err, result) => {
                    if (err) {
                        console.error('Error deleting shipping address:', err);
                    } else {
                        console.log('Shipping address deleted successfully.');
                    }
                });
            }
            rl.close();
        });
    });
}