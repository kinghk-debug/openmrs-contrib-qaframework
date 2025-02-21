import {Given, Before, After, When} from 'cypress-cucumber-preprocessor/steps';

let identifier = null;
let patient = null;


Before({tags: '@clinical-visit'}, () => {
    cy.generateIdentifier().then((generatedIdentifier) => {
        identifier = generatedIdentifier;
        cy.createPatient(identifier).then((generatedPatient) => {
            patient = generatedPatient;
            cy.startFacilityVisit(patient.uuid);
            cy.generateLabResults(patient.uuid);
        });
    });
});

Given('the user is logged in', () => {    
    cy.on('uncaught:exception', (err, runnable) => {
    	console.log(err);
    	return false;
    });
    cy.login();
})

Given('the user arrives on a patient’s chart page', () => {
    cy.visit(`patient/${patient.uuid}/chart`);
});

Then('the Patient header should display correct information', () => {
    cy.contains(patient.person.display);
    cy.contains(`${patient.person.age} years`);
    cy.contains(identifier.toString());
});

Then('the user should be able to expand header to see more information', () => {
    cy.contains('Show all details').click({force: true});
    cy.contains('Address');
});

Then('the Patient Summary should load properly', () => {
    cy.get('div[data-extension-slot-name="patient-chart-summary-dashboard-slot"]').contains('Care Programs');
    cy.get('div[data-extension-slot-name="patient-chart-summary-dashboard-slot"]').contains('Active Medications');
    cy.get('div[data-extension-slot-name="patient-chart-summary-dashboard-slot"]').contains('Biometrics');
    cy.get('div[data-extension-slot-name="patient-chart-summary-dashboard-slot"]').contains('Vitals');
    cy.get('div[data-extension-slot-name="patient-chart-summary-dashboard-slot"]').contains('Forms');
    cy.get('div[data-extension-slot-name="patient-chart-summary-dashboard-slot"]').contains('Conditions');
    cy.get('div[data-extension-slot-name="patient-chart-summary-dashboard-slot"]').contains('Notes');
    cy.get('div[data-extension-slot-name="patient-chart-summary-dashboard-slot"]').contains('Appointments');
    cy.get('div[data-extension-slot-name="patient-chart-summary-dashboard-slot"]').contains('Allergies');
    cy.get('div[data-extension-slot-name="patient-chart-summary-dashboard-slot"]').contains('Immunizations');
    cy.get('div[data-extension-slot-name="patient-chart-summary-dashboard-slot"]').contains('Clinical Views');
});

When('the user clicks on {string} in the menu', (menu) => {
    cy.get('div[data-extension-id="patient-chart-nav-items"]').contains(menu).click();
});

Then('the program list should be empty', () => {
    cy.contains('There are no program enrollments to display for this patient');
});

When('the user enrolls the patient into a program', () => {
    cy.contains('Record program enrollments').click();
    cy.get('#program').select('HIV Care and Treatment');
    cy.get('button[type="submit"').click();
});

Then('the patient should be enrolled into the program', () => {
    cy.contains('Program enrollment saved');
    cy.reload();
    cy.contains('HIV Care and Treatment');
});

Then('the allergies list should be empty', () => {
    cy.contains('There are no allergy intolerances to display for this patient');
});

When('the user adds an allergy', () => {
    cy.contains('Record allergy intolerances').click({force: true});
    cy.contains('ACE inhibitors').click({force: true});
    cy.contains('Mental status change').click({force: true});
    cy.contains('Mild').click({force: true});
    // Click on the first day on the calendar
    cy.getByLabel('Date of first onset').click({force: true});
    cy.get('.dayContainer .flatpickr-day').first().click({force: true});
    cy.contains('Save and close').click({force: true});
});

Then('the added allergy should be listed', () => {
    cy.contains('Allergy saved');
    cy.reload();
    cy.contains('ACE inhibitors');
});

Then('the conditions list should be empty', () => {
    cy.contains('There are no conditions to display for this patient');
});

When('the user adds a condition', () => {
    cy.contains('Record conditions').click({force: true});
    cy.get('input[role="searchbox"]').type('Fever', {force: true});
    cy.contains('Fever').click();
    cy.contains('Save & Close').click({force: true});
});

Then('the added condition should be listed', () => {
    cy.contains('Condition saved successfully');
    cy.reload();
    cy.contains('Fever');
});

Then('the test results should be shown', () => {
    cy.contains('Viral load');
})

When('the user clicks on timeline of a test', () => {
    cy.contains('Timeline').click({force: true});
})

Then('the timeline table should be shown', () => {
    cy.contains('copies/ml');
})

When('the user clicks on trend of a test', () => {
    cy.contains('Trend').click({force: true});
})

Then('the trend line should be shown', () => {
    // Todo: Use a robust way to check for the trend line 
    cy.contains('Back to timeline');
})

When('the user changes the time range of a trend line', () => {
    cy.contains('5 days').click({force: true});
})

Then('the time range of the trend line should be changed', () => {
    cy.contains('Jan 20');
})

Then('the form entry widget should load properly', () => {
    cy.get('div[data-extension-id="patient-form-dashboard"]').contains('Forms');
    cy.get('div[data-extension-id="patient-form-dashboard"]').contains('Recommended');
    cy.get('div[data-extension-id="patient-form-dashboard"]').contains('Completed');
    cy.get('div[data-extension-id="patient-form-dashboard"]').contains('All');
});

When('the user clicks on {string} in the form widget', (tab) => {
    cy.get('div[data-extension-id="patient-form-dashboard"]').contains(tab).click({force: true});
});

Then('the forms list should be empty', () => {
    cy.contains('Sorry, no forms have been found');
});

Then('the forms list should load properly', () => {
    cy.contains('Last Completed');
    cy.contains('Form Name (A-Z)');
});

After({tags: '@clinical-visit'}, () => {
    cy.deletePatient(patient.uuid);
});
