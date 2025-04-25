// Promises from scratch to learn the fundamentals
// We are going to use the same code from the previous exercise

class PromiseSimple {
  constructor(executionFunction) {
    this.promiseChain = [];
    this.errorHandler = () => {};

    this.onResolve = this.onResolve.bind(this);
    this.onReject = this.onReject.bind(this);

    executionFunction(this.onResolve, this.onReject);
  }

  then(handleSuccess) {
    this.promiseChain.push(handleSuccess);

    return this;
  }

  catch(handleError) {
    this.errorHandler = handleError;

    return this;
  }

  onResolve(value) {
    let storedValue = value;
    try {
      this.promiseChain.forEach((nextFunction) => {
        storedValue = nextFunction(storedValue);
      });
    } catch (error) {
      this.promiseChain = [];
      this.onReject(error);
    }
  }

  onReject(error) {
    this.errorHandler(error);
  }
}

fakeBackend = () => {
  const user = {
    username: "treyhuffine",
    favoriteSport: "Soccer",
    profile: "https://gitconnected.com/treyhuffine",
  };
  // Introduce a randomizer to simulate the
  // the probability of encountering an error
  if (Math.random() > 0.5) {
    return {
      data: user,
      statusCode: 200,
    };
  } else {
    const error = {
      statusCode: 404,
      message: "User not found",
      error: "Not Found",
    };

    return error;
  }
};

// Assume this is your AJAX library. Almost all newer
// ones return a Promise Object

const makeApiCall = () => {
  return new PromiseSimple((resolve, reject) => {
    // Use a timeout to simulate the network delay waiting for the response.
    // This is THE reason you use a promise. It waits for the API to respond
    // and after received, it executes code in the `then()` blocks in order.
    // If it executed is immediately, there would be no data.
    setTimeout(() => {
      const apiResponse = fakeBackend();
      if (apiResponse.statusCode >= 400) {
        reject(apiResponse);
      } else {
        resolve(apiResponse.data);
      }
    }, 5000);
  });
};

makeApiCall()
  .then((user) => {
    console.log("In the first .then()");

    return user;
  })
  .then((user) => {
    console.log(
      `username: ${user.username}'s favorite sport: ${user.favoriteSport}`
    );
    // console.log(user); // same as
    return user;
  })
  .then((user) => {
    console.log(`The previous .then() gave you back the user's favorite sport`);
    // console.log(user.profile); //
    return user.profile;
  })
  .then((profile) => {
    console.log(`The profile URL is ${profile}`);
  })
  .then(() => {
    console.log("This is the last then()");
  })
  .catch((error) => {
    console.log(error.message);
  });
