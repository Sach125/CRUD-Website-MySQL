function toggleShippingAddress() {
    const shippingAddressFields = document.getElementById('shippingAddressFields');
    shippingAddressFields.style.display = document.getElementById('copyAddressCheckbox').checked ? 'none' : 'block';
}
function addUser() {
    const title = document.getElementById('title').value;
    const firstName = document.getElementById('first_name').value;
    const lastName = document.getElementById('last_name').value;
    const mobile = document.getElementById('mobile').value;
    const email = document.getElementById('email').value;

    const addressLine1 = document.getElementById('address_line_1').value;
    const addressLine2 = document.getElementById('address_line_2').value;
    const town = document.getElementById('town').value;
    const countyCity = document.getElementById('county_city').value;
    const eircode = document.getElementById('eircode').value;

    const shippingAddressLine1 = document.getElementById('shipping_address_line_1').value;
    const shippingAddressLine2 = document.getElementById('shipping_address_line_2').value;
    const shippingTown = document.getElementById('shipping_town').value;
    const shippingCountyCity = document.getElementById('shipping_county_city').value;
    const shippingEircode = document.getElementById('shipping_eircode').value;

    // Validate required fields
    if (!title || !firstName || !lastName || !mobile || !email || !addressLine1 || !town || !countyCity) {
        alert('Please fill in all required fields.');
        return;
    }

    if (title.length < 2) {
        alert('Title must contain at least 2 letters.');
        return;
    }

    const userData = {
        title: title,
        first_name: firstName,
        last_name: lastName,
        mobile: mobile,
        email: email,
    };

    const homeaddressdata = {
        address_line_1: addressLine1,
        address_line_2: addressLine2,
        town: town,
        county_city: countyCity,
        eircode: eircode
    };

    const shippingaddressdata = {
        address_line_1: shippingAddressLine1,
        address_line_2: shippingAddressLine2,
        town: shippingTown,
        county_city: shippingCountyCity,
        eircode: shippingEircode
    };

    fetch('/api/users', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Error adding user');
        }
        return response.json();
    })
    .then(userDataResponse => {
        // Use the user ID to associate the home address with the user
        homeaddressdata.user_id = userDataResponse.insertId;

        // Send home address data to the server
        fetch('/api/home_address', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(homeaddressdata)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Error adding home address');
            }
            alert('User and home address added successfully!');
        })
        .catch(error => {
            console.error('Error adding home address:', error);
            alert('Error adding home address. Please try again later.');
        });

        if (!document.getElementById('copyAddressCheckbox').checked) {
            shippingaddressdata.user_id = userDataResponse.insertId;

            // Send shipping address data to the server
            fetch('/api/shipping_address', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(shippingaddressdata)
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error adding shipping address');
                }
                alert('Shipping address added successfully!');
            })
            .catch(error => {
                console.error('Error adding shipping address:', error);
                alert('Error adding shipping address. Please try again later.');
            });
        }
        else {
            shippingaddressdata.user_id = userDataResponse.insertId;

            fetch('/api/shipping_address', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(homeaddressdata)
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error adding shipping address');
                }
                alert('Shipping address added successfully!');
            })
            .catch(error => {
                console.error('Error adding shipping address:', error);
                alert('Error adding shipping address. Please try again later.');
            });
        }
    })
    .catch(error => {
        console.error('Error adding user:', error);
        alert('Error adding user. Please try again later.');
    });
}



function displayUsers() { // fetches the users and relevant address data

    fetch('/api/users')
    .then(response => {
        if (response.ok) {
            return response.json();
        } else {
            throw new Error('Error getting user data');
        }
    })
    .then(Userdata => {
        console.log('Users data:', Userdata); 
        fetch('/api/home_address')
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error('Error getting home address data');
            }
        })
        .then(homeaddressdata => {
            console.log('Home address data:', homeaddressdata);     
            fetch('/api/shipping_address')
            .then(response => {
                if (response.ok) {
                    return response.json();
                } else {
                    throw new Error('Error getting shipping address data');
                }
            })
            .then(shippingaddressdata => {
                displayUserData(Userdata, homeaddressdata, shippingaddressdata);
            })
            .catch(error => {
                console.error('Error getting shipping address data:', error);
                alert('Error getting shipping address data. Please try again later.');
            });
        })
        .catch(error => {
            console.error('Error getting home address data:', error);
            alert('Error getting home address data. Please try again later.');
        });
    })
    .catch(error => {
        console.error('Error getting user data:', error);
        alert('Error getting user data. Please try again later.');
    });
}



function displayUserData(Userdata, homeaddressdata, shippingaddressdata) {
    const userDataBox = document.getElementById('userDataBox');
    let html = '<h2>User Data</h2>';
    html += '<ul>';
    Userdata.forEach(function(user, index) {
        html += '<li>';
        html += `<strong>User ID:</strong> ${user.id}<br>`;
        html += `<strong>Title:</strong> ${user.title}<br>`;
        html += `<strong>First Name:</strong> ${user.first_name}<br>`;
        html += `<strong>Last Name:</strong> ${user.last_name}<br>`;
        html += `<strong>Mobile:</strong> ${user.mobile}<br>`;
        html += `<strong>Email:</strong> ${user.email}<br>`;

        // Find home address data for user by matching the ids in the table
        const homeAddress = homeaddressdata.find(address => address.user_id === user.id);
        if (homeAddress) {
            html += '<h3>Home Address</h3>';
            html += `<strong>Address Line 1:</strong> ${homeAddress.address_line_1}<br>`;
            html += `<strong>Address Line 2:</strong> ${homeAddress.address_line_2 || ''}<br>`;
            html += `<strong>Town:</strong> ${homeAddress.town}<br>`;
            html += `<strong>County/City:</strong> ${homeAddress.county_city}<br>`;
            html += `<strong>Eircode:</strong> ${homeAddress.eircode || ''}<br>`;
        } else {
            html += '<p>No home address found.</p>';
        }

        // Find shipping address data for user by matching the ids in the table
        const shippingAddress = shippingaddressdata.find(address => address.user_id === user.id);
        if (shippingAddress) {
            html += '<h3>Shipping Address</h3>';
            html += `<strong>Address Line 1:</strong> ${shippingAddress.address_line_1}<br>`;
            html += `<strong>Address Line 2:</strong> ${shippingAddress.address_line_2 || ''}<br>`;
            html += `<strong>Town:</strong> ${shippingAddress.town}<br>`;
            html += `<strong>County/City:</strong> ${shippingAddress.county_city}<br>`;
            html += `<strong>Eircode:</strong> ${shippingAddress.eircode || ''}<br>`;
            html += '<p> </p>';
        } else {
            html += '<p>No shipping address found.</p>';
            html += '<p> </p>';
        }

        html += '</li>';
    });
    html += '</ul>';
    userDataBox.innerHTML = html;
}


// perform user search
function searchUsers() {
    const searchInput = document.getElementById('searchInput').value.trim();

    // Send GET request to server to search users
    fetch(`/api/users/search?firstName=${searchInput}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Error searching users');
            }
            return response.json();
        })
        .then(users => {
            displaySearchResults(users);
        })
        .catch(error => {
            console.error('Error searching users:', error);
            alert('Error searching users. Please try again later.');
        });
}

// search results
function displaySearchResults(users) {
    const searchResultsDiv = document.getElementById('searchResults');
    searchResultsDiv.innerHTML = ''; // Clear previous search results

    if (users.length === 0) {
        searchResultsDiv.innerHTML = '<p>No users found</p>';
        return;
    }

    const userList = document.createElement('ul'); // List each user as individual items
    users.forEach(user => {
        const listItem = document.createElement('li');
        listItem.innerHTML = `
            <p>ID: ${user.id}</p>
            <p>Name: ${user.first_name} ${user.last_name}</p>
            <p>Email: ${user.email}</p>
            <p>Mobile: ${user.mobile}</p>
            <p>Home Address:</p>
            <ul>
                <li>Address Line 1: ${user.address_line_1}</li>
                <li>Address Line 2: ${user.address_line_2}</li>
                <li>Town: ${user.town}</li>
                <li>County/City: ${user.county_city}</li>
                <li>Eircode: ${user.eircode}</li>
            </ul>
            <p>Shipping Address:</p>
            <ul>
                <li>Address Line 1: ${user.shipping_address_line_1}</li>
                <li>Address Line 2: ${user.shipping_address_line_2}</li>
                <li>Town: ${user.shipping_town}</li>
                <li>County/City: ${user.shipping_county_city}</li>
                <li>Eircode: ${user.shipping_eircode}</li>
            </ul>
        `;
        userList.appendChild(listItem);
    });
    searchResultsDiv.appendChild(userList); // show results 
}
