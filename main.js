// Wait for the page to load and then initialize the IndexedDB and add data
document.addEventListener("DOMContentLoaded", function() {
    // Create and initialize the databases with data when the page loads
    createAndPopulateDBs();
});

// Create and populate the IndexedDB
function createAndPopulateDBs() {
    const request = indexedDB.open("HealthCareDB", 1);
    
    request.onupgradeneeded = function(event) {
        const db = event.target.result;

        // Create the Patient object store with all fields
        if (!db.objectStoreNames.contains("Patient")) {
            const patientStore = db.createObjectStore("Patient", { keyPath: "NHS" });
            patientStore.createIndex("NHS", "NHS", { unique: true });
            patientStore.createIndex("Title", "Title", { unique: false });
            patientStore.createIndex("First", "First", { unique: false });
            patientStore.createIndex("Last", "Last", { unique: false });
            patientStore.createIndex("DOB", "DOB", { unique: false });
            patientStore.createIndex("Gender", "Gender", { unique: false });
            patientStore.createIndex("Address", "Address", { unique: false });
            patientStore.createIndex("Email", "Email", { unique: false });
            patientStore.createIndex("Telephone", "Telephone", { unique: false });
        }

        // Create the Doctor object store with all fields
        if (!db.objectStoreNames.contains("Doctor")) {
            const doctorStore = db.createObjectStore("Doctor", { keyPath: "id" });
            doctorStore.createIndex("id", "id", { unique: true });
            doctorStore.createIndex("first_name", "first_name", { unique: false });
            doctorStore.createIndex("last_name", "last_name", { unique: false });
            doctorStore.createIndex("email", "email", { unique: false });
            doctorStore.createIndex("gender", "gender", { unique: false });
            doctorStore.createIndex("Address", "Address", { unique: false });
            doctorStore.createIndex("Telephone", "Telephone", { unique: false });
        }

        // Create the Admin object store with all fields
        if (!db.objectStoreNames.contains("Admin")) {
            const adminStore = db.createObjectStore("Admin", { keyPath: "id" });
            adminStore.createIndex("id", "id", { unique: true });
            adminStore.createIndex("first_name", "first_name", { unique: false });
            adminStore.createIndex("last_name", "last_name", { unique: false });
            adminStore.createIndex("email", "email", { unique: false });
        }

        // Create the Drug object store with all fields
        if (!db.objectStoreNames.contains("Drug")) {
            const drugStore = db.createObjectStore("Drug", { keyPath: "id" });
            drugStore.createIndex("id", "id", { unique: true });
            drugStore.createIndex("Drug", "Drug", { unique: false });
        }
    };

    request.onsuccess = function(event) {
        const db = event.target.result;
        
        // Populate the object stores with data from JSON files
        addDataToStore(db, "Patient", "https://jsethi-mdx.github.io/cst2572.github.io/patients.json");
        addDataToStore(db, "Doctor", "https://jsethi-mdx.github.io/cst2572.github.io/doctors.json");
        addDataToStore(db, "Admin", "https://jsethi-mdx.github.io/cst2572.github.io/admin.json");
        addDataToStore(db, "Drug", "https://jsethi-mdx.github.io/cst2572.github.io/medicines.json");
    };

    request.onerror = function(event) {
        console.error("Error opening database:", event.target.errorCode);
    };
}

// Function to fetch data from a JSON file and add it to the specified object store
function addDataToStore(db, storeName, jsonFile) {
    fetch(jsonFile)
        .then(response => response.json())
        .then(data => {
            const transaction = db.transaction(storeName, "readwrite");
            const store = transaction.objectStore(storeName);
            
            data.forEach(item => {
                const request = store.put(item);
                request.onsuccess = function() {
                    console.log(`${storeName} record added: `, item);
                };
                request.onerror = function(event) {
                    console.error(`Error adding ${storeName} record: `, event.target.error);
                };
            });
        })
        .catch(error => console.error("Error fetching data from JSON file:", error));
}


// Function to fetch data from a JSON file and add it to the specified object store
function addDataToStore(db, storeName, jsonFile) {
    fetch(jsonFile)
        .then(response => response.json())
        .then(data => {
            const transaction = db.transaction(storeName, "readwrite");
            const store = transaction.objectStore(storeName);
            
            data.forEach(item => {
                const request = store.put(item);
                request.onsuccess = function() {
                    console.log(`${storeName} record added: `, item);
                };
                request.onerror = function(event) {
                    console.error(`Error adding ${storeName} record: `, event.target.error);
                };
            });
        })
        .catch(error => console.error("Error fetching data from JSON file:", error));
}

// Display Patient Table and enable actions like Update and Delete
function displayPatientTable() {
    const request = indexedDB.open("HealthCareDB", 1);
    request.onsuccess = function (event) {
        const db = event.target.result;
        const transaction = db.transaction("Patient", "readonly");
        const store = transaction.objectStore("Patient");
        const patientTableBody = document.getElementById("patientTableBody");
        patientTableBody.innerHTML = "";

        store.openCursor().onsuccess = function (event) {
            const cursor = event.target.result;
            if (cursor) {
                const patient = cursor.value;
                const row = document.createElement("tr");

                row.innerHTML = `
                    <td>${patient.NHS}</td>
                    <td>${patient.Title}</td>
                    <td>${patient.First}</td>
                    <td>${patient.Last}</td>
                    <td>${patient.DOB}</td>
                    <td>${patient.Gender}</td>
                    <td>${patient.Address}</td>
                    <td>${patient.Email}</td>
                    <td>${patient.Telephone}</td>
                    <td>
                        <button onclick="updatePatient('${patient.NHS}')">Update</button>
                        <button onclick="deletePatient('${patient.NHS}')">Delete</button>
                    </td>
                `;
                patientTableBody.appendChild(row);
                cursor.continue();
            }
        };

        transaction.oncomplete = function() {
            console.log("Patient table loaded successfully.");
        };
    };

    request.onerror = function (event) {
        console.error("Error opening database:", event.target.errorCode);
    };
}
//update patient data
function updatePatient(nhs) {
    const request = indexedDB.open("HealthCareDB", 1);
    request.onsuccess = function (event) {
        const db = event.target.result;
        const transaction = db.transaction("Patient", "readwrite");
        const store = transaction.objectStore("Patient");

        const getRequest = store.get(nhs);
        getRequest.onsuccess = function (event) {
            const patient = event.target.result;

            // Prompt user to update each field
            patient.NHS = prompt("Update NHS", patient.NHS);
            patient.Title = prompt("Update Title", patient.Title);
            patient.First = prompt("Update First Name", patient.First);
            patient.Last = prompt("Update Last Name", patient.Last);
            patient.DOB = prompt("Update Date of Birth", patient.DOB);
            patient.Gender = prompt("Update Gender", patient.Gender);
            patient.Address = prompt("Update Address", patient.Address);
            patient.Email = prompt("Update Email", patient.Email);
            patient.Telephone = prompt("Update Telephone", patient.Telephone);

            // Store the updated patient object back into the database
            const updateRequest = store.put(patient);
            updateRequest.onsuccess = function () {
                alert("Patient updated successfully!");
                displayPatientTable(); // Refresh table after update
            };

            updateRequest.onerror = function (event) {
                console.error("Error updating patient:", event.target.error);
            };
        };

        getRequest.onerror = function (event) {
            console.error("Error retrieving patient:", event.target.error);
        };
    };
}


// Delete a patient record
function deletePatient(nhs) {
    const request = indexedDB.open("HealthCareDB", 1);
    request.onsuccess = function (event) {
        const db = event.target.result;
        const transaction = db.transaction("Patient", "readwrite");
        const store = transaction.objectStore("Patient");

        const deleteRequest = store.delete(nhs);
        deleteRequest.onsuccess = function () {
            alert("Patient deleted successfully!");
            displayPatientTable(); // Refresh table after delete
        };

        deleteRequest.onerror = function (event) {
            console.error("Error deleting patient:", event.target.error);
        };
    };
}

function validatePatientLogin() {
    const emailInput = document.getElementById("email").value;
    const nhsInput = document.getElementById("nhs").value;
    const loginMessage = document.getElementById("loginMessage");

    const request = indexedDB.open("HealthCareDB", 1);
    
    request.onsuccess = function(event) {
        const db = event.target.result;
        const transaction = db.transaction("Patient", "readonly");
        const store = transaction.objectStore("Patient");

        const getRequest = store.get(nhsInput);

        getRequest.onsuccess = function(event) {
            const patient = event.target.result;
            
            if (patient && patient.Email === emailInput) {
                loginMessage.textContent = "Login successful!";
                loginMessage.style.color = "green";
                // Redirect to patient dashboard or other actions
                window.location.href = "patient.html";
            } else {
                loginMessage.textContent = "Invalid NHS number or email. Please try again.";
                loginMessage.style.color = "red";
            }
        };

        getRequest.onerror = function(event) {
            console.error("Error retrieving patient:", event.target.error);
            loginMessage.textContent = "An error occurred. Please try again.";
            loginMessage.style.color = "red";
        };
    };

    request.onerror = function(event) {
        console.error("Error opening database:", event.target.errorCode);
        loginMessage.textContent = "Database error. Please try again later.";
        loginMessage.style.color = "red";
    };
}

document.addEventListener("DOMContentLoaded", () => {
    createAndPopulateDBs(); // Ensure DBs are set up on page load
});

// Fetch patient details by NHS number
function fetchPatientDetails() {
    const nhsNumber = document.getElementById("nhsInput").value;
    const request = indexedDB.open("HealthCareDB", 1);

    request.onsuccess = function(event) {
        const db = event.target.result;
        const transaction = db.transaction("Patient", "readonly");
        const store = transaction.objectStore("Patient");

        const patientRequest = store.get(nhsNumber);
        patientRequest.onsuccess = function(event) {
            const patient = event.target.result;
            if (patient) {
                displayPatientDetails(patient);
                document.getElementById("bookAppointmentBtn").style.display = "block"; // Show booking button
            } else {
                alert("No patient found with that NHS number.");
                clearPatientDetails();
            }
        };

        patientRequest.onerror = function() {
            console.error("Error fetching patient details.");
        };
    };

    request.onerror = function() {
        console.error("Error opening database.");
    };
}

// Display patient details in the table
function displayPatientDetails(patient) {
    const tableBody = document.getElementById("patientDetailsBody");
    tableBody.innerHTML = `
        <tr>
            <td>${patient.NHS}</td>
            <td>${patient.Title}</td>
            <td>${patient.First}</td>
            <td>${patient.Last}</td>
            <td>${patient.DOB}</td>
            <td>${patient.Gender}</td>
            <td>${patient.Address}</td>
            <td>${patient.Email}</td>
            <td>${patient.Telephone}</td>
        </tr>
    `;
    document.getElementById("patientDetailsTable").style.display = "table";
}

// Clear patient details if no match found
function clearPatientDetails() {
    document.getElementById("patientDetailsBody").innerHTML = "";
    document.getElementById("patientDetailsTable").style.display = "none";
    document.getElementById("bookAppointmentBtn").style.display = "none";
}

// Open the appointment booking form
function openAppointmentForm() {
    // Pre-fill NHS and basic information from displayed patient details
    const patientRow = document.getElementById("patientDetailsBody").querySelector("tr");
    if (patientRow) {
        document.getElementById("nhs").value = patientRow.cells[0].textContent;
        document.getElementById("firstName").value = patientRow.cells[2].textContent;
        document.getElementById("lastName").value = patientRow.cells[3].textContent;
        document.getElementById("email").value = patientRow.cells[7].textContent;
    }
    document.getElementById("appointmentForm").style.display = "block";
}

// Submit the appointment details (save or log for now)
function submitAppointment() {
    const appointmentData = {
        nhs: document.getElementById("nhs").value,
        firstName: document.getElementById("firstName").value,
        lastName: document.getElementById("lastName").value,
        email: document.getElementById("email").value,
        doctor: document.getElementById("doctor").value,
        dateTime: document.getElementById("dateTime").value
    };


    // Reset the form and hide it
    document.getElementById("appointmentBookingForm").reset();
    document.getElementById("appointmentForm").style.display = "none";
}

        // Wait a moment before displaying the table to ensure data is loaded
        document.addEventListener("DOMContentLoaded", function() {
            const showPatientsBtn = document.getElementById("showPatientsBtn");
            const findPatientBtn = document.getElementById("findPatientBtn");
            const addPatientBtn = document.getElementById("addPatientBtn");
            const patientTable = document.getElementById("patientTable");

            // Toggle the visibility of the patient table
            showPatientsBtn.addEventListener("click", function() {
                if (patientTable.style.display === "none") {
                    displayPatientTable(); // Call function to display the table
                    patientTable.style.display = "table"; // Show the table
                    showPatientsBtn.textContent = "Hide All Patients"; // Change button text
                } else {
                    patientTable.style.display = "none"; // Hide the table
                    showPatientsBtn.textContent = "Show All Patients"; // Change button text back
                }
            });

            // Find a specific patient by NHS
            findPatientBtn.addEventListener("click", function() {
                const nhs = prompt("Enter the NHS number of the patient you want to find:");
                if (nhs) {
                    findPatientByNHS(nhs);
                }
            });

            // Add a new patient
            addPatientBtn.addEventListener("click", function() {
                const newPatient = {
                    NHS: prompt("Enter NHS Number:"),
                    Title: prompt("Enter Title:"),
                    First: prompt("Enter First Name:"),
                    Last: prompt("Enter Last Name:"),
                    DOB: prompt("Enter Date of Birth:"),
                    Gender: prompt("Enter Gender:"),
                    Address: prompt("Enter Address:"),
                    Email: prompt("Enter Email:"),
                    Telephone: prompt("Enter Telephone:")
                };

                if (newPatient.NHS && newPatient.First && newPatient.Last) {
                    addNewPatient(newPatient);
                } else {
                    alert("Please provide all necessary details.");
                }
            });
        });

        function displayPatientTable() {
            const request = indexedDB.open("HealthCareDB", 1);
            request.onsuccess = function (event) {
                const db = event.target.result;
                const transaction = db.transaction("Patient", "readonly");
                const store = transaction.objectStore("Patient");
                const patientTableBody = document.getElementById("patientTableBody");
                patientTableBody.innerHTML = ""; // Clear the table body

                store.openCursor().onsuccess = function (event) {
                    const cursor = event.target.result;
                    if (cursor) {
                        const patient = cursor.value;
                        const row = document.createElement("tr");

                        row.innerHTML = `
                            <td>${patient.NHS}</td>
                            <td>${patient.Title}</td>
                            <td>${patient.First}</td>
                            <td>${patient.Last}</td>
                            <td>${patient.DOB}</td>
                            <td>${patient.Gender}</td>
                            <td>${patient.Address}</td>
                            <td>${patient.Email}</td>
                            <td>${patient.Telephone}</td>
                            <td>
                                <button onclick="updatePatient('${patient.NHS}')">Update</button>
                                <button onclick="deletePatient('${patient.NHS}')">Delete</button>
                            </td>
                        `;
                        patientTableBody.appendChild(row);
                        cursor.continue();
                    }
                };

                transaction.oncomplete = function() {
                    console.log("Patient table loaded successfully.");
                };
            };

            request.onerror = function (event) {
                console.error("Error opening database:", event.target.errorCode);
            };
        }

        function findPatientByNHS(nhs) {
            const request = indexedDB.open("HealthCareDB", 1);
            request.onsuccess = function (event) {
                const db = event.target.result;
                const transaction = db.transaction("Patient", "readonly");
                const store = transaction.objectStore("Patient");
                const patientTableBody = document.getElementById("patientTableBody");
                patientTableBody.innerHTML = ""; // Clear the table body

                const getRequest = store.get(nhs);
                getRequest.onsuccess = function (event) {
                    const patient = event.target.result;
                    if (patient) {
                        const row = document.createElement("tr");
                        row.innerHTML = `
                            <td>${patient.NHS}</td>
                            <td>${patient.Title}</td>
                            <td>${patient.First}</td>
                            <td>${patient.Last}</td>
                            <td>${patient.DOB}</td>
                            <td>${patient.Gender}</td>
                            <td>${patient.Address}</td>
                            <td>${patient.Email}</td>
                            <td>${patient.Telephone}</td>
                            <td>
                                <button onclick="updatePatient('${patient.NHS}')">Update</button>
                                <button onclick="deletePatient('${patient.NHS}')">Delete</button>
                            </td>
                        `;
                        patientTableBody.appendChild(row);
                    } else {
                        alert("Patient not found!");
                    }
                };

                getRequest.onerror = function () {
                    alert("Error finding patient!");
                };
            };
        }

        function addNewPatient(patient) {
            const request = indexedDB.open("HealthCareDB", 1);
            request.onsuccess = function (event) {
                const db = event.target.result;
                const transaction = db.transaction("Patient", "readwrite");
                const store = transaction.objectStore("Patient");

                const addRequest = store.add(patient);
                addRequest.onsuccess = function () {
                    alert("New patient added successfully!");
                    displayPatientTable(); // Refresh table after adding new patient
                };

                addRequest.onerror = function (event) {
                    console.error("Error adding new patient:", event.target.error);
                };
            };
        }

        function updatePatient(nhs) {
            const request = indexedDB.open("HealthCareDB", 1);
            request.onsuccess = function (event) {
                const db = event.target.result;
                const transaction = db.transaction("Patient", "readwrite");
                const store = transaction.objectStore("Patient");

                const getRequest = store.get(nhs);
                getRequest.onsuccess = function (event) {
                    const patient = event.target.result;

                    // Prompt user to update each field
                    patient.NHS = prompt("Update NHS", patient.NHS);
                    patient.Title = prompt("Update Title", patient.Title);
                    patient.First = prompt("Update First Name", patient.First);
                    patient.Last = prompt("Update Last Name", patient.Last);
                    patient.DOB = prompt("Update Date of Birth", patient.DOB);
                    patient.Gender = prompt("Update Gender", patient.Gender);
                    patient.Address = prompt("Update Address", patient.Address);
                    patient.Email = prompt("Update Email", patient.Email);
                    patient.Telephone = prompt("Update Telephone", patient.Telephone);

                    // Store the updated patient object back into the database
                    const updateRequest = store.put(patient);
                    updateRequest.onsuccess = function () {
                        alert("Patient updated successfully!");
                        displayPatientTable(); // Refresh table after update
                    };

                    updateRequest.onerror = function (event) {
                        console.error("Error updating patient:", event.target.error);
                    };
                };
            };
        }

        function deletePatient(nhs) {
            const request = indexedDB.open("HealthCareDB", 1);
            request.onsuccess = function (event) {
                const db = event.target.result;
                const transaction = db.transaction("Patient", "readwrite");
                const store = transaction.objectStore("Patient");

                const deleteRequest = store.delete(nhs);
                deleteRequest.onsuccess = function () {
                    alert("Patient deleted successfully!");
                    displayPatientTable(); // Refresh table after deletion
                };

                deleteRequest.onerror = function (event) {
                    console.error("Error deleting patient:", event.target.error);
                };
            };
        }
    
    // Fetch and display patient data based on NHS number
function findPatientByNHS(nhs) {
    const request = indexedDB.open("HealthCareDB", 1);
    request.onsuccess = function (event) {
        const db = event.target.result;
        const transaction = db.transaction("Patient", "readonly");
        const store = transaction.objectStore("Patient");
        const patientTableBody = document.getElementById("patientTableBody");
        patientTableBody.innerHTML = ""; // Clear the table body

        const getRequest = store.get(nhs);
        getRequest.onsuccess = function (event) {
            const patient = event.target.result;
            if (patient) {
                // Display the patient data in a table row
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${patient.NHS}</td>
                    <td>${patient.Title}</td>
                    <td>${patient.First}</td>
                    <td>${patient.Last}</td>
                    <td>${patient.DOB}</td>
                    <td>${patient.Gender}</td>
                    <td>${patient.Address}</td>
                    <td>${patient.Email}</td>
                    <td>${patient.Telephone}</td>
                `;
                patientTableBody.appendChild(row);
                document.getElementById("patientTable").style.display = "table"; // Show the table
            } else {
                alert("Patient not found!");
                document.getElementById("patientTable").style.display = "none"; // Hide the table if not found
            }
        };

        getRequest.onerror = function () {
            alert("Error finding patient!");
        };
    };
}

// Fetch and display patient data based on NHS number
function findPatientByNHS(nhs) {
    const request = indexedDB.open("HealthCareDB", 1);
    request.onsuccess = function (event) {
        const db = event.target.result;
        const transaction = db.transaction("Patient", "readonly");
        const store = transaction.objectStore("Patient");
        const patientTableBody = document.getElementById("patientTableBody");
        patientTableBody.innerHTML = ""; // Clear the table body

        const getRequest = store.get(nhs);
        getRequest.onsuccess = function (event) {
            const patient = event.target.result;
            if (patient) {
                // Display the patient data in a table row
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${patient.NHS}</td>
                    <td>${patient.Title}</td>
                    <td>${patient.First}</td>
                    <td>${patient.Last}</td>
                    <td>${patient.DOB}</td>
                    <td>${patient.Gender}</td>
                    <td>${patient.Address}</td>
                    <td>${patient.Email}</td>
                    <td>${patient.Telephone}</td>
                    <td>
                        <button onclick="openUpdateForm('${patient.NHS}')">Update</button>
                    </td>
                `;
                patientTableBody.appendChild(row);
                document.getElementById("patientTable").style.display = "table"; // Show the table

                // Show the appointment booking form below the table
                document.getElementById("appointmentForm").style.display = "block"; 
                // Pre-fill the appointment form with patient details
                document.getElementById("nhs").value = patient.NHS;
                document.getElementById("firstName").value = patient.First;
                document.getElementById("lastName").value = patient.Last;
                document.getElementById("email").value = patient.Email;
            } else {
                alert("Patient not found!");
                document.getElementById("patientTable").style.display = "none"; // Hide the table if not found
                document.getElementById("appointmentForm").style.display = "none"; // Hide the appointment form
            }
        };

        getRequest.onerror = function () {
            alert("Error finding patient!");
        };
    };
}

// Open the update form (fill it with the patient's data)
function openUpdateForm(nhs) {
    const request = indexedDB.open("HealthCareDB", 1);
    request.onsuccess = function (event) {
        const db = event.target.result;
        const transaction = db.transaction("Patient", "readwrite");
        const store = transaction.objectStore("Patient");

        const getRequest = store.get(nhs);
        getRequest.onsuccess = function (event) {
            const patient = event.target.result;
            if (patient) {
                // Pre-fill the update form with patient data
                document.getElementById("updateNHS").value = patient.NHS;
                document.getElementById("updateTitle").value = patient.Title;
                document.getElementById("updateFirst").value = patient.First;
                document.getElementById("updateLast").value = patient.Last;
                document.getElementById("updateDOB").value = patient.DOB;
                document.getElementById("updateGender").value = patient.Gender;
                document.getElementById("updateAddress").value = patient.Address;
                document.getElementById("updateEmail").value = patient.Email;
                document.getElementById("updateTelephone").value = patient.Telephone;

                // Show the update form
                document.getElementById("updateForm").style.display = "block";
            } else {
                alert("Patient not found!");
            }
        };

        getRequest.onerror = function () {
            alert("Error finding patient!");
        };
    };
}

// Update patient data in the database
function updatePatient() {
    const nhs = document.getElementById("updateNHS").value;
    const title = document.getElementById("updateTitle").value;
    const firstName = document.getElementById("updateFirst").value;
    const lastName = document.getElementById("updateLast").value;
    const dob = document.getElementById("updateDOB").value;
    const gender = document.getElementById("updateGender").value;
    const address = document.getElementById("updateAddress").value;
    const email = document.getElementById("updateEmail").value;
    const telephone = document.getElementById("updateTelephone").value;

    const request = indexedDB.open("HealthCareDB", 1);
    request.onsuccess = function (event) {
        const db = event.target.result;
        const transaction = db.transaction("Patient", "readwrite");
        const store = transaction.objectStore("Patient");

        // Update patient record
        const updatedPatient = {
            NHS: nhs,
            Title: title,
            First: firstName,
            Last: lastName,
            DOB: dob,
            Gender: gender,
            Address: address,
            Email: email,
            Telephone: telephone
        };

        const updateRequest = store.put(updatedPatient);
        updateRequest.onsuccess = function () {
            alert("Patient updated successfully!");
            document.getElementById("updateForm").style.display = "none"; // Hide the update form
            findPatientByNHS(nhs); // Refresh the patient details after update
        };

        updateRequest.onerror = function () {
            alert("Error updating patient!");
        };
    };
}

// Display the appointment form when the button is clicked
function showAppointmentForm() {
    document.getElementById("appointmentForm").style.display = "block";
}

// Update patient data in the database
function updatePatient() {
    const nhs = document.getElementById("updateNHS").value;
    const title = document.getElementById("updateTitle").value;
    const firstName = document.getElementById("updateFirst").value;
    const lastName = document.getElementById("updateLast").value;
    const dob = document.getElementById("updateDOB").value;
    const gender = document.getElementById("updateGender").value;
    const address = document.getElementById("updateAddress").value;
    const email = document.getElementById("updateEmail").value;
    const telephone = document.getElementById("updateTelephone").value;

    const request = indexedDB.open("HealthCareDB", 1);
    request.onsuccess = function (event) {
        const db = event.target.result;
        const transaction = db.transaction("Patient", "readwrite");
        const store = transaction.objectStore("Patient");

        // Update patient record
        const updatedPatient = {
            NHS: nhs,
            Title: title,
            First: firstName,
            Last: lastName,
            DOB: dob,
            Gender: gender,
            Address: address,
            Email: email,
            Telephone: telephone
        };

        const updateRequest = store.put(updatedPatient);
        updateRequest.onsuccess = function () {
            alert("Patient updated successfully!");
            document.getElementById("updateForm").style.display = "none"; // Hide the update form
            findPatientByNHS(nhs); // Refresh the patient details after update
        };

        updateRequest.onerror = function () {
            alert("Error updating patient!");
        };
    };
}
// Function to handle appointment booking
function bookAppointment() {
    const nhs = document.getElementById("nhs").value;
    const firstName = document.getElementById("firstName").value;
    const lastName = document.getElementById("lastName").value;
    const email = document.getElementById("email").value;
    const doctor = document.getElementById("doctor").value;
    const dateTime = document.getElementById("dateTime").value;

    // You can implement the appointment data saving here (e.g., saving to IndexedDB or API call)
    // Assuming appointment details are processed and saved successfully:
    
    alert("Appointment successfully booked!");

    // Optionally, clear the form fields after booking
    document.getElementById("appointmentBookingForm").reset();

    // Hide the appointment form after booking
    document.getElementById("appointmentForm").style.display = "none";
}
// Function to add a new patient
function addNewPatient() {
    const nhs = document.getElementById("newNHS").value;
    const title = document.getElementById("newTitle").value;
    const first = document.getElementById("newFirst").value;
    const last = document.getElementById("newLast").value;
    const dob = document.getElementById("newDOB").value;
    const gender = document.getElementById("newGender").value;
    const address = document.getElementById("newAddress").value;
    const email = document.getElementById("newEmail").value;
    const telephone = document.getElementById("newTelephone").value;

    const request = indexedDB.open("HealthCareDB", 1);
    request.onsuccess = function (event) {
        const db = event.target.result;
        const transaction = db.transaction("Patient", "readwrite");
        const store = transaction.objectStore("Patient");

        const newPatient = {
            NHS: nhs,
            Title: title,
            First: first,
            Last: last,
            DOB: dob,
            Gender: gender,
            Address: address,
            Email: email,
            Telephone: telephone,
        };

        const addRequest = store.add(newPatient);
        addRequest.onsuccess = function () {
            alert("Patient added successfully!");
            document.getElementById("addPatientForm").reset();
        };

        addRequest.onerror = function () {
            alert("Error adding patient!");
        };
    };
}

// Function to update an existing patient (use form data to update)
function updatePatient(nhs) {
    const title = document.getElementById("newTitle").value;
    const first = document.getElementById("newFirst").value;
    const last = document.getElementById("newLast").value;
    const dob = document.getElementById("newDOB").value;
    const gender = document.getElementById("newGender").value;
    const address = document.getElementById("newAddress").value;
    const email = document.getElementById("newEmail").value;
    const telephone = document.getElementById("newTelephone").value;

    const request = indexedDB.open("HealthCareDB", 1);
    request.onsuccess = function (event) {
        const db = event.target.result;
        const transaction = db.transaction("Patient", "readwrite");
        const store = transaction.objectStore("Patient");

        const updatedPatient = {
            NHS: nhs,
            Title: title,
            First: first,
            Last: last,
            DOB: dob,
            Gender: gender,
            Address: address,
            Email: email,
            Telephone: telephone,
        };

        const updateRequest = store.put(updatedPatient);
        updateRequest.onsuccess = function () {
            alert("Patient updated successfully!");
        };

        updateRequest.onerror = function () {
            alert("Error updating patient!");
        };
    };
}

// Function to find a patient by NHS Number (for the Find Patient form)
function findPatientByNHS(nhs) {
    const request = indexedDB.open("HealthCareDB", 1);
    request.onsuccess = function (event) {
        const db = event.target.result;
        const transaction = db.transaction("Patient", "readonly");
        const store = transaction.objectStore("Patient");
        const patientTableBody = document.getElementById("patientTableBody");
        patientTableBody.innerHTML = ""; // Clear the table body

        const getRequest = store.get(nhs);
        getRequest.onsuccess = function (event) {
            const patient = event.target.result;
            if (patient) {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${patient.NHS}</td>
                    <td>${patient.Title}</td>
                    <td>${patient.First}</td>
                    <td>${patient.Last}</td>
                    <td>${patient.DOB}</td>
                    <td>${patient.Gender}</td>
                    <td>${patient.Address}</td>
                    <td>${patient.Email}</td>
                    <td>${patient.Telephone}</td>
                    <td>
                        <button onclick="updatePatient('${patient.NHS}')">Update</button>
                    </td>
                `;
                patientTableBody.appendChild(row);
                document.getElementById("patientTable").style.display = "block";
            } else {
                alert("Patient not found!");
            }
        };

        getRequest.onerror = function () {
            alert("Error finding patient!");
        };
    };
}

// Function to display all patients
function displayAllPatients() {
    const request = indexedDB.open("HealthCareDB", 1);
    request.onsuccess = function (event) {
        const db = event.target.result;
        const transaction = db.transaction("Patient", "readonly");
        const store = transaction.objectStore("Patient");
        const patientTableBody = document.getElementById("patientTableBody");
        patientTableBody.innerHTML = ""; // Clear the table body

        const getAllRequest = store.getAll();
        getAllRequest.onsuccess = function (event) {
            const patients = event.target.result;
            patients.forEach(patient => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${patient.NHS}</td>
                    <td>${patient.Title}</td>
                    <td>${patient.First}</td>
                    <td>${patient.Last}</td>
                    <td>${patient.DOB}</td>
                    <td>${patient.Gender}</td>
                    <td>${patient.Address}</td>
                    <td>${patient.Email}</td>
                    <td>${patient.Telephone}</td>
                    <td>
                        <button onclick="updatePatient('${patient.NHS}')">Update</button>
                    </td>
                `;
                patientTableBody.appendChild(row);
            });
            document.getElementById("patientTable").style.display = "block";
        };

        getAllRequest.onerror = function () {
            alert("Error fetching all patients!");
        };
    };
}
// Function to add a new patient
function addNewPatient() {
    const nhs = document.getElementById("newNHS").value;
    const title = document.getElementById("newTitle").value;
    const first = document.getElementById("newFirst").value;
    const last = document.getElementById("newLast").value;
    const dob = document.getElementById("newDOB").value;
    const gender = document.getElementById("newGender").value;
    const address = document.getElementById("newAddress").value;
    const email = document.getElementById("newEmail").value;
    const telephone = document.getElementById("newTelephone").value;

    const request = indexedDB.open("HealthCareDB", 1);
    request.onsuccess = function (event) {
        const db = event.target.result;
        const transaction = db.transaction("Patient", "readwrite");
        const store = transaction.objectStore("Patient");

        const newPatient = {
            NHS: nhs,
            Title: title,
            First: first,
            Last: last,
            DOB: dob,
            Gender: gender,
            Address: address,
            Email: email,
            Telephone: telephone,
        };

        const addRequest = store.add(newPatient);
        addRequest.onsuccess = function () {
            alert("Patient added successfully!");
            document.getElementById("addPatientForm").reset();
        };

        addRequest.onerror = function () {
            alert("Error adding patient!");
        };
    };
}

// Function to update an existing patient (use form data to update)
function updatePatient(nhs) {
    const title = document.getElementById("newTitle").value;
    const first = document.getElementById("newFirst").value;
    const last = document.getElementById("newLast").value;
    const dob = document.getElementById("newDOB").value;
    const gender = document.getElementById("newGender").value;
    const address = document.getElementById("newAddress").value;
    const email = document.getElementById("newEmail").value;
    const telephone = document.getElementById("newTelephone").value;

    const request = indexedDB.open("HealthCareDB", 1);
    request.onsuccess = function (event) {
        const db = event.target.result;
        const transaction = db.transaction("Patient", "readwrite");
        const store = transaction.objectStore("Patient");

        const updatedPatient = {
            NHS: nhs,
            Title: title,
            First: first,
            Last: last,
            DOB: dob,
            Gender: gender,
            Address: address,
            Email: email,
            Telephone: telephone,
        };

        const updateRequest = store.put(updatedPatient);
        updateRequest.onsuccess = function () {
            alert("Patient updated successfully!");
        };

        updateRequest.onerror = function () {
            alert("Error updating patient!");
        };
    };
}

// Function to delete a patient record
function deletePatient(nhs) {
    const request = indexedDB.open("HealthCareDB", 1);
    request.onsuccess = function (event) {
        const db = event.target.result;
        const transaction = db.transaction("Patient", "readwrite");
        const store = transaction.objectStore("Patient");

        const deleteRequest = store.delete(nhs);
        deleteRequest.onsuccess = function () {
            alert("Patient deleted successfully!");
            displayAllPatients();  // Refresh the table after deletion
        };

        deleteRequest.onerror = function () {
            alert("Error deleting patient!");
        };
    };
}

// Function to find a patient by NHS Number (for the Find Patient form)
function findPatientByNHS(nhs) {
    const request = indexedDB.open("HealthCareDB", 1);
    request.onsuccess = function (event) {
        const db = event.target.result;
        const transaction = db.transaction("Patient", "readonly");
        const store = transaction.objectStore("Patient");
        const patientTableBody = document.getElementById("patientTableBody");
        patientTableBody.innerHTML = ""; // Clear the table body

        const getRequest = store.get(nhs);
        getRequest.onsuccess = function (event) {
            const patient = event.target.result;
            if (patient) {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${patient.NHS}</td>
                    <td>${patient.Title}</td>
                    <td>${patient.First}</td>
                    <td>${patient.Last}</td>
                    <td>${patient.DOB}</td>
                    <td>${patient.Gender}</td>
                    <td>${patient.Address}</td>
                    <td>${patient.Email}</td>
                    <td>${patient.Telephone}</td>
                    <td>
                        <button onclick="updatePatient('${patient.NHS}')">Update</button>
                        <button onclick="deletePatient('${patient.NHS}')">Delete</button>
                    </td>
                `;
                patientTableBody.appendChild(row);
                document.getElementById("patientTable").style.display = "block";
                document.getElementById("closeTableBtn").style.display = "inline";
            } else {
                alert("Patient not found!");
            }
        };

        getRequest.onerror = function () {
            alert("Error fetching patient!");
        };
    };
}

// Function to display all patients in the table
function displayAllPatients() {
    const request = indexedDB.open("HealthCareDB", 1);
    request.onsuccess = function (event) {
        const db = event.target.result;
        const transaction = db.transaction("Patient", "readonly");
        const store = transaction.objectStore("Patient");
        const patientTableBody = document.getElementById("patientTableBody");
        patientTableBody.innerHTML = ""; // Clear the table body

        const getAllRequest = store.getAll();
        getAllRequest.onsuccess = function (event) {
            const patients = event.target.result;
            patients.forEach(patient => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${patient.NHS}</td>
                    <td>${patient.Title}</td>
                    <td>${patient.First}</td>
                    <td>${patient.Last}</td>
                    <td>${patient.DOB}</td>
                    <td>${patient.Gender}</td>
                    <td>${patient.Address}</td>
                    <td>${patient.Email}</td>
                    <td>${patient.Telephone}</td>
                    <td>
                        <button onclick="updatePatient('${patient.NHS}')">Update</button>
                        <button onclick="deletePatient('${patient.NHS}')">Delete</button>
                    </td>
                `;
                patientTableBody.appendChild(row);
            });
            document.getElementById("patientTable").style.display = "block";
            document.getElementById("closeTableBtn").style.display = "inline";
        };

        getAllRequest.onerror = function () {
            alert("Error fetching all patients!");
        };
    };
}

// Function to close the patient table
function closePatientTable() {
    document.getElementById("patientTable").style.display = "none";
    document.getElementById("closeTableBtn").style.display = "none";
}
// Function to display all patients in the table (toggled by the Show All Patients button)
function togglePatientTable() {
    const table = document.getElementById("patientTable");
    const isTableVisible = table.style.display === "block";

    if (isTableVisible) {
        // If the table is currently visible, hide it
        table.style.display = "none";
        document.getElementById("closeTableBtn").style.display = "none";
    } else {
        // If the table is hidden, display it and load patient data
        displayAllPatients();
    }
}

// Function to display all patients in the table
function displayAllPatients() {
    const request = indexedDB.open("HealthCareDB", 1);
    request.onsuccess = function (event) {
        const db = event.target.result;
        const transaction = db.transaction("Patient", "readonly");
        const store = transaction.objectStore("Patient");
        const patientTableBody = document.getElementById("patientTableBody");
        patientTableBody.innerHTML = ""; // Clear the table body

        const getAllRequest = store.getAll();
        getAllRequest.onsuccess = function (event) {
            const patients = event.target.result;
            patients.forEach(patient => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${patient.NHS}</td>
                    <td>${patient.Title}</td>
                    <td>${patient.First}</td>
                    <td>${patient.Last}</td>
                    <td>${patient.DOB}</td>
                    <td>${patient.Gender}</td>
                    <td>${patient.Address}</td>
                    <td>${patient.Email}</td>
                    <td>${patient.Telephone}</td>
                    <td>
                        <button onclick="updatePatient('${patient.NHS}')">Update</button>
                        <button onclick="deletePatient('${patient.NHS}')">Delete</button>
                    </td>
                `;
                patientTableBody.appendChild(row);
            });
            document.getElementById("patientTable").style.display = "block";
            document.getElementById("closeTableBtn").style.display = "inline";
        };

        getAllRequest.onerror = function () {
            alert("Error fetching all patients!");
        };
    };
}

// Function to close the patient table
function closePatientTable() {
    document.getElementById("patientTable").style.display = "none";
    document.getElementById("closeTableBtn").style.display = "none";
}
