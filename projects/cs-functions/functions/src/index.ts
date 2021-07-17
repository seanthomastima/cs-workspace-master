import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

/*
 * data should have 'emailAddress'
 * Returns an object in the form {UID: string}
 */
exports.userHasSignIn = functions.https.onCall(async (data, context) => {

  let result: {UID: string} = {UID: ''};

  await admin.auth().getUserByEmail(data.emailAddress)
    .then(authInfo => {
      result = {UID: authInfo.uid};
    })
    .catch(error => {
      console.log('Error in userHasSignIn: ', error);
    });

  return result;

});

/*
 * data should have 'UID'
 * Returns an object in the form {
 * UID:            string,
 * name:           string | undefined,
 * emailAddress:   string | undefined}
 */
exports.getAuthUserDetailsFromUID = functions.https.onCall(async (data) => {

  let result: {
    UID:            string,
    name:           string | undefined,
    emailAddress:   string | undefined
  } = {
    UID:            '',
    name:           '',
    emailAddress:   ''};

  await admin.auth().getUser(data.UID)
    .then(authInfo => {
      result = {UID: authInfo.uid, name: authInfo.displayName, emailAddress: authInfo.email};
    })
    .catch(error => {
      console.log('Error in getAuthUserDetailsFromUID: ', error);
    });

  return result;

});

exports.addSignInUser = functions.https.onCall(async (data, context) => {

  let result = {};

  await admin.auth().createUser({
    email:            data.emailAddress,
    emailVerified:    false,
    password:         data.password,
    displayName:      data.name,
    disabled:         false
  })
    .then(userRecord => {
        console.log('Added sign in user ' + data.emailAddress);
        result = {UID: userRecord.uid};
      }
    )
    .catch(function(error) {
      console.log('Error adding sign in user:', error);
      result = {Error: 'Add Sign In User failed'};
    });

  return result;

});

exports.deleteSignInUser = functions.https.onCall(async (data, context) => {

  let result: {} = {User: data.name};

  await admin.auth().deleteUser(data.FSKey)
    .then(() => console.log('Deleted sign in user ' + data.FSKey)
    )
    .catch(function(error) {
      console.log('Error deleting sign in user:', error);
      result = {Error: 'Delete Sign In User failed'};
    });

  return result;

});

exports.addSuperAdministrator = functions.https.onCall(async (data, context) => {

  await admin.auth().createUser({
    email: data.userDetails.emailAddress,
    emailVerified: false,
    password: data.userDetails.password,
    displayName: data.userDetails.name,
    disabled: false
  })
    .then(async (userRecord) => {

      console.log("Successfully created new user:", userRecord.uid);

      const newUser = {
        FSKey:          userRecord.uid,
        name:           data.userDetails.name,
        emailAddress:   data.userDetails.emailAddress
      };

      await admin.firestore().collection('super-administrators').doc(userRecord.uid).set(newUser).then(documentReference => {
        console.log(data.userDetails.emailAddress);
      });

    })
    .catch(function(error) {
      console.log("Error creating new user:", error);
    });

  return {User: data.userDetails.name};

});

exports.updateSuperAdministrator = functions.https.onCall(async (data, context) => {

  await admin.auth().updateUser(
    data.FSKey,
    {
      email:        data.emailAddress,
      displayName:  data.name
    }
  )
    .then(async (userRecord) => {

      console.log("Successfully updated user:", userRecord.uid);

      const updatedUser = {
        name:           data.name,
        emailAddress:   data.emailAddress
      };

      await admin.firestore()
        .collection('super-administrators')
        .doc(userRecord.uid).update(updatedUser)
        .then(documentReference => {

        console.log(data.emailAddress);

      });

    })
    .catch(function(error) {
      console.log("Error updating user: ", error);
    });

  return {User: data.name};

});

exports.deleteSuperAdministrator = functions.https.onCall(async (data, context) => {

  await admin.auth().deleteUser(data.userDetails.FSKey)
    .then(async (userRecord) => {

      console.log("Successfully deleted user:", data.userDetails.FSKey);

      await admin.firestore().collection('super-administrators').doc(data.userDetails.FSKey).delete().then(documentReference => {
        console.log(data.userDetails.emailAddress);
      });

    })
    .catch(function(error) {
      console.log("Error deleting user:", error);
    });

  return {User: data.userDetails.name};

});

exports.addCustomer = functions.https.onCall(async (data, context) => {

  const newCustomer = {
    FSKey:                docName(),
    name:                 data.customer.name,
    description:          data.customer.description,
    customerSignInKey:    data.customer.customerSignInKey,
    active:               data.customer.active
  };

  await admin.firestore().collection('customers').doc(newCustomer.FSKey).set(newCustomer).then(documentReference => {
    console.log(data.customer.name);
  });

  return {Customer: data.customer.name};

});

exports.updateCustomer = functions.https.onCall(async (data, context) => {

  let result: {} = {Customer: data.name};

  const updatedCustomer = {
    FSKey:                data.FSKey,
    name:                 data.name,
    description:          data.description,
    customerSignInKey:    data.customerSignInKey,
    active:               data.active
  };

  await admin.firestore().collection('customers').doc(data.FSKey).update(updatedCustomer)
    .then(documentReference => {
      console.log('Customer updated: ' + data.name);
    })
    .catch(error => {
      result = {Error: 'Update Customer failed'};
    });

  return result;

});

exports.deleteCustomer = functions.https.onCall(async (data, context) => {

  await admin.firestore().collection('customers').doc(data.customer.FSKey).delete().then(documentReference => {
    console.log(data.customer.name);
  });

  return {User: data.customer.name};

});

exports.addCustomerAdministrator = functions.https.onCall(async (data, context) => {

  let result: {} = {User: data.name};

  await admin.auth().createUser({
    email:            data.emailAddress,
    emailVerified:    false,
    password:         data.password,
    displayName:      data.name,
    disabled:         false
  })
    .then(async (userRecord) => {

      console.log("Successfully created new user:", userRecord.uid);

      const path = 'customers/' + data.customerFSKey + '/administrators';

      data.FSKey = userRecord.uid;

      await admin.firestore().collection(path).doc(userRecord.uid).set(data).then(documentReference => {
        console.log(data.name);
      });

    })
    .catch(function(error) {
      console.log("Error creating new user:", error);
      result = {Error: 'Administrator not created'};
    });

  return result;

});

exports.updateCustomerAdministrator = functions.https.onCall(async (data, context) => {

  let result: {} = {User: data.name};

  await admin.auth().updateUser(data.FSKey, {
    email: data.emailAddress,
    displayName: data.name
  })
    .then(async (userRecord) => {

      console.log("Successfully updated user:", userRecord.uid);

      const path = 'customers/' + data.customerFSKey + '/administrators';

      const administrator = {
        FSKey:                userRecord.uid,
        name:                 data.name,
        emailAddress:         data.emailAddress,
        customerFSKey:        data.customerFSKey
      };

      await admin.firestore().collection(path).doc(userRecord.uid).update(administrator).then(documentReference => {
        console.log(data.emailAddress);
      });

    })
    .catch(function(error) {
      console.log("Error updating user:", error);
      result = {Error: 'Update Customer Administrator failed'};
    });

  return result;

});

exports.deleteCustomerAdministrator = functions.https.onCall(async (data, context) => {

  let result: {} = {User: data.name};

  await admin.auth().deleteUser(data.FSKey)
    .then(async (userRecord) => {

      console.log("Successfully deleted user:", data.FSKey);

      const path = 'customers/' + data.customerFSKey + '/administrators';

      await admin.firestore().collection(path).doc(data.FSKey).delete().then(documentReference => {
        console.log(data.emailAddress);
      });

    })
    .catch(function(error) {
      console.log("Error deleting user:", error);
      result = {Error: 'Deleting Customer Administrator failed'};
    });

  return result;

});

/*
 * data should have 'emailAddress' and 'customerFSKey' properties.
 * Returns an object in the form {hasUser: bool}
 */
exports.customerHasUser = functions.https.onCall(async (data) => {

  let result: {hasUser: boolean} = {hasUser: false};

  await admin.firestore()
    .collection(`customers/${data.customerFSKey}/users`)
    .where('emailAddress', '==', data.emailAddress)
    .get()
    .then(res => res.docs.length === 0 ? result = {hasUser: false} : result = {hasUser: true});

  console.log('customerHasUser: ' + result.hasUser);

  return result;

})

exports.addCustomerUser = functions.https.onCall(async (data, context) => {

  let result: {} = {User: data.name};

  await admin.auth().createUser({
    email:            data.emailAddress,
    emailVerified:    false,
    password:         data.password,
    displayName:      data.name,
    disabled:         false
  })
    .then(async (userRecord) => {

      console.log("Successfully created new User:", userRecord.uid);

      const path = 'customers/' + data.customerFSKey + '/users';
      // const path = `${FS.Customers}/${data.customerFSKey}/${FS.Users}`;

      data.FSKey = userRecord.uid;

      delete data.password;

      await admin.firestore().collection(path).doc(userRecord.uid).set(data).then(documentReference => {
        console.log(data.name);
      });

      result = {User: data};

    })
    .catch(function(error) {
      console.log("Error creating new User:", error);
      result = {Error: 'User not created'};
    });

  return result;

});

exports.updateCustomerUser = functions.https.onCall(async (data, context) => {

  let result: {} = {User: data.name};

  await admin.auth().updateUser(data.FSKey, {
    email: data.emailAddress,
    displayName: data.name
  })
    .then(async (userRecord) => {

      console.log("Successfully updated User:", userRecord.uid);

      const path = 'customers/' + data.customerFSKey + '/users';
      // const path = `${FS.Customers}/${data.customerFSKey}/${FS.Users}`;

      await admin.firestore().collection(path).doc(userRecord.uid).update(data).then(documentReference => {
        console.log(data.emailAddress);
      });

    })
    .catch(function(error) {
      console.log("Error updating User:", error);
      result = {Error: 'Update User failed'};
    });

  return result;

});

exports.deleteCustomerUser = functions.https.onCall(async (data, context) => {

  let result: {} = {User: data.name};

  const path = 'customers/' + data.customerFSKey + '/users';

  await admin.firestore().collection(path).doc(data.FSKey).delete()
    .then(documentReference => {
      console.log('Deleted ' + data.emailAddress);
    })
    .catch(function(error) {
      console.log('Error deleting User:', error);
      result = {Error: 'Delete User failed'};
    });

  return result;

});

/**
 * Utilities
 */
function docName(): string {
  return Date.now().toString() + randomString();
}

function randomString(length= 5): string {
  let text = '';
  const pickString = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (let i = 0; i < length; i++) {
    text += pickString.charAt(Math.floor(Math.random() * pickString.length));
  }

  return text;
}


