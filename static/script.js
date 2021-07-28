'use strict';

//                <========== BANKIST APP ==========>                //

// DATA
const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2020-05-27T17:01:17.194Z',
    '2020-07-11T23:36:17.929Z',
    '2020-07-12T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};
const accounts = [account1, account2];

/*
const account3 = {
  owner: 'Steven Thomas Williams',
  movements: [200, -200, 340, -300, -20, 50, 400, -460],
  interestRate: 0.7,
  pin: 3333,
};

const account4 = {
  owner: 'Sarah Smith',
  movements: [430, 1000, 700, 50, 90],
  interestRate: 1,
  pin: 4444,
};
*/

// ELEMENTS
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

// FUNCTIONS

// Format dates
const formatMovementDate = function (date, locale) {
  const calcDaysPassed = (date1, date2) =>
    Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));

  const daysPassed = calcDaysPassed(new Date(), date);

  if (daysPassed === 0) return 'Today';
  if (daysPassed === 1) return 'Yesterday';
  if (daysPassed <= 7) return `${daysPassed} days ago`;

  return Intl.DateTimeFormat(locale).format(date);
};

// Format currencies
const formatCur = function (value, locale, currency) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(value);
};

// Display the account activity
const displayMovements = function (acc, sort = false) {
  containerMovements.innerHTML = '';

  const movs = sort
    ? acc.movements.slice().sort((a, b) => a - b)
    : acc.movements;

  movs.forEach((mov, i) => {
    const type = mov > 0 ? 'deposit' : 'withdrawal';

    const date = new Date(acc.movementsDates[i]);
    const displayDate = formatMovementDate(date, acc.locale);
    const formattedMov = formatCur(mov, acc.locale, acc.currency);

    const html = `
    <div class="movements__row">
      <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
    <div class="movements__date">${displayDate}</div>
      <div class="movements__value">${formattedMov}</div>
    </div>
    `;
    //Method to insert HTML string
    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

//Display account balance
const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);
  labelBalance.textContent = `${formatCur(
    acc.balance,
    acc.locale,
    acc.currency
  )}`;
};

//Display summary
const calcDisplaySummary = function (acc) {
  // Display deposit
  const amountIn = acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = `${formatCur(amountIn, acc.locale, acc.currency)}`;

  // Display withdrawal
  const amountOut = acc.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = `${formatCur(
    Math.abs(amountOut),
    acc.locale,
    acc.currency
  )}`;

  // Display Interest
  const amountInterest = acc.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * acc.interestRate) / 100)
    .filter(int => int >= 1)
    .reduce((acc, int) => acc + int, 0);
  labelSumInterest.textContent = `${formatCur(
    amountInterest,
    acc.locale,
    acc.currency
  )}`;
};

//Create username from the initials
const createUsername = function (accs) {
  accs.forEach(acc => {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('');
  });
};
createUsername(accounts);

const updateUI = function (acc) {
  //Display movements
  displayMovements(acc);

  //Display balance
  calcDisplayBalance(acc);

  //Display summary
  calcDisplaySummary(acc);
};

const startLogOutTimer = function () {
  const tick = function () {
    const min = String(Math.trunc(time / 60)).padStart(2, 0);
    const sec = String(time % 60).padStart(2, 0);

    // In each call, print the remaining time to UI
    labelTimer.textContent = `${min}:${sec}`;

    // When 0 seconds, stop timer and log out user
    if (time === 0) {
      clearInterval(timer);
      labelWelcome.textContent = 'Log in to get started';
      containerApp.classList.add('hide');
    }

    // Decrease 1s
    time--;
  };

  // Set time to 5 minutes
  let time = 120;

  // Call the timer every second
  tick();
  const timer = setInterval(tick, 1000);

  return timer;
};

//Event Listeners

let currentAccount, timer;

//Implement Login
btnLogin.addEventListener('click', function (e) {
  //Prevent form from submitting
  e.preventDefault();
  labelDate.textContent = formatMovementDate(new Date(), navigator.language);
  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  );
  if (currentAccount?.pin === +inputLoginPin.value) {
    //Display UI & message
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(' ')[0]
    }`;
    containerApp.classList.remove('hide');

    //Clear input fields
    inputLoginUsername.value = inputLoginPin.value = '';
    //Remove focus
    inputLoginPin.blur();

    //Update UI
    updateUI(currentAccount);

    // Reset timer
    if (timer) clearInterval(timer);
    timer = startLogOutTimer();
  }
});

//Implement transfer
btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  const transferAmount = +inputTransferAmount.value;
  const receiverAcc = accounts.find(
    acc => acc.username === inputTransferTo.value
  );

  //Clear input fields
  inputTransferTo.value = inputTransferAmount.value = '';
  inputTransferAmount.blur();

  //Perform the transaction for valid account and available balance
  if (
    transferAmount > 0 &&
    receiverAcc &&
    currentAccount.balance >= transferAmount &&
    receiverAcc?.username !== currentAccount.username
  ) {
    //Push the transaction
    currentAccount.movements.push(-transferAmount);
    receiverAcc.movements.push(transferAmount);

    //Push the date of transaction
    currentAccount.movementsDates.push(new Date().toISOString());
    receiverAcc.movementsDates.push(new Date().toISOString());

    //Update UI
    updateUI(currentAccount);

    // Reset timer
    if (timer) clearInterval(timer);
    timer = startLogOutTimer();
  }
});

//Implement loan
btnLoan.addEventListener('click', function (e) {
  e.preventDefault();
  const loanAmount = +inputLoanAmount.value;
  //Clear input fields
  inputLoanAmount.value = '';
  inputLoanAmount.blur();

  setTimeout(() => {
    if (
      loanAmount > 0 &&
      currentAccount.movements.some(mov => mov >= loanAmount * 0.1)
    ) {
      currentAccount.movements.push(loanAmount);
      //Push the date of transaction
      currentAccount.movementsDates.push(new Date().toISOString());
      updateUI(currentAccount);
      // Reset timer
      if (timer) clearInterval(timer);
      timer = startLogOutTimer();
    }
    inputLoanAmount.value = '';
  }, 10000);
});

//Implement close account
btnClose.addEventListener('click', function (e) {
  e.preventDefault();

  if (
    inputCloseUsername.value === currentAccount.username &&
    +inputClosePin.value === currentAccount.pin
  ) {
    const index = accounts.findIndex(
      acc => acc.username === currentAccount.username
    );
    //Delete the account
    accounts.splice(index, 1);
    //Hide the UI
    containerApp.classList.add('hide');

    labelWelcome.textContent = 'Log in to get started';
  }

  //Clear input fields
  inputCloseUsername.value = inputClosePin.value = '';
  inputClosePin.blur();
});

//Sort the movements
let sorted = false;

btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  displayMovements(currentAccount, !sorted);
  sorted = !sorted;
});
