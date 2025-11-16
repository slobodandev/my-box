# Generated TypeScript README
This README will guide you through the process of using the generated JavaScript SDK package for the connector `mybox-connector`. It will also provide examples on how to use your generated SDK to call your Data Connect queries and mutations.

***NOTE:** This README is generated alongside the generated SDK. If you make changes to this file, they will be overwritten when the SDK is regenerated.*

# Table of Contents
- [**Overview**](#generated-javascript-readme)
- [**Accessing the connector**](#accessing-the-connector)
  - [*Connecting to the local Emulator*](#connecting-to-the-local-emulator)
- [**Queries**](#queries)
  - [*GetUser*](#getuser)
  - [*GetUserByEmail*](#getuserbyemail)
  - [*ListAllUsers*](#listallusers)
  - [*GetUserLoans*](#getuserloans)
  - [*GetLoan*](#getloan)
  - [*GetLoanByNumber*](#getloanbynumber)
  - [*GetUserFiles*](#getuserfiles)
  - [*GetFilesByLoan*](#getfilesbyloan)
  - [*GetFile*](#getfile)
  - [*GetFilesWithAssociations*](#getfileswithassociations)
  - [*GetFileAssociations*](#getfileassociations)
  - [*GetLoanAssociations*](#getloanassociations)
  - [*GetAuthSession*](#getauthsession)
  - [*GetUserAuthSessions*](#getuserauthsessions)
  - [*GetVerificationCode*](#getverificationcode)
  - [*GetAuthAuditLogs*](#getauthauditlogs)
  - [*GetAuthSessionByFirebaseUid*](#getauthsessionbyfirebaseuid)
  - [*GetAuthSessionByEmailHash*](#getauthsessionbyemailhash)
  - [*GetActiveAuthSessionForUser*](#getactiveauthsessionforuser)
  - [*GetDashboard*](#getdashboard)
  - [*GetLoanDetails*](#getloandetails)
- [**Mutations**](#mutations)
  - [*CreateUser*](#createuser)
  - [*UpdateUser*](#updateuser)
  - [*DeactivateUser*](#deactivateuser)
  - [*CreateLoan*](#createloan)
  - [*UpdateLoan*](#updateloan)
  - [*CloseLoan*](#closeloan)
  - [*DeleteLoan*](#deleteloan)
  - [*CreateFile*](#createfile)
  - [*UpdateFile*](#updatefile)
  - [*SoftDeleteFile*](#softdeletefile)
  - [*HardDeleteFile*](#harddeletefile)
  - [*AssociateFileWithLoan*](#associatefilewithloan)
  - [*RemoveFileFromLoan*](#removefilefromloan)
  - [*CreateAuthSession*](#createauthsession)
  - [*CreateAuthSessionWithFirebase*](#createauthsessionwithfirebase)
  - [*UpdateAuthSession*](#updateauthsession)
  - [*VerifyAuthSession*](#verifyauthsession)
  - [*UpdateSessionAccess*](#updatesessionaccess)
  - [*RevokeAuthSession*](#revokeauthsession)
  - [*CreateVerificationCode*](#createverificationcode)
  - [*UpdateVerificationCodeAttempts*](#updateverificationcodeattempts)
  - [*MarkVerificationCodeUsed*](#markverificationcodeused)
  - [*LogAuthEvent*](#logauthevent)
  - [*TrackRateLimit*](#trackratelimit)
  - [*UpdateRateLimit*](#updateratelimit)
  - [*DeleteExpiredSessions*](#deleteexpiredsessions)
  - [*DeleteExpiredVerificationCodes*](#deleteexpiredverificationcodes)

# Accessing the connector
A connector is a collection of Queries and Mutations. One SDK is generated for each connector - this SDK is generated for the connector `mybox-connector`. You can find more information about connectors in the [Data Connect documentation](https://firebase.google.com/docs/data-connect#how-does).

You can use this generated SDK by importing from the package `@mybox/dataconnect` as shown below. Both CommonJS and ESM imports are supported.

You can also follow the instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#set-client).

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@mybox/dataconnect';

const dataConnect = getDataConnect(connectorConfig);
```

## Connecting to the local Emulator
By default, the connector will connect to the production service.

To connect to the emulator, you can use the following code.
You can also follow the emulator instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#instrument-clients).

```typescript
import { connectDataConnectEmulator, getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@mybox/dataconnect';

const dataConnect = getDataConnect(connectorConfig);
connectDataConnectEmulator(dataConnect, 'localhost', 9399);
```

After it's initialized, you can call your Data Connect [queries](#queries) and [mutations](#mutations) from your generated SDK.

# Queries

There are two ways to execute a Data Connect Query using the generated Web SDK:
- Using a Query Reference function, which returns a `QueryRef`
  - The `QueryRef` can be used as an argument to `executeQuery()`, which will execute the Query and return a `QueryPromise`
- Using an action shortcut function, which returns a `QueryPromise`
  - Calling the action shortcut function will execute the Query and return a `QueryPromise`

The following is true for both the action shortcut function and the `QueryRef` function:
- The `QueryPromise` returned will resolve to the result of the Query once it has finished executing
- If the Query accepts arguments, both the action shortcut function and the `QueryRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Query
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `mybox-connector` connector's generated functions to execute each query. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-queries).

## GetUser
You can execute the `GetUser` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
getUser(vars: GetUserVariables): QueryPromise<GetUserData, GetUserVariables>;

interface GetUserRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetUserVariables): QueryRef<GetUserData, GetUserVariables>;
}
export const getUserRef: GetUserRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getUser(dc: DataConnect, vars: GetUserVariables): QueryPromise<GetUserData, GetUserVariables>;

interface GetUserRef {
  ...
  (dc: DataConnect, vars: GetUserVariables): QueryRef<GetUserData, GetUserVariables>;
}
export const getUserRef: GetUserRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getUserRef:
```typescript
const name = getUserRef.operationName;
console.log(name);
```

### Variables
The `GetUser` query requires an argument of type `GetUserVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetUserVariables {
  id: UUIDString;
}
```
### Return Type
Recall that executing the `GetUser` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetUserData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetUserData {
  user?: {
    id: UUIDString;
    email: string;
    firstName?: string | null;
    lastName?: string | null;
    role: string;
    isActive: boolean;
    phoneNumber?: string | null;
    createdAt: TimestampString;
    lastLoginAt?: TimestampString | null;
  } & User_Key;
}
```
### Using `GetUser`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getUser, GetUserVariables } from '@mybox/dataconnect';

// The `GetUser` query requires an argument of type `GetUserVariables`:
const getUserVars: GetUserVariables = {
  id: ..., 
};

// Call the `getUser()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getUser(getUserVars);
// Variables can be defined inline as well.
const { data } = await getUser({ id: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getUser(dataConnect, getUserVars);

console.log(data.user);

// Or, you can use the `Promise` API.
getUser(getUserVars).then((response) => {
  const data = response.data;
  console.log(data.user);
});
```

### Using `GetUser`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getUserRef, GetUserVariables } from '@mybox/dataconnect';

// The `GetUser` query requires an argument of type `GetUserVariables`:
const getUserVars: GetUserVariables = {
  id: ..., 
};

// Call the `getUserRef()` function to get a reference to the query.
const ref = getUserRef(getUserVars);
// Variables can be defined inline as well.
const ref = getUserRef({ id: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getUserRef(dataConnect, getUserVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.user);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.user);
});
```

## GetUserByEmail
You can execute the `GetUserByEmail` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
getUserByEmail(vars: GetUserByEmailVariables): QueryPromise<GetUserByEmailData, GetUserByEmailVariables>;

interface GetUserByEmailRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetUserByEmailVariables): QueryRef<GetUserByEmailData, GetUserByEmailVariables>;
}
export const getUserByEmailRef: GetUserByEmailRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getUserByEmail(dc: DataConnect, vars: GetUserByEmailVariables): QueryPromise<GetUserByEmailData, GetUserByEmailVariables>;

interface GetUserByEmailRef {
  ...
  (dc: DataConnect, vars: GetUserByEmailVariables): QueryRef<GetUserByEmailData, GetUserByEmailVariables>;
}
export const getUserByEmailRef: GetUserByEmailRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getUserByEmailRef:
```typescript
const name = getUserByEmailRef.operationName;
console.log(name);
```

### Variables
The `GetUserByEmail` query requires an argument of type `GetUserByEmailVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetUserByEmailVariables {
  email: string;
}
```
### Return Type
Recall that executing the `GetUserByEmail` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetUserByEmailData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetUserByEmailData {
  users: ({
    id: UUIDString;
    email: string;
    firstName?: string | null;
    lastName?: string | null;
    role: string;
    isActive: boolean;
  } & User_Key)[];
}
```
### Using `GetUserByEmail`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getUserByEmail, GetUserByEmailVariables } from '@mybox/dataconnect';

// The `GetUserByEmail` query requires an argument of type `GetUserByEmailVariables`:
const getUserByEmailVars: GetUserByEmailVariables = {
  email: ..., 
};

// Call the `getUserByEmail()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getUserByEmail(getUserByEmailVars);
// Variables can be defined inline as well.
const { data } = await getUserByEmail({ email: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getUserByEmail(dataConnect, getUserByEmailVars);

console.log(data.users);

// Or, you can use the `Promise` API.
getUserByEmail(getUserByEmailVars).then((response) => {
  const data = response.data;
  console.log(data.users);
});
```

### Using `GetUserByEmail`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getUserByEmailRef, GetUserByEmailVariables } from '@mybox/dataconnect';

// The `GetUserByEmail` query requires an argument of type `GetUserByEmailVariables`:
const getUserByEmailVars: GetUserByEmailVariables = {
  email: ..., 
};

// Call the `getUserByEmailRef()` function to get a reference to the query.
const ref = getUserByEmailRef(getUserByEmailVars);
// Variables can be defined inline as well.
const ref = getUserByEmailRef({ email: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getUserByEmailRef(dataConnect, getUserByEmailVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.users);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.users);
});
```

## ListAllUsers
You can execute the `ListAllUsers` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
listAllUsers(): QueryPromise<ListAllUsersData, undefined>;

interface ListAllUsersRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListAllUsersData, undefined>;
}
export const listAllUsersRef: ListAllUsersRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listAllUsers(dc: DataConnect): QueryPromise<ListAllUsersData, undefined>;

interface ListAllUsersRef {
  ...
  (dc: DataConnect): QueryRef<ListAllUsersData, undefined>;
}
export const listAllUsersRef: ListAllUsersRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listAllUsersRef:
```typescript
const name = listAllUsersRef.operationName;
console.log(name);
```

### Variables
The `ListAllUsers` query has no variables.
### Return Type
Recall that executing the `ListAllUsers` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListAllUsersData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ListAllUsersData {
  users: ({
    id: UUIDString;
    email: string;
    firstName?: string | null;
    lastName?: string | null;
    role: string;
    isActive: boolean;
    createdAt: TimestampString;
  } & User_Key)[];
}
```
### Using `ListAllUsers`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listAllUsers } from '@mybox/dataconnect';


// Call the `listAllUsers()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listAllUsers();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listAllUsers(dataConnect);

console.log(data.users);

// Or, you can use the `Promise` API.
listAllUsers().then((response) => {
  const data = response.data;
  console.log(data.users);
});
```

### Using `ListAllUsers`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listAllUsersRef } from '@mybox/dataconnect';


// Call the `listAllUsersRef()` function to get a reference to the query.
const ref = listAllUsersRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listAllUsersRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.users);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.users);
});
```

## GetUserLoans
You can execute the `GetUserLoans` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
getUserLoans(vars: GetUserLoansVariables): QueryPromise<GetUserLoansData, GetUserLoansVariables>;

interface GetUserLoansRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetUserLoansVariables): QueryRef<GetUserLoansData, GetUserLoansVariables>;
}
export const getUserLoansRef: GetUserLoansRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getUserLoans(dc: DataConnect, vars: GetUserLoansVariables): QueryPromise<GetUserLoansData, GetUserLoansVariables>;

interface GetUserLoansRef {
  ...
  (dc: DataConnect, vars: GetUserLoansVariables): QueryRef<GetUserLoansData, GetUserLoansVariables>;
}
export const getUserLoansRef: GetUserLoansRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getUserLoansRef:
```typescript
const name = getUserLoansRef.operationName;
console.log(name);
```

### Variables
The `GetUserLoans` query requires an argument of type `GetUserLoansVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetUserLoansVariables {
  userId: UUIDString;
}
```
### Return Type
Recall that executing the `GetUserLoans` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetUserLoansData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetUserLoansData {
  loans: ({
    id: UUIDString;
    loanNumber: string;
    borrowerName: string;
    borrowerEmail?: string | null;
    loanAmount?: number | null;
    loanType?: string | null;
    status: string;
    propertyAddress?: string | null;
    createdAt: TimestampString;
    closedAt?: TimestampString | null;
  } & Loan_Key)[];
}
```
### Using `GetUserLoans`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getUserLoans, GetUserLoansVariables } from '@mybox/dataconnect';

// The `GetUserLoans` query requires an argument of type `GetUserLoansVariables`:
const getUserLoansVars: GetUserLoansVariables = {
  userId: ..., 
};

// Call the `getUserLoans()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getUserLoans(getUserLoansVars);
// Variables can be defined inline as well.
const { data } = await getUserLoans({ userId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getUserLoans(dataConnect, getUserLoansVars);

console.log(data.loans);

// Or, you can use the `Promise` API.
getUserLoans(getUserLoansVars).then((response) => {
  const data = response.data;
  console.log(data.loans);
});
```

### Using `GetUserLoans`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getUserLoansRef, GetUserLoansVariables } from '@mybox/dataconnect';

// The `GetUserLoans` query requires an argument of type `GetUserLoansVariables`:
const getUserLoansVars: GetUserLoansVariables = {
  userId: ..., 
};

// Call the `getUserLoansRef()` function to get a reference to the query.
const ref = getUserLoansRef(getUserLoansVars);
// Variables can be defined inline as well.
const ref = getUserLoansRef({ userId: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getUserLoansRef(dataConnect, getUserLoansVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.loans);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.loans);
});
```

## GetLoan
You can execute the `GetLoan` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
getLoan(vars: GetLoanVariables): QueryPromise<GetLoanData, GetLoanVariables>;

interface GetLoanRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetLoanVariables): QueryRef<GetLoanData, GetLoanVariables>;
}
export const getLoanRef: GetLoanRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getLoan(dc: DataConnect, vars: GetLoanVariables): QueryPromise<GetLoanData, GetLoanVariables>;

interface GetLoanRef {
  ...
  (dc: DataConnect, vars: GetLoanVariables): QueryRef<GetLoanData, GetLoanVariables>;
}
export const getLoanRef: GetLoanRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getLoanRef:
```typescript
const name = getLoanRef.operationName;
console.log(name);
```

### Variables
The `GetLoan` query requires an argument of type `GetLoanVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetLoanVariables {
  id: UUIDString;
}
```
### Return Type
Recall that executing the `GetLoan` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetLoanData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetLoanData {
  loan?: {
    id: UUIDString;
    userId: UUIDString;
    loanNumber: string;
    borrowerName: string;
    borrowerEmail?: string | null;
    loanAmount?: number | null;
    loanType?: string | null;
    status: string;
    propertyAddress?: string | null;
    loanOfficerId?: UUIDString | null;
    notes?: string | null;
    createdAt: TimestampString;
    updatedAt: TimestampString;
    closedAt?: TimestampString | null;
  } & Loan_Key;
}
```
### Using `GetLoan`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getLoan, GetLoanVariables } from '@mybox/dataconnect';

// The `GetLoan` query requires an argument of type `GetLoanVariables`:
const getLoanVars: GetLoanVariables = {
  id: ..., 
};

// Call the `getLoan()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getLoan(getLoanVars);
// Variables can be defined inline as well.
const { data } = await getLoan({ id: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getLoan(dataConnect, getLoanVars);

console.log(data.loan);

// Or, you can use the `Promise` API.
getLoan(getLoanVars).then((response) => {
  const data = response.data;
  console.log(data.loan);
});
```

### Using `GetLoan`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getLoanRef, GetLoanVariables } from '@mybox/dataconnect';

// The `GetLoan` query requires an argument of type `GetLoanVariables`:
const getLoanVars: GetLoanVariables = {
  id: ..., 
};

// Call the `getLoanRef()` function to get a reference to the query.
const ref = getLoanRef(getLoanVars);
// Variables can be defined inline as well.
const ref = getLoanRef({ id: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getLoanRef(dataConnect, getLoanVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.loan);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.loan);
});
```

## GetLoanByNumber
You can execute the `GetLoanByNumber` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
getLoanByNumber(vars: GetLoanByNumberVariables): QueryPromise<GetLoanByNumberData, GetLoanByNumberVariables>;

interface GetLoanByNumberRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetLoanByNumberVariables): QueryRef<GetLoanByNumberData, GetLoanByNumberVariables>;
}
export const getLoanByNumberRef: GetLoanByNumberRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getLoanByNumber(dc: DataConnect, vars: GetLoanByNumberVariables): QueryPromise<GetLoanByNumberData, GetLoanByNumberVariables>;

interface GetLoanByNumberRef {
  ...
  (dc: DataConnect, vars: GetLoanByNumberVariables): QueryRef<GetLoanByNumberData, GetLoanByNumberVariables>;
}
export const getLoanByNumberRef: GetLoanByNumberRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getLoanByNumberRef:
```typescript
const name = getLoanByNumberRef.operationName;
console.log(name);
```

### Variables
The `GetLoanByNumber` query requires an argument of type `GetLoanByNumberVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetLoanByNumberVariables {
  loanNumber: string;
}
```
### Return Type
Recall that executing the `GetLoanByNumber` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetLoanByNumberData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetLoanByNumberData {
  loans: ({
    id: UUIDString;
    userId: UUIDString;
    loanNumber: string;
    borrowerName: string;
    loanAmount?: number | null;
    status: string;
  } & Loan_Key)[];
}
```
### Using `GetLoanByNumber`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getLoanByNumber, GetLoanByNumberVariables } from '@mybox/dataconnect';

// The `GetLoanByNumber` query requires an argument of type `GetLoanByNumberVariables`:
const getLoanByNumberVars: GetLoanByNumberVariables = {
  loanNumber: ..., 
};

// Call the `getLoanByNumber()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getLoanByNumber(getLoanByNumberVars);
// Variables can be defined inline as well.
const { data } = await getLoanByNumber({ loanNumber: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getLoanByNumber(dataConnect, getLoanByNumberVars);

console.log(data.loans);

// Or, you can use the `Promise` API.
getLoanByNumber(getLoanByNumberVars).then((response) => {
  const data = response.data;
  console.log(data.loans);
});
```

### Using `GetLoanByNumber`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getLoanByNumberRef, GetLoanByNumberVariables } from '@mybox/dataconnect';

// The `GetLoanByNumber` query requires an argument of type `GetLoanByNumberVariables`:
const getLoanByNumberVars: GetLoanByNumberVariables = {
  loanNumber: ..., 
};

// Call the `getLoanByNumberRef()` function to get a reference to the query.
const ref = getLoanByNumberRef(getLoanByNumberVars);
// Variables can be defined inline as well.
const ref = getLoanByNumberRef({ loanNumber: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getLoanByNumberRef(dataConnect, getLoanByNumberVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.loans);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.loans);
});
```

## GetUserFiles
You can execute the `GetUserFiles` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
getUserFiles(vars: GetUserFilesVariables): QueryPromise<GetUserFilesData, GetUserFilesVariables>;

interface GetUserFilesRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetUserFilesVariables): QueryRef<GetUserFilesData, GetUserFilesVariables>;
}
export const getUserFilesRef: GetUserFilesRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getUserFiles(dc: DataConnect, vars: GetUserFilesVariables): QueryPromise<GetUserFilesData, GetUserFilesVariables>;

interface GetUserFilesRef {
  ...
  (dc: DataConnect, vars: GetUserFilesVariables): QueryRef<GetUserFilesData, GetUserFilesVariables>;
}
export const getUserFilesRef: GetUserFilesRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getUserFilesRef:
```typescript
const name = getUserFilesRef.operationName;
console.log(name);
```

### Variables
The `GetUserFiles` query requires an argument of type `GetUserFilesVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetUserFilesVariables {
  userId: UUIDString;
  includeDeleted?: boolean | null;
}
```
### Return Type
Recall that executing the `GetUserFiles` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetUserFilesData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetUserFilesData {
  files: ({
    id: UUIDString;
    originalFilename: string;
    storagePath: string;
    fileSize: number;
    mimeType?: string | null;
    fileExtension?: string | null;
    uploadedAt: TimestampString;
    tags?: string | null;
    description?: string | null;
    downloadUrl?: string | null;
    isDeleted: boolean;
  } & File_Key)[];
}
```
### Using `GetUserFiles`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getUserFiles, GetUserFilesVariables } from '@mybox/dataconnect';

// The `GetUserFiles` query requires an argument of type `GetUserFilesVariables`:
const getUserFilesVars: GetUserFilesVariables = {
  userId: ..., 
  includeDeleted: ..., // optional
};

// Call the `getUserFiles()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getUserFiles(getUserFilesVars);
// Variables can be defined inline as well.
const { data } = await getUserFiles({ userId: ..., includeDeleted: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getUserFiles(dataConnect, getUserFilesVars);

console.log(data.files);

// Or, you can use the `Promise` API.
getUserFiles(getUserFilesVars).then((response) => {
  const data = response.data;
  console.log(data.files);
});
```

### Using `GetUserFiles`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getUserFilesRef, GetUserFilesVariables } from '@mybox/dataconnect';

// The `GetUserFiles` query requires an argument of type `GetUserFilesVariables`:
const getUserFilesVars: GetUserFilesVariables = {
  userId: ..., 
  includeDeleted: ..., // optional
};

// Call the `getUserFilesRef()` function to get a reference to the query.
const ref = getUserFilesRef(getUserFilesVars);
// Variables can be defined inline as well.
const ref = getUserFilesRef({ userId: ..., includeDeleted: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getUserFilesRef(dataConnect, getUserFilesVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.files);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.files);
});
```

## GetFilesByLoan
You can execute the `GetFilesByLoan` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
getFilesByLoan(vars: GetFilesByLoanVariables): QueryPromise<GetFilesByLoanData, GetFilesByLoanVariables>;

interface GetFilesByLoanRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetFilesByLoanVariables): QueryRef<GetFilesByLoanData, GetFilesByLoanVariables>;
}
export const getFilesByLoanRef: GetFilesByLoanRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getFilesByLoan(dc: DataConnect, vars: GetFilesByLoanVariables): QueryPromise<GetFilesByLoanData, GetFilesByLoanVariables>;

interface GetFilesByLoanRef {
  ...
  (dc: DataConnect, vars: GetFilesByLoanVariables): QueryRef<GetFilesByLoanData, GetFilesByLoanVariables>;
}
export const getFilesByLoanRef: GetFilesByLoanRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getFilesByLoanRef:
```typescript
const name = getFilesByLoanRef.operationName;
console.log(name);
```

### Variables
The `GetFilesByLoan` query requires an argument of type `GetFilesByLoanVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetFilesByLoanVariables {
  loanId: UUIDString;
}
```
### Return Type
Recall that executing the `GetFilesByLoan` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetFilesByLoanData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetFilesByLoanData {
  fileLoanAssociations: ({
    id: UUIDString;
    fileId: UUIDString;
    loanId: UUIDString;
    associatedAt: TimestampString;
  } & FileLoanAssociation_Key)[];
}
```
### Using `GetFilesByLoan`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getFilesByLoan, GetFilesByLoanVariables } from '@mybox/dataconnect';

// The `GetFilesByLoan` query requires an argument of type `GetFilesByLoanVariables`:
const getFilesByLoanVars: GetFilesByLoanVariables = {
  loanId: ..., 
};

// Call the `getFilesByLoan()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getFilesByLoan(getFilesByLoanVars);
// Variables can be defined inline as well.
const { data } = await getFilesByLoan({ loanId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getFilesByLoan(dataConnect, getFilesByLoanVars);

console.log(data.fileLoanAssociations);

// Or, you can use the `Promise` API.
getFilesByLoan(getFilesByLoanVars).then((response) => {
  const data = response.data;
  console.log(data.fileLoanAssociations);
});
```

### Using `GetFilesByLoan`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getFilesByLoanRef, GetFilesByLoanVariables } from '@mybox/dataconnect';

// The `GetFilesByLoan` query requires an argument of type `GetFilesByLoanVariables`:
const getFilesByLoanVars: GetFilesByLoanVariables = {
  loanId: ..., 
};

// Call the `getFilesByLoanRef()` function to get a reference to the query.
const ref = getFilesByLoanRef(getFilesByLoanVars);
// Variables can be defined inline as well.
const ref = getFilesByLoanRef({ loanId: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getFilesByLoanRef(dataConnect, getFilesByLoanVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.fileLoanAssociations);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.fileLoanAssociations);
});
```

## GetFile
You can execute the `GetFile` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
getFile(vars: GetFileVariables): QueryPromise<GetFileData, GetFileVariables>;

interface GetFileRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetFileVariables): QueryRef<GetFileData, GetFileVariables>;
}
export const getFileRef: GetFileRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getFile(dc: DataConnect, vars: GetFileVariables): QueryPromise<GetFileData, GetFileVariables>;

interface GetFileRef {
  ...
  (dc: DataConnect, vars: GetFileVariables): QueryRef<GetFileData, GetFileVariables>;
}
export const getFileRef: GetFileRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getFileRef:
```typescript
const name = getFileRef.operationName;
console.log(name);
```

### Variables
The `GetFile` query requires an argument of type `GetFileVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetFileVariables {
  id: UUIDString;
}
```
### Return Type
Recall that executing the `GetFile` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetFileData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetFileData {
  file?: {
    id: UUIDString;
    userId: UUIDString;
    originalFilename: string;
    storagePath: string;
    fileSize: number;
    mimeType?: string | null;
    fileExtension?: string | null;
    uploadedAt: TimestampString;
    updatedAt: TimestampString;
    tags?: string | null;
    description?: string | null;
    downloadUrl?: string | null;
    isDeleted: boolean;
    deletedAt?: TimestampString | null;
    deletedBy?: UUIDString | null;
  } & File_Key;
}
```
### Using `GetFile`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getFile, GetFileVariables } from '@mybox/dataconnect';

// The `GetFile` query requires an argument of type `GetFileVariables`:
const getFileVars: GetFileVariables = {
  id: ..., 
};

// Call the `getFile()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getFile(getFileVars);
// Variables can be defined inline as well.
const { data } = await getFile({ id: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getFile(dataConnect, getFileVars);

console.log(data.file);

// Or, you can use the `Promise` API.
getFile(getFileVars).then((response) => {
  const data = response.data;
  console.log(data.file);
});
```

### Using `GetFile`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getFileRef, GetFileVariables } from '@mybox/dataconnect';

// The `GetFile` query requires an argument of type `GetFileVariables`:
const getFileVars: GetFileVariables = {
  id: ..., 
};

// Call the `getFileRef()` function to get a reference to the query.
const ref = getFileRef(getFileVars);
// Variables can be defined inline as well.
const ref = getFileRef({ id: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getFileRef(dataConnect, getFileVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.file);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.file);
});
```

## GetFilesWithAssociations
You can execute the `GetFilesWithAssociations` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
getFilesWithAssociations(vars: GetFilesWithAssociationsVariables): QueryPromise<GetFilesWithAssociationsData, GetFilesWithAssociationsVariables>;

interface GetFilesWithAssociationsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetFilesWithAssociationsVariables): QueryRef<GetFilesWithAssociationsData, GetFilesWithAssociationsVariables>;
}
export const getFilesWithAssociationsRef: GetFilesWithAssociationsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getFilesWithAssociations(dc: DataConnect, vars: GetFilesWithAssociationsVariables): QueryPromise<GetFilesWithAssociationsData, GetFilesWithAssociationsVariables>;

interface GetFilesWithAssociationsRef {
  ...
  (dc: DataConnect, vars: GetFilesWithAssociationsVariables): QueryRef<GetFilesWithAssociationsData, GetFilesWithAssociationsVariables>;
}
export const getFilesWithAssociationsRef: GetFilesWithAssociationsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getFilesWithAssociationsRef:
```typescript
const name = getFilesWithAssociationsRef.operationName;
console.log(name);
```

### Variables
The `GetFilesWithAssociations` query requires an argument of type `GetFilesWithAssociationsVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetFilesWithAssociationsVariables {
  userId: UUIDString;
}
```
### Return Type
Recall that executing the `GetFilesWithAssociations` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetFilesWithAssociationsData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetFilesWithAssociationsData {
  files: ({
    id: UUIDString;
    originalFilename: string;
    fileSize: number;
    uploadedAt: TimestampString;
  } & File_Key)[];
}
```
### Using `GetFilesWithAssociations`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getFilesWithAssociations, GetFilesWithAssociationsVariables } from '@mybox/dataconnect';

// The `GetFilesWithAssociations` query requires an argument of type `GetFilesWithAssociationsVariables`:
const getFilesWithAssociationsVars: GetFilesWithAssociationsVariables = {
  userId: ..., 
};

// Call the `getFilesWithAssociations()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getFilesWithAssociations(getFilesWithAssociationsVars);
// Variables can be defined inline as well.
const { data } = await getFilesWithAssociations({ userId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getFilesWithAssociations(dataConnect, getFilesWithAssociationsVars);

console.log(data.files);

// Or, you can use the `Promise` API.
getFilesWithAssociations(getFilesWithAssociationsVars).then((response) => {
  const data = response.data;
  console.log(data.files);
});
```

### Using `GetFilesWithAssociations`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getFilesWithAssociationsRef, GetFilesWithAssociationsVariables } from '@mybox/dataconnect';

// The `GetFilesWithAssociations` query requires an argument of type `GetFilesWithAssociationsVariables`:
const getFilesWithAssociationsVars: GetFilesWithAssociationsVariables = {
  userId: ..., 
};

// Call the `getFilesWithAssociationsRef()` function to get a reference to the query.
const ref = getFilesWithAssociationsRef(getFilesWithAssociationsVars);
// Variables can be defined inline as well.
const ref = getFilesWithAssociationsRef({ userId: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getFilesWithAssociationsRef(dataConnect, getFilesWithAssociationsVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.files);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.files);
});
```

## GetFileAssociations
You can execute the `GetFileAssociations` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
getFileAssociations(vars: GetFileAssociationsVariables): QueryPromise<GetFileAssociationsData, GetFileAssociationsVariables>;

interface GetFileAssociationsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetFileAssociationsVariables): QueryRef<GetFileAssociationsData, GetFileAssociationsVariables>;
}
export const getFileAssociationsRef: GetFileAssociationsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getFileAssociations(dc: DataConnect, vars: GetFileAssociationsVariables): QueryPromise<GetFileAssociationsData, GetFileAssociationsVariables>;

interface GetFileAssociationsRef {
  ...
  (dc: DataConnect, vars: GetFileAssociationsVariables): QueryRef<GetFileAssociationsData, GetFileAssociationsVariables>;
}
export const getFileAssociationsRef: GetFileAssociationsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getFileAssociationsRef:
```typescript
const name = getFileAssociationsRef.operationName;
console.log(name);
```

### Variables
The `GetFileAssociations` query requires an argument of type `GetFileAssociationsVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetFileAssociationsVariables {
  fileId: UUIDString;
}
```
### Return Type
Recall that executing the `GetFileAssociations` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetFileAssociationsData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetFileAssociationsData {
  fileLoanAssociations: ({
    id: UUIDString;
    loanId: UUIDString;
    associatedAt: TimestampString;
  } & FileLoanAssociation_Key)[];
}
```
### Using `GetFileAssociations`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getFileAssociations, GetFileAssociationsVariables } from '@mybox/dataconnect';

// The `GetFileAssociations` query requires an argument of type `GetFileAssociationsVariables`:
const getFileAssociationsVars: GetFileAssociationsVariables = {
  fileId: ..., 
};

// Call the `getFileAssociations()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getFileAssociations(getFileAssociationsVars);
// Variables can be defined inline as well.
const { data } = await getFileAssociations({ fileId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getFileAssociations(dataConnect, getFileAssociationsVars);

console.log(data.fileLoanAssociations);

// Or, you can use the `Promise` API.
getFileAssociations(getFileAssociationsVars).then((response) => {
  const data = response.data;
  console.log(data.fileLoanAssociations);
});
```

### Using `GetFileAssociations`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getFileAssociationsRef, GetFileAssociationsVariables } from '@mybox/dataconnect';

// The `GetFileAssociations` query requires an argument of type `GetFileAssociationsVariables`:
const getFileAssociationsVars: GetFileAssociationsVariables = {
  fileId: ..., 
};

// Call the `getFileAssociationsRef()` function to get a reference to the query.
const ref = getFileAssociationsRef(getFileAssociationsVars);
// Variables can be defined inline as well.
const ref = getFileAssociationsRef({ fileId: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getFileAssociationsRef(dataConnect, getFileAssociationsVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.fileLoanAssociations);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.fileLoanAssociations);
});
```

## GetLoanAssociations
You can execute the `GetLoanAssociations` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
getLoanAssociations(vars: GetLoanAssociationsVariables): QueryPromise<GetLoanAssociationsData, GetLoanAssociationsVariables>;

interface GetLoanAssociationsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetLoanAssociationsVariables): QueryRef<GetLoanAssociationsData, GetLoanAssociationsVariables>;
}
export const getLoanAssociationsRef: GetLoanAssociationsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getLoanAssociations(dc: DataConnect, vars: GetLoanAssociationsVariables): QueryPromise<GetLoanAssociationsData, GetLoanAssociationsVariables>;

interface GetLoanAssociationsRef {
  ...
  (dc: DataConnect, vars: GetLoanAssociationsVariables): QueryRef<GetLoanAssociationsData, GetLoanAssociationsVariables>;
}
export const getLoanAssociationsRef: GetLoanAssociationsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getLoanAssociationsRef:
```typescript
const name = getLoanAssociationsRef.operationName;
console.log(name);
```

### Variables
The `GetLoanAssociations` query requires an argument of type `GetLoanAssociationsVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetLoanAssociationsVariables {
  loanId: UUIDString;
}
```
### Return Type
Recall that executing the `GetLoanAssociations` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetLoanAssociationsData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetLoanAssociationsData {
  fileLoanAssociations: ({
    id: UUIDString;
    fileId: UUIDString;
    associatedAt: TimestampString;
  } & FileLoanAssociation_Key)[];
}
```
### Using `GetLoanAssociations`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getLoanAssociations, GetLoanAssociationsVariables } from '@mybox/dataconnect';

// The `GetLoanAssociations` query requires an argument of type `GetLoanAssociationsVariables`:
const getLoanAssociationsVars: GetLoanAssociationsVariables = {
  loanId: ..., 
};

// Call the `getLoanAssociations()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getLoanAssociations(getLoanAssociationsVars);
// Variables can be defined inline as well.
const { data } = await getLoanAssociations({ loanId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getLoanAssociations(dataConnect, getLoanAssociationsVars);

console.log(data.fileLoanAssociations);

// Or, you can use the `Promise` API.
getLoanAssociations(getLoanAssociationsVars).then((response) => {
  const data = response.data;
  console.log(data.fileLoanAssociations);
});
```

### Using `GetLoanAssociations`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getLoanAssociationsRef, GetLoanAssociationsVariables } from '@mybox/dataconnect';

// The `GetLoanAssociations` query requires an argument of type `GetLoanAssociationsVariables`:
const getLoanAssociationsVars: GetLoanAssociationsVariables = {
  loanId: ..., 
};

// Call the `getLoanAssociationsRef()` function to get a reference to the query.
const ref = getLoanAssociationsRef(getLoanAssociationsVars);
// Variables can be defined inline as well.
const ref = getLoanAssociationsRef({ loanId: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getLoanAssociationsRef(dataConnect, getLoanAssociationsVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.fileLoanAssociations);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.fileLoanAssociations);
});
```

## GetAuthSession
You can execute the `GetAuthSession` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
getAuthSession(vars: GetAuthSessionVariables): QueryPromise<GetAuthSessionData, GetAuthSessionVariables>;

interface GetAuthSessionRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetAuthSessionVariables): QueryRef<GetAuthSessionData, GetAuthSessionVariables>;
}
export const getAuthSessionRef: GetAuthSessionRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getAuthSession(dc: DataConnect, vars: GetAuthSessionVariables): QueryPromise<GetAuthSessionData, GetAuthSessionVariables>;

interface GetAuthSessionRef {
  ...
  (dc: DataConnect, vars: GetAuthSessionVariables): QueryRef<GetAuthSessionData, GetAuthSessionVariables>;
}
export const getAuthSessionRef: GetAuthSessionRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getAuthSessionRef:
```typescript
const name = getAuthSessionRef.operationName;
console.log(name);
```

### Variables
The `GetAuthSession` query requires an argument of type `GetAuthSessionVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetAuthSessionVariables {
  sessionId: string;
}
```
### Return Type
Recall that executing the `GetAuthSession` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetAuthSessionData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetAuthSessionData {
  authSessions: ({
    id: UUIDString;
    sessionId: string;
    userId: UUIDString;
    loanIds?: string | null;
    emailHash: string;
    tokenType: string;
    status: string;
    expiresAt: TimestampString;
    createdAt: TimestampString;
    verifiedAt?: TimestampString | null;
    lastAccessedAt?: TimestampString | null;
    ipAddress?: string | null;
    userAgent?: string | null;
  } & AuthSession_Key)[];
}
```
### Using `GetAuthSession`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getAuthSession, GetAuthSessionVariables } from '@mybox/dataconnect';

// The `GetAuthSession` query requires an argument of type `GetAuthSessionVariables`:
const getAuthSessionVars: GetAuthSessionVariables = {
  sessionId: ..., 
};

// Call the `getAuthSession()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getAuthSession(getAuthSessionVars);
// Variables can be defined inline as well.
const { data } = await getAuthSession({ sessionId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getAuthSession(dataConnect, getAuthSessionVars);

console.log(data.authSessions);

// Or, you can use the `Promise` API.
getAuthSession(getAuthSessionVars).then((response) => {
  const data = response.data;
  console.log(data.authSessions);
});
```

### Using `GetAuthSession`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getAuthSessionRef, GetAuthSessionVariables } from '@mybox/dataconnect';

// The `GetAuthSession` query requires an argument of type `GetAuthSessionVariables`:
const getAuthSessionVars: GetAuthSessionVariables = {
  sessionId: ..., 
};

// Call the `getAuthSessionRef()` function to get a reference to the query.
const ref = getAuthSessionRef(getAuthSessionVars);
// Variables can be defined inline as well.
const ref = getAuthSessionRef({ sessionId: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getAuthSessionRef(dataConnect, getAuthSessionVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.authSessions);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.authSessions);
});
```

## GetUserAuthSessions
You can execute the `GetUserAuthSessions` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
getUserAuthSessions(vars: GetUserAuthSessionsVariables): QueryPromise<GetUserAuthSessionsData, GetUserAuthSessionsVariables>;

interface GetUserAuthSessionsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetUserAuthSessionsVariables): QueryRef<GetUserAuthSessionsData, GetUserAuthSessionsVariables>;
}
export const getUserAuthSessionsRef: GetUserAuthSessionsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getUserAuthSessions(dc: DataConnect, vars: GetUserAuthSessionsVariables): QueryPromise<GetUserAuthSessionsData, GetUserAuthSessionsVariables>;

interface GetUserAuthSessionsRef {
  ...
  (dc: DataConnect, vars: GetUserAuthSessionsVariables): QueryRef<GetUserAuthSessionsData, GetUserAuthSessionsVariables>;
}
export const getUserAuthSessionsRef: GetUserAuthSessionsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getUserAuthSessionsRef:
```typescript
const name = getUserAuthSessionsRef.operationName;
console.log(name);
```

### Variables
The `GetUserAuthSessions` query requires an argument of type `GetUserAuthSessionsVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetUserAuthSessionsVariables {
  userId: UUIDString;
}
```
### Return Type
Recall that executing the `GetUserAuthSessions` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetUserAuthSessionsData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetUserAuthSessionsData {
  authSessions: ({
    sessionId: string;
    expiresAt: TimestampString;
    lastAccessedAt?: TimestampString | null;
    createdAt: TimestampString;
    ipAddress?: string | null;
  })[];
}
```
### Using `GetUserAuthSessions`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getUserAuthSessions, GetUserAuthSessionsVariables } from '@mybox/dataconnect';

// The `GetUserAuthSessions` query requires an argument of type `GetUserAuthSessionsVariables`:
const getUserAuthSessionsVars: GetUserAuthSessionsVariables = {
  userId: ..., 
};

// Call the `getUserAuthSessions()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getUserAuthSessions(getUserAuthSessionsVars);
// Variables can be defined inline as well.
const { data } = await getUserAuthSessions({ userId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getUserAuthSessions(dataConnect, getUserAuthSessionsVars);

console.log(data.authSessions);

// Or, you can use the `Promise` API.
getUserAuthSessions(getUserAuthSessionsVars).then((response) => {
  const data = response.data;
  console.log(data.authSessions);
});
```

### Using `GetUserAuthSessions`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getUserAuthSessionsRef, GetUserAuthSessionsVariables } from '@mybox/dataconnect';

// The `GetUserAuthSessions` query requires an argument of type `GetUserAuthSessionsVariables`:
const getUserAuthSessionsVars: GetUserAuthSessionsVariables = {
  userId: ..., 
};

// Call the `getUserAuthSessionsRef()` function to get a reference to the query.
const ref = getUserAuthSessionsRef(getUserAuthSessionsVars);
// Variables can be defined inline as well.
const ref = getUserAuthSessionsRef({ userId: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getUserAuthSessionsRef(dataConnect, getUserAuthSessionsVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.authSessions);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.authSessions);
});
```

## GetVerificationCode
You can execute the `GetVerificationCode` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
getVerificationCode(vars: GetVerificationCodeVariables): QueryPromise<GetVerificationCodeData, GetVerificationCodeVariables>;

interface GetVerificationCodeRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetVerificationCodeVariables): QueryRef<GetVerificationCodeData, GetVerificationCodeVariables>;
}
export const getVerificationCodeRef: GetVerificationCodeRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getVerificationCode(dc: DataConnect, vars: GetVerificationCodeVariables): QueryPromise<GetVerificationCodeData, GetVerificationCodeVariables>;

interface GetVerificationCodeRef {
  ...
  (dc: DataConnect, vars: GetVerificationCodeVariables): QueryRef<GetVerificationCodeData, GetVerificationCodeVariables>;
}
export const getVerificationCodeRef: GetVerificationCodeRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getVerificationCodeRef:
```typescript
const name = getVerificationCodeRef.operationName;
console.log(name);
```

### Variables
The `GetVerificationCode` query requires an argument of type `GetVerificationCodeVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetVerificationCodeVariables {
  sessionId: string;
}
```
### Return Type
Recall that executing the `GetVerificationCode` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetVerificationCodeData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetVerificationCodeData {
  verificationCodes: ({
    id: UUIDString;
    sessionId: string;
    codeHash: string;
    expiresAt: TimestampString;
    attemptCount: number;
    maxAttempts: number;
    isUsed: boolean;
    usedAt?: TimestampString | null;
  } & VerificationCode_Key)[];
}
```
### Using `GetVerificationCode`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getVerificationCode, GetVerificationCodeVariables } from '@mybox/dataconnect';

// The `GetVerificationCode` query requires an argument of type `GetVerificationCodeVariables`:
const getVerificationCodeVars: GetVerificationCodeVariables = {
  sessionId: ..., 
};

// Call the `getVerificationCode()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getVerificationCode(getVerificationCodeVars);
// Variables can be defined inline as well.
const { data } = await getVerificationCode({ sessionId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getVerificationCode(dataConnect, getVerificationCodeVars);

console.log(data.verificationCodes);

// Or, you can use the `Promise` API.
getVerificationCode(getVerificationCodeVars).then((response) => {
  const data = response.data;
  console.log(data.verificationCodes);
});
```

### Using `GetVerificationCode`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getVerificationCodeRef, GetVerificationCodeVariables } from '@mybox/dataconnect';

// The `GetVerificationCode` query requires an argument of type `GetVerificationCodeVariables`:
const getVerificationCodeVars: GetVerificationCodeVariables = {
  sessionId: ..., 
};

// Call the `getVerificationCodeRef()` function to get a reference to the query.
const ref = getVerificationCodeRef(getVerificationCodeVars);
// Variables can be defined inline as well.
const ref = getVerificationCodeRef({ sessionId: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getVerificationCodeRef(dataConnect, getVerificationCodeVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.verificationCodes);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.verificationCodes);
});
```

## GetAuthAuditLogs
You can execute the `GetAuthAuditLogs` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
getAuthAuditLogs(vars?: GetAuthAuditLogsVariables): QueryPromise<GetAuthAuditLogsData, GetAuthAuditLogsVariables>;

interface GetAuthAuditLogsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars?: GetAuthAuditLogsVariables): QueryRef<GetAuthAuditLogsData, GetAuthAuditLogsVariables>;
}
export const getAuthAuditLogsRef: GetAuthAuditLogsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getAuthAuditLogs(dc: DataConnect, vars?: GetAuthAuditLogsVariables): QueryPromise<GetAuthAuditLogsData, GetAuthAuditLogsVariables>;

interface GetAuthAuditLogsRef {
  ...
  (dc: DataConnect, vars?: GetAuthAuditLogsVariables): QueryRef<GetAuthAuditLogsData, GetAuthAuditLogsVariables>;
}
export const getAuthAuditLogsRef: GetAuthAuditLogsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getAuthAuditLogsRef:
```typescript
const name = getAuthAuditLogsRef.operationName;
console.log(name);
```

### Variables
The `GetAuthAuditLogs` query has an optional argument of type `GetAuthAuditLogsVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetAuthAuditLogsVariables {
  userId?: UUIDString | null;
  limit?: number | null;
}
```
### Return Type
Recall that executing the `GetAuthAuditLogs` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetAuthAuditLogsData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetAuthAuditLogsData {
  authAuditLogs: ({
    id: UUIDString;
    sessionId?: string | null;
    eventType: string;
    success: boolean;
    errorMessage?: string | null;
    ipAddress?: string | null;
    createdAt: TimestampString;
  } & AuthAuditLog_Key)[];
}
```
### Using `GetAuthAuditLogs`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getAuthAuditLogs, GetAuthAuditLogsVariables } from '@mybox/dataconnect';

// The `GetAuthAuditLogs` query has an optional argument of type `GetAuthAuditLogsVariables`:
const getAuthAuditLogsVars: GetAuthAuditLogsVariables = {
  userId: ..., // optional
  limit: ..., // optional
};

// Call the `getAuthAuditLogs()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getAuthAuditLogs(getAuthAuditLogsVars);
// Variables can be defined inline as well.
const { data } = await getAuthAuditLogs({ userId: ..., limit: ..., });
// Since all variables are optional for this query, you can omit the `GetAuthAuditLogsVariables` argument.
const { data } = await getAuthAuditLogs();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getAuthAuditLogs(dataConnect, getAuthAuditLogsVars);

console.log(data.authAuditLogs);

// Or, you can use the `Promise` API.
getAuthAuditLogs(getAuthAuditLogsVars).then((response) => {
  const data = response.data;
  console.log(data.authAuditLogs);
});
```

### Using `GetAuthAuditLogs`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getAuthAuditLogsRef, GetAuthAuditLogsVariables } from '@mybox/dataconnect';

// The `GetAuthAuditLogs` query has an optional argument of type `GetAuthAuditLogsVariables`:
const getAuthAuditLogsVars: GetAuthAuditLogsVariables = {
  userId: ..., // optional
  limit: ..., // optional
};

// Call the `getAuthAuditLogsRef()` function to get a reference to the query.
const ref = getAuthAuditLogsRef(getAuthAuditLogsVars);
// Variables can be defined inline as well.
const ref = getAuthAuditLogsRef({ userId: ..., limit: ..., });
// Since all variables are optional for this query, you can omit the `GetAuthAuditLogsVariables` argument.
const ref = getAuthAuditLogsRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getAuthAuditLogsRef(dataConnect, getAuthAuditLogsVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.authAuditLogs);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.authAuditLogs);
});
```

## GetAuthSessionByFirebaseUid
You can execute the `GetAuthSessionByFirebaseUid` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
getAuthSessionByFirebaseUid(vars: GetAuthSessionByFirebaseUidVariables): QueryPromise<GetAuthSessionByFirebaseUidData, GetAuthSessionByFirebaseUidVariables>;

interface GetAuthSessionByFirebaseUidRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetAuthSessionByFirebaseUidVariables): QueryRef<GetAuthSessionByFirebaseUidData, GetAuthSessionByFirebaseUidVariables>;
}
export const getAuthSessionByFirebaseUidRef: GetAuthSessionByFirebaseUidRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getAuthSessionByFirebaseUid(dc: DataConnect, vars: GetAuthSessionByFirebaseUidVariables): QueryPromise<GetAuthSessionByFirebaseUidData, GetAuthSessionByFirebaseUidVariables>;

interface GetAuthSessionByFirebaseUidRef {
  ...
  (dc: DataConnect, vars: GetAuthSessionByFirebaseUidVariables): QueryRef<GetAuthSessionByFirebaseUidData, GetAuthSessionByFirebaseUidVariables>;
}
export const getAuthSessionByFirebaseUidRef: GetAuthSessionByFirebaseUidRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getAuthSessionByFirebaseUidRef:
```typescript
const name = getAuthSessionByFirebaseUidRef.operationName;
console.log(name);
```

### Variables
The `GetAuthSessionByFirebaseUid` query requires an argument of type `GetAuthSessionByFirebaseUidVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetAuthSessionByFirebaseUidVariables {
  firebaseUid: string;
  email: string;
}
```
### Return Type
Recall that executing the `GetAuthSessionByFirebaseUid` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetAuthSessionByFirebaseUidData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetAuthSessionByFirebaseUidData {
  authSessions: ({
    id: UUIDString;
    sessionId: string;
    userId: UUIDString;
    loanIds?: string | null;
    emailHash: string;
    status: string;
    expiresAt: TimestampString;
    verifiedAt?: TimestampString | null;
    createdAt: TimestampString;
    borrowerContactId?: string | null;
    loanNumber?: string | null;
    firebaseUid?: string | null;
    user: {
      id: UUIDString;
      email: string;
      role: string;
      firstName?: string | null;
      lastName?: string | null;
    } & User_Key;
  } & AuthSession_Key)[];
}
```
### Using `GetAuthSessionByFirebaseUid`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getAuthSessionByFirebaseUid, GetAuthSessionByFirebaseUidVariables } from '@mybox/dataconnect';

// The `GetAuthSessionByFirebaseUid` query requires an argument of type `GetAuthSessionByFirebaseUidVariables`:
const getAuthSessionByFirebaseUidVars: GetAuthSessionByFirebaseUidVariables = {
  firebaseUid: ..., 
  email: ..., 
};

// Call the `getAuthSessionByFirebaseUid()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getAuthSessionByFirebaseUid(getAuthSessionByFirebaseUidVars);
// Variables can be defined inline as well.
const { data } = await getAuthSessionByFirebaseUid({ firebaseUid: ..., email: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getAuthSessionByFirebaseUid(dataConnect, getAuthSessionByFirebaseUidVars);

console.log(data.authSessions);

// Or, you can use the `Promise` API.
getAuthSessionByFirebaseUid(getAuthSessionByFirebaseUidVars).then((response) => {
  const data = response.data;
  console.log(data.authSessions);
});
```

### Using `GetAuthSessionByFirebaseUid`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getAuthSessionByFirebaseUidRef, GetAuthSessionByFirebaseUidVariables } from '@mybox/dataconnect';

// The `GetAuthSessionByFirebaseUid` query requires an argument of type `GetAuthSessionByFirebaseUidVariables`:
const getAuthSessionByFirebaseUidVars: GetAuthSessionByFirebaseUidVariables = {
  firebaseUid: ..., 
  email: ..., 
};

// Call the `getAuthSessionByFirebaseUidRef()` function to get a reference to the query.
const ref = getAuthSessionByFirebaseUidRef(getAuthSessionByFirebaseUidVars);
// Variables can be defined inline as well.
const ref = getAuthSessionByFirebaseUidRef({ firebaseUid: ..., email: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getAuthSessionByFirebaseUidRef(dataConnect, getAuthSessionByFirebaseUidVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.authSessions);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.authSessions);
});
```

## GetAuthSessionByEmailHash
You can execute the `GetAuthSessionByEmailHash` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
getAuthSessionByEmailHash(vars: GetAuthSessionByEmailHashVariables): QueryPromise<GetAuthSessionByEmailHashData, GetAuthSessionByEmailHashVariables>;

interface GetAuthSessionByEmailHashRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetAuthSessionByEmailHashVariables): QueryRef<GetAuthSessionByEmailHashData, GetAuthSessionByEmailHashVariables>;
}
export const getAuthSessionByEmailHashRef: GetAuthSessionByEmailHashRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getAuthSessionByEmailHash(dc: DataConnect, vars: GetAuthSessionByEmailHashVariables): QueryPromise<GetAuthSessionByEmailHashData, GetAuthSessionByEmailHashVariables>;

interface GetAuthSessionByEmailHashRef {
  ...
  (dc: DataConnect, vars: GetAuthSessionByEmailHashVariables): QueryRef<GetAuthSessionByEmailHashData, GetAuthSessionByEmailHashVariables>;
}
export const getAuthSessionByEmailHashRef: GetAuthSessionByEmailHashRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getAuthSessionByEmailHashRef:
```typescript
const name = getAuthSessionByEmailHashRef.operationName;
console.log(name);
```

### Variables
The `GetAuthSessionByEmailHash` query requires an argument of type `GetAuthSessionByEmailHashVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetAuthSessionByEmailHashVariables {
  emailHash: string;
}
```
### Return Type
Recall that executing the `GetAuthSessionByEmailHash` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetAuthSessionByEmailHashData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetAuthSessionByEmailHashData {
  authSessions: ({
    id: UUIDString;
    sessionId: string;
    userId: UUIDString;
    loanIds?: string | null;
    emailHash: string;
    status: string;
    expiresAt: TimestampString;
    verifiedAt?: TimestampString | null;
    borrowerContactId?: string | null;
    loanNumber?: string | null;
    firebaseUid?: string | null;
  } & AuthSession_Key)[];
}
```
### Using `GetAuthSessionByEmailHash`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getAuthSessionByEmailHash, GetAuthSessionByEmailHashVariables } from '@mybox/dataconnect';

// The `GetAuthSessionByEmailHash` query requires an argument of type `GetAuthSessionByEmailHashVariables`:
const getAuthSessionByEmailHashVars: GetAuthSessionByEmailHashVariables = {
  emailHash: ..., 
};

// Call the `getAuthSessionByEmailHash()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getAuthSessionByEmailHash(getAuthSessionByEmailHashVars);
// Variables can be defined inline as well.
const { data } = await getAuthSessionByEmailHash({ emailHash: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getAuthSessionByEmailHash(dataConnect, getAuthSessionByEmailHashVars);

console.log(data.authSessions);

// Or, you can use the `Promise` API.
getAuthSessionByEmailHash(getAuthSessionByEmailHashVars).then((response) => {
  const data = response.data;
  console.log(data.authSessions);
});
```

### Using `GetAuthSessionByEmailHash`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getAuthSessionByEmailHashRef, GetAuthSessionByEmailHashVariables } from '@mybox/dataconnect';

// The `GetAuthSessionByEmailHash` query requires an argument of type `GetAuthSessionByEmailHashVariables`:
const getAuthSessionByEmailHashVars: GetAuthSessionByEmailHashVariables = {
  emailHash: ..., 
};

// Call the `getAuthSessionByEmailHashRef()` function to get a reference to the query.
const ref = getAuthSessionByEmailHashRef(getAuthSessionByEmailHashVars);
// Variables can be defined inline as well.
const ref = getAuthSessionByEmailHashRef({ emailHash: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getAuthSessionByEmailHashRef(dataConnect, getAuthSessionByEmailHashVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.authSessions);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.authSessions);
});
```

## GetActiveAuthSessionForUser
You can execute the `GetActiveAuthSessionForUser` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
getActiveAuthSessionForUser(vars: GetActiveAuthSessionForUserVariables): QueryPromise<GetActiveAuthSessionForUserData, GetActiveAuthSessionForUserVariables>;

interface GetActiveAuthSessionForUserRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetActiveAuthSessionForUserVariables): QueryRef<GetActiveAuthSessionForUserData, GetActiveAuthSessionForUserVariables>;
}
export const getActiveAuthSessionForUserRef: GetActiveAuthSessionForUserRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getActiveAuthSessionForUser(dc: DataConnect, vars: GetActiveAuthSessionForUserVariables): QueryPromise<GetActiveAuthSessionForUserData, GetActiveAuthSessionForUserVariables>;

interface GetActiveAuthSessionForUserRef {
  ...
  (dc: DataConnect, vars: GetActiveAuthSessionForUserVariables): QueryRef<GetActiveAuthSessionForUserData, GetActiveAuthSessionForUserVariables>;
}
export const getActiveAuthSessionForUserRef: GetActiveAuthSessionForUserRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getActiveAuthSessionForUserRef:
```typescript
const name = getActiveAuthSessionForUserRef.operationName;
console.log(name);
```

### Variables
The `GetActiveAuthSessionForUser` query requires an argument of type `GetActiveAuthSessionForUserVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetActiveAuthSessionForUserVariables {
  userId: UUIDString;
}
```
### Return Type
Recall that executing the `GetActiveAuthSessionForUser` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetActiveAuthSessionForUserData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetActiveAuthSessionForUserData {
  authSessions: ({
    id: UUIDString;
    sessionId: string;
    userId: UUIDString;
    loanIds?: string | null;
    status: string;
    expiresAt: TimestampString;
    lastAccessedAt?: TimestampString | null;
    borrowerContactId?: string | null;
    loanNumber?: string | null;
  } & AuthSession_Key)[];
}
```
### Using `GetActiveAuthSessionForUser`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getActiveAuthSessionForUser, GetActiveAuthSessionForUserVariables } from '@mybox/dataconnect';

// The `GetActiveAuthSessionForUser` query requires an argument of type `GetActiveAuthSessionForUserVariables`:
const getActiveAuthSessionForUserVars: GetActiveAuthSessionForUserVariables = {
  userId: ..., 
};

// Call the `getActiveAuthSessionForUser()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getActiveAuthSessionForUser(getActiveAuthSessionForUserVars);
// Variables can be defined inline as well.
const { data } = await getActiveAuthSessionForUser({ userId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getActiveAuthSessionForUser(dataConnect, getActiveAuthSessionForUserVars);

console.log(data.authSessions);

// Or, you can use the `Promise` API.
getActiveAuthSessionForUser(getActiveAuthSessionForUserVars).then((response) => {
  const data = response.data;
  console.log(data.authSessions);
});
```

### Using `GetActiveAuthSessionForUser`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getActiveAuthSessionForUserRef, GetActiveAuthSessionForUserVariables } from '@mybox/dataconnect';

// The `GetActiveAuthSessionForUser` query requires an argument of type `GetActiveAuthSessionForUserVariables`:
const getActiveAuthSessionForUserVars: GetActiveAuthSessionForUserVariables = {
  userId: ..., 
};

// Call the `getActiveAuthSessionForUserRef()` function to get a reference to the query.
const ref = getActiveAuthSessionForUserRef(getActiveAuthSessionForUserVars);
// Variables can be defined inline as well.
const ref = getActiveAuthSessionForUserRef({ userId: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getActiveAuthSessionForUserRef(dataConnect, getActiveAuthSessionForUserVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.authSessions);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.authSessions);
});
```

## GetDashboard
You can execute the `GetDashboard` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
getDashboard(vars: GetDashboardVariables): QueryPromise<GetDashboardData, GetDashboardVariables>;

interface GetDashboardRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetDashboardVariables): QueryRef<GetDashboardData, GetDashboardVariables>;
}
export const getDashboardRef: GetDashboardRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getDashboard(dc: DataConnect, vars: GetDashboardVariables): QueryPromise<GetDashboardData, GetDashboardVariables>;

interface GetDashboardRef {
  ...
  (dc: DataConnect, vars: GetDashboardVariables): QueryRef<GetDashboardData, GetDashboardVariables>;
}
export const getDashboardRef: GetDashboardRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getDashboardRef:
```typescript
const name = getDashboardRef.operationName;
console.log(name);
```

### Variables
The `GetDashboard` query requires an argument of type `GetDashboardVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetDashboardVariables {
  userId: UUIDString;
}
```
### Return Type
Recall that executing the `GetDashboard` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetDashboardData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetDashboardData {
  user?: {
    id: UUIDString;
    email: string;
    firstName?: string | null;
    lastName?: string | null;
    role: string;
  } & User_Key;
    loans: ({
      id: UUIDString;
      loanNumber: string;
      borrowerName: string;
      loanAmount?: number | null;
      status: string;
      createdAt: TimestampString;
    } & Loan_Key)[];
      files: ({
        id: UUIDString;
        originalFilename: string;
        fileSize: number;
        uploadedAt: TimestampString;
      } & File_Key)[];
}
```
### Using `GetDashboard`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getDashboard, GetDashboardVariables } from '@mybox/dataconnect';

// The `GetDashboard` query requires an argument of type `GetDashboardVariables`:
const getDashboardVars: GetDashboardVariables = {
  userId: ..., 
};

// Call the `getDashboard()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getDashboard(getDashboardVars);
// Variables can be defined inline as well.
const { data } = await getDashboard({ userId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getDashboard(dataConnect, getDashboardVars);

console.log(data.user);
console.log(data.loans);
console.log(data.files);

// Or, you can use the `Promise` API.
getDashboard(getDashboardVars).then((response) => {
  const data = response.data;
  console.log(data.user);
  console.log(data.loans);
  console.log(data.files);
});
```

### Using `GetDashboard`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getDashboardRef, GetDashboardVariables } from '@mybox/dataconnect';

// The `GetDashboard` query requires an argument of type `GetDashboardVariables`:
const getDashboardVars: GetDashboardVariables = {
  userId: ..., 
};

// Call the `getDashboardRef()` function to get a reference to the query.
const ref = getDashboardRef(getDashboardVars);
// Variables can be defined inline as well.
const ref = getDashboardRef({ userId: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getDashboardRef(dataConnect, getDashboardVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.user);
console.log(data.loans);
console.log(data.files);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.user);
  console.log(data.loans);
  console.log(data.files);
});
```

## GetLoanDetails
You can execute the `GetLoanDetails` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
getLoanDetails(vars: GetLoanDetailsVariables): QueryPromise<GetLoanDetailsData, GetLoanDetailsVariables>;

interface GetLoanDetailsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetLoanDetailsVariables): QueryRef<GetLoanDetailsData, GetLoanDetailsVariables>;
}
export const getLoanDetailsRef: GetLoanDetailsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getLoanDetails(dc: DataConnect, vars: GetLoanDetailsVariables): QueryPromise<GetLoanDetailsData, GetLoanDetailsVariables>;

interface GetLoanDetailsRef {
  ...
  (dc: DataConnect, vars: GetLoanDetailsVariables): QueryRef<GetLoanDetailsData, GetLoanDetailsVariables>;
}
export const getLoanDetailsRef: GetLoanDetailsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getLoanDetailsRef:
```typescript
const name = getLoanDetailsRef.operationName;
console.log(name);
```

### Variables
The `GetLoanDetails` query requires an argument of type `GetLoanDetailsVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetLoanDetailsVariables {
  loanId: UUIDString;
}
```
### Return Type
Recall that executing the `GetLoanDetails` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetLoanDetailsData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetLoanDetailsData {
  loan?: {
    id: UUIDString;
    loanNumber: string;
    borrowerName: string;
    borrowerEmail?: string | null;
    loanAmount?: number | null;
    loanType?: string | null;
    status: string;
    propertyAddress?: string | null;
    notes?: string | null;
    createdAt: TimestampString;
  } & Loan_Key;
    fileLoanAssociations: ({
      id: UUIDString;
      fileId: UUIDString;
      associatedAt: TimestampString;
    } & FileLoanAssociation_Key)[];
}
```
### Using `GetLoanDetails`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getLoanDetails, GetLoanDetailsVariables } from '@mybox/dataconnect';

// The `GetLoanDetails` query requires an argument of type `GetLoanDetailsVariables`:
const getLoanDetailsVars: GetLoanDetailsVariables = {
  loanId: ..., 
};

// Call the `getLoanDetails()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getLoanDetails(getLoanDetailsVars);
// Variables can be defined inline as well.
const { data } = await getLoanDetails({ loanId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getLoanDetails(dataConnect, getLoanDetailsVars);

console.log(data.loan);
console.log(data.fileLoanAssociations);

// Or, you can use the `Promise` API.
getLoanDetails(getLoanDetailsVars).then((response) => {
  const data = response.data;
  console.log(data.loan);
  console.log(data.fileLoanAssociations);
});
```

### Using `GetLoanDetails`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getLoanDetailsRef, GetLoanDetailsVariables } from '@mybox/dataconnect';

// The `GetLoanDetails` query requires an argument of type `GetLoanDetailsVariables`:
const getLoanDetailsVars: GetLoanDetailsVariables = {
  loanId: ..., 
};

// Call the `getLoanDetailsRef()` function to get a reference to the query.
const ref = getLoanDetailsRef(getLoanDetailsVars);
// Variables can be defined inline as well.
const ref = getLoanDetailsRef({ loanId: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getLoanDetailsRef(dataConnect, getLoanDetailsVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.loan);
console.log(data.fileLoanAssociations);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.loan);
  console.log(data.fileLoanAssociations);
});
```

# Mutations

There are two ways to execute a Data Connect Mutation using the generated Web SDK:
- Using a Mutation Reference function, which returns a `MutationRef`
  - The `MutationRef` can be used as an argument to `executeMutation()`, which will execute the Mutation and return a `MutationPromise`
- Using an action shortcut function, which returns a `MutationPromise`
  - Calling the action shortcut function will execute the Mutation and return a `MutationPromise`

The following is true for both the action shortcut function and the `MutationRef` function:
- The `MutationPromise` returned will resolve to the result of the Mutation once it has finished executing
- If the Mutation accepts arguments, both the action shortcut function and the `MutationRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Mutation
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `mybox-connector` connector's generated functions to execute each mutation. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-mutations).

## CreateUser
You can execute the `CreateUser` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
createUser(vars: CreateUserVariables): MutationPromise<CreateUserData, CreateUserVariables>;

interface CreateUserRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateUserVariables): MutationRef<CreateUserData, CreateUserVariables>;
}
export const createUserRef: CreateUserRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createUser(dc: DataConnect, vars: CreateUserVariables): MutationPromise<CreateUserData, CreateUserVariables>;

interface CreateUserRef {
  ...
  (dc: DataConnect, vars: CreateUserVariables): MutationRef<CreateUserData, CreateUserVariables>;
}
export const createUserRef: CreateUserRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createUserRef:
```typescript
const name = createUserRef.operationName;
console.log(name);
```

### Variables
The `CreateUser` mutation requires an argument of type `CreateUserVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreateUserVariables {
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  role?: string | null;
  phoneNumber?: string | null;
}
```
### Return Type
Recall that executing the `CreateUser` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateUserData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateUserData {
  user_insert: User_Key;
}
```
### Using `CreateUser`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createUser, CreateUserVariables } from '@mybox/dataconnect';

// The `CreateUser` mutation requires an argument of type `CreateUserVariables`:
const createUserVars: CreateUserVariables = {
  email: ..., 
  firstName: ..., // optional
  lastName: ..., // optional
  role: ..., // optional
  phoneNumber: ..., // optional
};

// Call the `createUser()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createUser(createUserVars);
// Variables can be defined inline as well.
const { data } = await createUser({ email: ..., firstName: ..., lastName: ..., role: ..., phoneNumber: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createUser(dataConnect, createUserVars);

console.log(data.user_insert);

// Or, you can use the `Promise` API.
createUser(createUserVars).then((response) => {
  const data = response.data;
  console.log(data.user_insert);
});
```

### Using `CreateUser`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createUserRef, CreateUserVariables } from '@mybox/dataconnect';

// The `CreateUser` mutation requires an argument of type `CreateUserVariables`:
const createUserVars: CreateUserVariables = {
  email: ..., 
  firstName: ..., // optional
  lastName: ..., // optional
  role: ..., // optional
  phoneNumber: ..., // optional
};

// Call the `createUserRef()` function to get a reference to the mutation.
const ref = createUserRef(createUserVars);
// Variables can be defined inline as well.
const ref = createUserRef({ email: ..., firstName: ..., lastName: ..., role: ..., phoneNumber: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createUserRef(dataConnect, createUserVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.user_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.user_insert);
});
```

## UpdateUser
You can execute the `UpdateUser` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
updateUser(vars: UpdateUserVariables): MutationPromise<UpdateUserData, UpdateUserVariables>;

interface UpdateUserRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateUserVariables): MutationRef<UpdateUserData, UpdateUserVariables>;
}
export const updateUserRef: UpdateUserRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
updateUser(dc: DataConnect, vars: UpdateUserVariables): MutationPromise<UpdateUserData, UpdateUserVariables>;

interface UpdateUserRef {
  ...
  (dc: DataConnect, vars: UpdateUserVariables): MutationRef<UpdateUserData, UpdateUserVariables>;
}
export const updateUserRef: UpdateUserRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the updateUserRef:
```typescript
const name = updateUserRef.operationName;
console.log(name);
```

### Variables
The `UpdateUser` mutation requires an argument of type `UpdateUserVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UpdateUserVariables {
  id: UUIDString;
  firstName?: string | null;
  lastName?: string | null;
  phoneNumber?: string | null;
  lastLoginAt?: TimestampString | null;
}
```
### Return Type
Recall that executing the `UpdateUser` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpdateUserData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpdateUserData {
  user_update?: User_Key | null;
}
```
### Using `UpdateUser`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, updateUser, UpdateUserVariables } from '@mybox/dataconnect';

// The `UpdateUser` mutation requires an argument of type `UpdateUserVariables`:
const updateUserVars: UpdateUserVariables = {
  id: ..., 
  firstName: ..., // optional
  lastName: ..., // optional
  phoneNumber: ..., // optional
  lastLoginAt: ..., // optional
};

// Call the `updateUser()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await updateUser(updateUserVars);
// Variables can be defined inline as well.
const { data } = await updateUser({ id: ..., firstName: ..., lastName: ..., phoneNumber: ..., lastLoginAt: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await updateUser(dataConnect, updateUserVars);

console.log(data.user_update);

// Or, you can use the `Promise` API.
updateUser(updateUserVars).then((response) => {
  const data = response.data;
  console.log(data.user_update);
});
```

### Using `UpdateUser`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, updateUserRef, UpdateUserVariables } from '@mybox/dataconnect';

// The `UpdateUser` mutation requires an argument of type `UpdateUserVariables`:
const updateUserVars: UpdateUserVariables = {
  id: ..., 
  firstName: ..., // optional
  lastName: ..., // optional
  phoneNumber: ..., // optional
  lastLoginAt: ..., // optional
};

// Call the `updateUserRef()` function to get a reference to the mutation.
const ref = updateUserRef(updateUserVars);
// Variables can be defined inline as well.
const ref = updateUserRef({ id: ..., firstName: ..., lastName: ..., phoneNumber: ..., lastLoginAt: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = updateUserRef(dataConnect, updateUserVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.user_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.user_update);
});
```

## DeactivateUser
You can execute the `DeactivateUser` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
deactivateUser(vars: DeactivateUserVariables): MutationPromise<DeactivateUserData, DeactivateUserVariables>;

interface DeactivateUserRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeactivateUserVariables): MutationRef<DeactivateUserData, DeactivateUserVariables>;
}
export const deactivateUserRef: DeactivateUserRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
deactivateUser(dc: DataConnect, vars: DeactivateUserVariables): MutationPromise<DeactivateUserData, DeactivateUserVariables>;

interface DeactivateUserRef {
  ...
  (dc: DataConnect, vars: DeactivateUserVariables): MutationRef<DeactivateUserData, DeactivateUserVariables>;
}
export const deactivateUserRef: DeactivateUserRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the deactivateUserRef:
```typescript
const name = deactivateUserRef.operationName;
console.log(name);
```

### Variables
The `DeactivateUser` mutation requires an argument of type `DeactivateUserVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface DeactivateUserVariables {
  id: UUIDString;
}
```
### Return Type
Recall that executing the `DeactivateUser` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `DeactivateUserData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface DeactivateUserData {
  user_update?: User_Key | null;
}
```
### Using `DeactivateUser`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, deactivateUser, DeactivateUserVariables } from '@mybox/dataconnect';

// The `DeactivateUser` mutation requires an argument of type `DeactivateUserVariables`:
const deactivateUserVars: DeactivateUserVariables = {
  id: ..., 
};

// Call the `deactivateUser()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await deactivateUser(deactivateUserVars);
// Variables can be defined inline as well.
const { data } = await deactivateUser({ id: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await deactivateUser(dataConnect, deactivateUserVars);

console.log(data.user_update);

// Or, you can use the `Promise` API.
deactivateUser(deactivateUserVars).then((response) => {
  const data = response.data;
  console.log(data.user_update);
});
```

### Using `DeactivateUser`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, deactivateUserRef, DeactivateUserVariables } from '@mybox/dataconnect';

// The `DeactivateUser` mutation requires an argument of type `DeactivateUserVariables`:
const deactivateUserVars: DeactivateUserVariables = {
  id: ..., 
};

// Call the `deactivateUserRef()` function to get a reference to the mutation.
const ref = deactivateUserRef(deactivateUserVars);
// Variables can be defined inline as well.
const ref = deactivateUserRef({ id: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = deactivateUserRef(dataConnect, deactivateUserVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.user_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.user_update);
});
```

## CreateLoan
You can execute the `CreateLoan` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
createLoan(vars: CreateLoanVariables): MutationPromise<CreateLoanData, CreateLoanVariables>;

interface CreateLoanRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateLoanVariables): MutationRef<CreateLoanData, CreateLoanVariables>;
}
export const createLoanRef: CreateLoanRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createLoan(dc: DataConnect, vars: CreateLoanVariables): MutationPromise<CreateLoanData, CreateLoanVariables>;

interface CreateLoanRef {
  ...
  (dc: DataConnect, vars: CreateLoanVariables): MutationRef<CreateLoanData, CreateLoanVariables>;
}
export const createLoanRef: CreateLoanRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createLoanRef:
```typescript
const name = createLoanRef.operationName;
console.log(name);
```

### Variables
The `CreateLoan` mutation requires an argument of type `CreateLoanVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreateLoanVariables {
  userId: UUIDString;
  loanNumber: string;
  borrowerName: string;
  borrowerEmail?: string | null;
  loanAmount?: number | null;
  loanType?: string | null;
  propertyAddress?: string | null;
  loanOfficerId?: UUIDString | null;
}
```
### Return Type
Recall that executing the `CreateLoan` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateLoanData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateLoanData {
  loan_insert: Loan_Key;
}
```
### Using `CreateLoan`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createLoan, CreateLoanVariables } from '@mybox/dataconnect';

// The `CreateLoan` mutation requires an argument of type `CreateLoanVariables`:
const createLoanVars: CreateLoanVariables = {
  userId: ..., 
  loanNumber: ..., 
  borrowerName: ..., 
  borrowerEmail: ..., // optional
  loanAmount: ..., // optional
  loanType: ..., // optional
  propertyAddress: ..., // optional
  loanOfficerId: ..., // optional
};

// Call the `createLoan()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createLoan(createLoanVars);
// Variables can be defined inline as well.
const { data } = await createLoan({ userId: ..., loanNumber: ..., borrowerName: ..., borrowerEmail: ..., loanAmount: ..., loanType: ..., propertyAddress: ..., loanOfficerId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createLoan(dataConnect, createLoanVars);

console.log(data.loan_insert);

// Or, you can use the `Promise` API.
createLoan(createLoanVars).then((response) => {
  const data = response.data;
  console.log(data.loan_insert);
});
```

### Using `CreateLoan`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createLoanRef, CreateLoanVariables } from '@mybox/dataconnect';

// The `CreateLoan` mutation requires an argument of type `CreateLoanVariables`:
const createLoanVars: CreateLoanVariables = {
  userId: ..., 
  loanNumber: ..., 
  borrowerName: ..., 
  borrowerEmail: ..., // optional
  loanAmount: ..., // optional
  loanType: ..., // optional
  propertyAddress: ..., // optional
  loanOfficerId: ..., // optional
};

// Call the `createLoanRef()` function to get a reference to the mutation.
const ref = createLoanRef(createLoanVars);
// Variables can be defined inline as well.
const ref = createLoanRef({ userId: ..., loanNumber: ..., borrowerName: ..., borrowerEmail: ..., loanAmount: ..., loanType: ..., propertyAddress: ..., loanOfficerId: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createLoanRef(dataConnect, createLoanVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.loan_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.loan_insert);
});
```

## UpdateLoan
You can execute the `UpdateLoan` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
updateLoan(vars: UpdateLoanVariables): MutationPromise<UpdateLoanData, UpdateLoanVariables>;

interface UpdateLoanRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateLoanVariables): MutationRef<UpdateLoanData, UpdateLoanVariables>;
}
export const updateLoanRef: UpdateLoanRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
updateLoan(dc: DataConnect, vars: UpdateLoanVariables): MutationPromise<UpdateLoanData, UpdateLoanVariables>;

interface UpdateLoanRef {
  ...
  (dc: DataConnect, vars: UpdateLoanVariables): MutationRef<UpdateLoanData, UpdateLoanVariables>;
}
export const updateLoanRef: UpdateLoanRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the updateLoanRef:
```typescript
const name = updateLoanRef.operationName;
console.log(name);
```

### Variables
The `UpdateLoan` mutation requires an argument of type `UpdateLoanVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UpdateLoanVariables {
  id: UUIDString;
  status?: string | null;
  notes?: string | null;
  loanAmount?: number | null;
}
```
### Return Type
Recall that executing the `UpdateLoan` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpdateLoanData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpdateLoanData {
  loan_update?: Loan_Key | null;
}
```
### Using `UpdateLoan`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, updateLoan, UpdateLoanVariables } from '@mybox/dataconnect';

// The `UpdateLoan` mutation requires an argument of type `UpdateLoanVariables`:
const updateLoanVars: UpdateLoanVariables = {
  id: ..., 
  status: ..., // optional
  notes: ..., // optional
  loanAmount: ..., // optional
};

// Call the `updateLoan()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await updateLoan(updateLoanVars);
// Variables can be defined inline as well.
const { data } = await updateLoan({ id: ..., status: ..., notes: ..., loanAmount: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await updateLoan(dataConnect, updateLoanVars);

console.log(data.loan_update);

// Or, you can use the `Promise` API.
updateLoan(updateLoanVars).then((response) => {
  const data = response.data;
  console.log(data.loan_update);
});
```

### Using `UpdateLoan`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, updateLoanRef, UpdateLoanVariables } from '@mybox/dataconnect';

// The `UpdateLoan` mutation requires an argument of type `UpdateLoanVariables`:
const updateLoanVars: UpdateLoanVariables = {
  id: ..., 
  status: ..., // optional
  notes: ..., // optional
  loanAmount: ..., // optional
};

// Call the `updateLoanRef()` function to get a reference to the mutation.
const ref = updateLoanRef(updateLoanVars);
// Variables can be defined inline as well.
const ref = updateLoanRef({ id: ..., status: ..., notes: ..., loanAmount: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = updateLoanRef(dataConnect, updateLoanVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.loan_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.loan_update);
});
```

## CloseLoan
You can execute the `CloseLoan` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
closeLoan(vars: CloseLoanVariables): MutationPromise<CloseLoanData, CloseLoanVariables>;

interface CloseLoanRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CloseLoanVariables): MutationRef<CloseLoanData, CloseLoanVariables>;
}
export const closeLoanRef: CloseLoanRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
closeLoan(dc: DataConnect, vars: CloseLoanVariables): MutationPromise<CloseLoanData, CloseLoanVariables>;

interface CloseLoanRef {
  ...
  (dc: DataConnect, vars: CloseLoanVariables): MutationRef<CloseLoanData, CloseLoanVariables>;
}
export const closeLoanRef: CloseLoanRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the closeLoanRef:
```typescript
const name = closeLoanRef.operationName;
console.log(name);
```

### Variables
The `CloseLoan` mutation requires an argument of type `CloseLoanVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CloseLoanVariables {
  id: UUIDString;
  closedAt: TimestampString;
}
```
### Return Type
Recall that executing the `CloseLoan` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CloseLoanData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CloseLoanData {
  loan_update?: Loan_Key | null;
}
```
### Using `CloseLoan`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, closeLoan, CloseLoanVariables } from '@mybox/dataconnect';

// The `CloseLoan` mutation requires an argument of type `CloseLoanVariables`:
const closeLoanVars: CloseLoanVariables = {
  id: ..., 
  closedAt: ..., 
};

// Call the `closeLoan()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await closeLoan(closeLoanVars);
// Variables can be defined inline as well.
const { data } = await closeLoan({ id: ..., closedAt: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await closeLoan(dataConnect, closeLoanVars);

console.log(data.loan_update);

// Or, you can use the `Promise` API.
closeLoan(closeLoanVars).then((response) => {
  const data = response.data;
  console.log(data.loan_update);
});
```

### Using `CloseLoan`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, closeLoanRef, CloseLoanVariables } from '@mybox/dataconnect';

// The `CloseLoan` mutation requires an argument of type `CloseLoanVariables`:
const closeLoanVars: CloseLoanVariables = {
  id: ..., 
  closedAt: ..., 
};

// Call the `closeLoanRef()` function to get a reference to the mutation.
const ref = closeLoanRef(closeLoanVars);
// Variables can be defined inline as well.
const ref = closeLoanRef({ id: ..., closedAt: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = closeLoanRef(dataConnect, closeLoanVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.loan_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.loan_update);
});
```

## DeleteLoan
You can execute the `DeleteLoan` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
deleteLoan(vars: DeleteLoanVariables): MutationPromise<DeleteLoanData, DeleteLoanVariables>;

interface DeleteLoanRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteLoanVariables): MutationRef<DeleteLoanData, DeleteLoanVariables>;
}
export const deleteLoanRef: DeleteLoanRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
deleteLoan(dc: DataConnect, vars: DeleteLoanVariables): MutationPromise<DeleteLoanData, DeleteLoanVariables>;

interface DeleteLoanRef {
  ...
  (dc: DataConnect, vars: DeleteLoanVariables): MutationRef<DeleteLoanData, DeleteLoanVariables>;
}
export const deleteLoanRef: DeleteLoanRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the deleteLoanRef:
```typescript
const name = deleteLoanRef.operationName;
console.log(name);
```

### Variables
The `DeleteLoan` mutation requires an argument of type `DeleteLoanVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface DeleteLoanVariables {
  id: UUIDString;
}
```
### Return Type
Recall that executing the `DeleteLoan` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `DeleteLoanData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface DeleteLoanData {
  loan_delete?: Loan_Key | null;
}
```
### Using `DeleteLoan`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, deleteLoan, DeleteLoanVariables } from '@mybox/dataconnect';

// The `DeleteLoan` mutation requires an argument of type `DeleteLoanVariables`:
const deleteLoanVars: DeleteLoanVariables = {
  id: ..., 
};

// Call the `deleteLoan()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await deleteLoan(deleteLoanVars);
// Variables can be defined inline as well.
const { data } = await deleteLoan({ id: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await deleteLoan(dataConnect, deleteLoanVars);

console.log(data.loan_delete);

// Or, you can use the `Promise` API.
deleteLoan(deleteLoanVars).then((response) => {
  const data = response.data;
  console.log(data.loan_delete);
});
```

### Using `DeleteLoan`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, deleteLoanRef, DeleteLoanVariables } from '@mybox/dataconnect';

// The `DeleteLoan` mutation requires an argument of type `DeleteLoanVariables`:
const deleteLoanVars: DeleteLoanVariables = {
  id: ..., 
};

// Call the `deleteLoanRef()` function to get a reference to the mutation.
const ref = deleteLoanRef(deleteLoanVars);
// Variables can be defined inline as well.
const ref = deleteLoanRef({ id: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = deleteLoanRef(dataConnect, deleteLoanVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.loan_delete);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.loan_delete);
});
```

## CreateFile
You can execute the `CreateFile` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
createFile(vars: CreateFileVariables): MutationPromise<CreateFileData, CreateFileVariables>;

interface CreateFileRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateFileVariables): MutationRef<CreateFileData, CreateFileVariables>;
}
export const createFileRef: CreateFileRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createFile(dc: DataConnect, vars: CreateFileVariables): MutationPromise<CreateFileData, CreateFileVariables>;

interface CreateFileRef {
  ...
  (dc: DataConnect, vars: CreateFileVariables): MutationRef<CreateFileData, CreateFileVariables>;
}
export const createFileRef: CreateFileRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createFileRef:
```typescript
const name = createFileRef.operationName;
console.log(name);
```

### Variables
The `CreateFile` mutation requires an argument of type `CreateFileVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreateFileVariables {
  userId: UUIDString;
  originalFilename: string;
  storagePath: string;
  fileSize: number;
  mimeType?: string | null;
  fileExtension?: string | null;
  tags?: string | null;
  description?: string | null;
}
```
### Return Type
Recall that executing the `CreateFile` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateFileData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateFileData {
  file_insert: File_Key;
}
```
### Using `CreateFile`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createFile, CreateFileVariables } from '@mybox/dataconnect';

// The `CreateFile` mutation requires an argument of type `CreateFileVariables`:
const createFileVars: CreateFileVariables = {
  userId: ..., 
  originalFilename: ..., 
  storagePath: ..., 
  fileSize: ..., 
  mimeType: ..., // optional
  fileExtension: ..., // optional
  tags: ..., // optional
  description: ..., // optional
};

// Call the `createFile()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createFile(createFileVars);
// Variables can be defined inline as well.
const { data } = await createFile({ userId: ..., originalFilename: ..., storagePath: ..., fileSize: ..., mimeType: ..., fileExtension: ..., tags: ..., description: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createFile(dataConnect, createFileVars);

console.log(data.file_insert);

// Or, you can use the `Promise` API.
createFile(createFileVars).then((response) => {
  const data = response.data;
  console.log(data.file_insert);
});
```

### Using `CreateFile`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createFileRef, CreateFileVariables } from '@mybox/dataconnect';

// The `CreateFile` mutation requires an argument of type `CreateFileVariables`:
const createFileVars: CreateFileVariables = {
  userId: ..., 
  originalFilename: ..., 
  storagePath: ..., 
  fileSize: ..., 
  mimeType: ..., // optional
  fileExtension: ..., // optional
  tags: ..., // optional
  description: ..., // optional
};

// Call the `createFileRef()` function to get a reference to the mutation.
const ref = createFileRef(createFileVars);
// Variables can be defined inline as well.
const ref = createFileRef({ userId: ..., originalFilename: ..., storagePath: ..., fileSize: ..., mimeType: ..., fileExtension: ..., tags: ..., description: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createFileRef(dataConnect, createFileVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.file_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.file_insert);
});
```

## UpdateFile
You can execute the `UpdateFile` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
updateFile(vars: UpdateFileVariables): MutationPromise<UpdateFileData, UpdateFileVariables>;

interface UpdateFileRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateFileVariables): MutationRef<UpdateFileData, UpdateFileVariables>;
}
export const updateFileRef: UpdateFileRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
updateFile(dc: DataConnect, vars: UpdateFileVariables): MutationPromise<UpdateFileData, UpdateFileVariables>;

interface UpdateFileRef {
  ...
  (dc: DataConnect, vars: UpdateFileVariables): MutationRef<UpdateFileData, UpdateFileVariables>;
}
export const updateFileRef: UpdateFileRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the updateFileRef:
```typescript
const name = updateFileRef.operationName;
console.log(name);
```

### Variables
The `UpdateFile` mutation requires an argument of type `UpdateFileVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UpdateFileVariables {
  id: UUIDString;
  tags?: string | null;
  description?: string | null;
  downloadUrl?: string | null;
}
```
### Return Type
Recall that executing the `UpdateFile` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpdateFileData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpdateFileData {
  file_update?: File_Key | null;
}
```
### Using `UpdateFile`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, updateFile, UpdateFileVariables } from '@mybox/dataconnect';

// The `UpdateFile` mutation requires an argument of type `UpdateFileVariables`:
const updateFileVars: UpdateFileVariables = {
  id: ..., 
  tags: ..., // optional
  description: ..., // optional
  downloadUrl: ..., // optional
};

// Call the `updateFile()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await updateFile(updateFileVars);
// Variables can be defined inline as well.
const { data } = await updateFile({ id: ..., tags: ..., description: ..., downloadUrl: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await updateFile(dataConnect, updateFileVars);

console.log(data.file_update);

// Or, you can use the `Promise` API.
updateFile(updateFileVars).then((response) => {
  const data = response.data;
  console.log(data.file_update);
});
```

### Using `UpdateFile`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, updateFileRef, UpdateFileVariables } from '@mybox/dataconnect';

// The `UpdateFile` mutation requires an argument of type `UpdateFileVariables`:
const updateFileVars: UpdateFileVariables = {
  id: ..., 
  tags: ..., // optional
  description: ..., // optional
  downloadUrl: ..., // optional
};

// Call the `updateFileRef()` function to get a reference to the mutation.
const ref = updateFileRef(updateFileVars);
// Variables can be defined inline as well.
const ref = updateFileRef({ id: ..., tags: ..., description: ..., downloadUrl: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = updateFileRef(dataConnect, updateFileVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.file_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.file_update);
});
```

## SoftDeleteFile
You can execute the `SoftDeleteFile` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
softDeleteFile(vars: SoftDeleteFileVariables): MutationPromise<SoftDeleteFileData, SoftDeleteFileVariables>;

interface SoftDeleteFileRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: SoftDeleteFileVariables): MutationRef<SoftDeleteFileData, SoftDeleteFileVariables>;
}
export const softDeleteFileRef: SoftDeleteFileRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
softDeleteFile(dc: DataConnect, vars: SoftDeleteFileVariables): MutationPromise<SoftDeleteFileData, SoftDeleteFileVariables>;

interface SoftDeleteFileRef {
  ...
  (dc: DataConnect, vars: SoftDeleteFileVariables): MutationRef<SoftDeleteFileData, SoftDeleteFileVariables>;
}
export const softDeleteFileRef: SoftDeleteFileRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the softDeleteFileRef:
```typescript
const name = softDeleteFileRef.operationName;
console.log(name);
```

### Variables
The `SoftDeleteFile` mutation requires an argument of type `SoftDeleteFileVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface SoftDeleteFileVariables {
  id: UUIDString;
  deletedBy?: UUIDString | null;
  deletedAt: TimestampString;
}
```
### Return Type
Recall that executing the `SoftDeleteFile` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `SoftDeleteFileData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface SoftDeleteFileData {
  file_update?: File_Key | null;
}
```
### Using `SoftDeleteFile`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, softDeleteFile, SoftDeleteFileVariables } from '@mybox/dataconnect';

// The `SoftDeleteFile` mutation requires an argument of type `SoftDeleteFileVariables`:
const softDeleteFileVars: SoftDeleteFileVariables = {
  id: ..., 
  deletedBy: ..., // optional
  deletedAt: ..., 
};

// Call the `softDeleteFile()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await softDeleteFile(softDeleteFileVars);
// Variables can be defined inline as well.
const { data } = await softDeleteFile({ id: ..., deletedBy: ..., deletedAt: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await softDeleteFile(dataConnect, softDeleteFileVars);

console.log(data.file_update);

// Or, you can use the `Promise` API.
softDeleteFile(softDeleteFileVars).then((response) => {
  const data = response.data;
  console.log(data.file_update);
});
```

### Using `SoftDeleteFile`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, softDeleteFileRef, SoftDeleteFileVariables } from '@mybox/dataconnect';

// The `SoftDeleteFile` mutation requires an argument of type `SoftDeleteFileVariables`:
const softDeleteFileVars: SoftDeleteFileVariables = {
  id: ..., 
  deletedBy: ..., // optional
  deletedAt: ..., 
};

// Call the `softDeleteFileRef()` function to get a reference to the mutation.
const ref = softDeleteFileRef(softDeleteFileVars);
// Variables can be defined inline as well.
const ref = softDeleteFileRef({ id: ..., deletedBy: ..., deletedAt: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = softDeleteFileRef(dataConnect, softDeleteFileVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.file_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.file_update);
});
```

## HardDeleteFile
You can execute the `HardDeleteFile` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
hardDeleteFile(vars: HardDeleteFileVariables): MutationPromise<HardDeleteFileData, HardDeleteFileVariables>;

interface HardDeleteFileRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: HardDeleteFileVariables): MutationRef<HardDeleteFileData, HardDeleteFileVariables>;
}
export const hardDeleteFileRef: HardDeleteFileRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
hardDeleteFile(dc: DataConnect, vars: HardDeleteFileVariables): MutationPromise<HardDeleteFileData, HardDeleteFileVariables>;

interface HardDeleteFileRef {
  ...
  (dc: DataConnect, vars: HardDeleteFileVariables): MutationRef<HardDeleteFileData, HardDeleteFileVariables>;
}
export const hardDeleteFileRef: HardDeleteFileRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the hardDeleteFileRef:
```typescript
const name = hardDeleteFileRef.operationName;
console.log(name);
```

### Variables
The `HardDeleteFile` mutation requires an argument of type `HardDeleteFileVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface HardDeleteFileVariables {
  id: UUIDString;
}
```
### Return Type
Recall that executing the `HardDeleteFile` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `HardDeleteFileData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface HardDeleteFileData {
  file_delete?: File_Key | null;
}
```
### Using `HardDeleteFile`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, hardDeleteFile, HardDeleteFileVariables } from '@mybox/dataconnect';

// The `HardDeleteFile` mutation requires an argument of type `HardDeleteFileVariables`:
const hardDeleteFileVars: HardDeleteFileVariables = {
  id: ..., 
};

// Call the `hardDeleteFile()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await hardDeleteFile(hardDeleteFileVars);
// Variables can be defined inline as well.
const { data } = await hardDeleteFile({ id: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await hardDeleteFile(dataConnect, hardDeleteFileVars);

console.log(data.file_delete);

// Or, you can use the `Promise` API.
hardDeleteFile(hardDeleteFileVars).then((response) => {
  const data = response.data;
  console.log(data.file_delete);
});
```

### Using `HardDeleteFile`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, hardDeleteFileRef, HardDeleteFileVariables } from '@mybox/dataconnect';

// The `HardDeleteFile` mutation requires an argument of type `HardDeleteFileVariables`:
const hardDeleteFileVars: HardDeleteFileVariables = {
  id: ..., 
};

// Call the `hardDeleteFileRef()` function to get a reference to the mutation.
const ref = hardDeleteFileRef(hardDeleteFileVars);
// Variables can be defined inline as well.
const ref = hardDeleteFileRef({ id: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = hardDeleteFileRef(dataConnect, hardDeleteFileVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.file_delete);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.file_delete);
});
```

## AssociateFileWithLoan
You can execute the `AssociateFileWithLoan` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
associateFileWithLoan(vars: AssociateFileWithLoanVariables): MutationPromise<AssociateFileWithLoanData, AssociateFileWithLoanVariables>;

interface AssociateFileWithLoanRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: AssociateFileWithLoanVariables): MutationRef<AssociateFileWithLoanData, AssociateFileWithLoanVariables>;
}
export const associateFileWithLoanRef: AssociateFileWithLoanRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
associateFileWithLoan(dc: DataConnect, vars: AssociateFileWithLoanVariables): MutationPromise<AssociateFileWithLoanData, AssociateFileWithLoanVariables>;

interface AssociateFileWithLoanRef {
  ...
  (dc: DataConnect, vars: AssociateFileWithLoanVariables): MutationRef<AssociateFileWithLoanData, AssociateFileWithLoanVariables>;
}
export const associateFileWithLoanRef: AssociateFileWithLoanRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the associateFileWithLoanRef:
```typescript
const name = associateFileWithLoanRef.operationName;
console.log(name);
```

### Variables
The `AssociateFileWithLoan` mutation requires an argument of type `AssociateFileWithLoanVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface AssociateFileWithLoanVariables {
  fileId: UUIDString;
  loanId: UUIDString;
  associatedBy?: UUIDString | null;
}
```
### Return Type
Recall that executing the `AssociateFileWithLoan` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `AssociateFileWithLoanData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface AssociateFileWithLoanData {
  fileLoanAssociation_insert: FileLoanAssociation_Key;
}
```
### Using `AssociateFileWithLoan`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, associateFileWithLoan, AssociateFileWithLoanVariables } from '@mybox/dataconnect';

// The `AssociateFileWithLoan` mutation requires an argument of type `AssociateFileWithLoanVariables`:
const associateFileWithLoanVars: AssociateFileWithLoanVariables = {
  fileId: ..., 
  loanId: ..., 
  associatedBy: ..., // optional
};

// Call the `associateFileWithLoan()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await associateFileWithLoan(associateFileWithLoanVars);
// Variables can be defined inline as well.
const { data } = await associateFileWithLoan({ fileId: ..., loanId: ..., associatedBy: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await associateFileWithLoan(dataConnect, associateFileWithLoanVars);

console.log(data.fileLoanAssociation_insert);

// Or, you can use the `Promise` API.
associateFileWithLoan(associateFileWithLoanVars).then((response) => {
  const data = response.data;
  console.log(data.fileLoanAssociation_insert);
});
```

### Using `AssociateFileWithLoan`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, associateFileWithLoanRef, AssociateFileWithLoanVariables } from '@mybox/dataconnect';

// The `AssociateFileWithLoan` mutation requires an argument of type `AssociateFileWithLoanVariables`:
const associateFileWithLoanVars: AssociateFileWithLoanVariables = {
  fileId: ..., 
  loanId: ..., 
  associatedBy: ..., // optional
};

// Call the `associateFileWithLoanRef()` function to get a reference to the mutation.
const ref = associateFileWithLoanRef(associateFileWithLoanVars);
// Variables can be defined inline as well.
const ref = associateFileWithLoanRef({ fileId: ..., loanId: ..., associatedBy: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = associateFileWithLoanRef(dataConnect, associateFileWithLoanVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.fileLoanAssociation_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.fileLoanAssociation_insert);
});
```

## RemoveFileFromLoan
You can execute the `RemoveFileFromLoan` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
removeFileFromLoan(vars: RemoveFileFromLoanVariables): MutationPromise<RemoveFileFromLoanData, RemoveFileFromLoanVariables>;

interface RemoveFileFromLoanRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: RemoveFileFromLoanVariables): MutationRef<RemoveFileFromLoanData, RemoveFileFromLoanVariables>;
}
export const removeFileFromLoanRef: RemoveFileFromLoanRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
removeFileFromLoan(dc: DataConnect, vars: RemoveFileFromLoanVariables): MutationPromise<RemoveFileFromLoanData, RemoveFileFromLoanVariables>;

interface RemoveFileFromLoanRef {
  ...
  (dc: DataConnect, vars: RemoveFileFromLoanVariables): MutationRef<RemoveFileFromLoanData, RemoveFileFromLoanVariables>;
}
export const removeFileFromLoanRef: RemoveFileFromLoanRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the removeFileFromLoanRef:
```typescript
const name = removeFileFromLoanRef.operationName;
console.log(name);
```

### Variables
The `RemoveFileFromLoan` mutation requires an argument of type `RemoveFileFromLoanVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface RemoveFileFromLoanVariables {
  id: UUIDString;
}
```
### Return Type
Recall that executing the `RemoveFileFromLoan` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `RemoveFileFromLoanData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface RemoveFileFromLoanData {
  fileLoanAssociation_delete?: FileLoanAssociation_Key | null;
}
```
### Using `RemoveFileFromLoan`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, removeFileFromLoan, RemoveFileFromLoanVariables } from '@mybox/dataconnect';

// The `RemoveFileFromLoan` mutation requires an argument of type `RemoveFileFromLoanVariables`:
const removeFileFromLoanVars: RemoveFileFromLoanVariables = {
  id: ..., 
};

// Call the `removeFileFromLoan()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await removeFileFromLoan(removeFileFromLoanVars);
// Variables can be defined inline as well.
const { data } = await removeFileFromLoan({ id: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await removeFileFromLoan(dataConnect, removeFileFromLoanVars);

console.log(data.fileLoanAssociation_delete);

// Or, you can use the `Promise` API.
removeFileFromLoan(removeFileFromLoanVars).then((response) => {
  const data = response.data;
  console.log(data.fileLoanAssociation_delete);
});
```

### Using `RemoveFileFromLoan`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, removeFileFromLoanRef, RemoveFileFromLoanVariables } from '@mybox/dataconnect';

// The `RemoveFileFromLoan` mutation requires an argument of type `RemoveFileFromLoanVariables`:
const removeFileFromLoanVars: RemoveFileFromLoanVariables = {
  id: ..., 
};

// Call the `removeFileFromLoanRef()` function to get a reference to the mutation.
const ref = removeFileFromLoanRef(removeFileFromLoanVars);
// Variables can be defined inline as well.
const ref = removeFileFromLoanRef({ id: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = removeFileFromLoanRef(dataConnect, removeFileFromLoanVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.fileLoanAssociation_delete);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.fileLoanAssociation_delete);
});
```

## CreateAuthSession
You can execute the `CreateAuthSession` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
createAuthSession(vars: CreateAuthSessionVariables): MutationPromise<CreateAuthSessionData, CreateAuthSessionVariables>;

interface CreateAuthSessionRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateAuthSessionVariables): MutationRef<CreateAuthSessionData, CreateAuthSessionVariables>;
}
export const createAuthSessionRef: CreateAuthSessionRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createAuthSession(dc: DataConnect, vars: CreateAuthSessionVariables): MutationPromise<CreateAuthSessionData, CreateAuthSessionVariables>;

interface CreateAuthSessionRef {
  ...
  (dc: DataConnect, vars: CreateAuthSessionVariables): MutationRef<CreateAuthSessionData, CreateAuthSessionVariables>;
}
export const createAuthSessionRef: CreateAuthSessionRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createAuthSessionRef:
```typescript
const name = createAuthSessionRef.operationName;
console.log(name);
```

### Variables
The `CreateAuthSession` mutation requires an argument of type `CreateAuthSessionVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreateAuthSessionVariables {
  sessionId: string;
  userId: UUIDString;
  loanIds?: string | null;
  emailHash: string;
  magicToken?: string | null;
  expiresAt: TimestampString;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdBy?: UUIDString | null;
}
```
### Return Type
Recall that executing the `CreateAuthSession` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateAuthSessionData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateAuthSessionData {
  authSession_insert: AuthSession_Key;
}
```
### Using `CreateAuthSession`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createAuthSession, CreateAuthSessionVariables } from '@mybox/dataconnect';

// The `CreateAuthSession` mutation requires an argument of type `CreateAuthSessionVariables`:
const createAuthSessionVars: CreateAuthSessionVariables = {
  sessionId: ..., 
  userId: ..., 
  loanIds: ..., // optional
  emailHash: ..., 
  magicToken: ..., // optional
  expiresAt: ..., 
  ipAddress: ..., // optional
  userAgent: ..., // optional
  createdBy: ..., // optional
};

// Call the `createAuthSession()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createAuthSession(createAuthSessionVars);
// Variables can be defined inline as well.
const { data } = await createAuthSession({ sessionId: ..., userId: ..., loanIds: ..., emailHash: ..., magicToken: ..., expiresAt: ..., ipAddress: ..., userAgent: ..., createdBy: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createAuthSession(dataConnect, createAuthSessionVars);

console.log(data.authSession_insert);

// Or, you can use the `Promise` API.
createAuthSession(createAuthSessionVars).then((response) => {
  const data = response.data;
  console.log(data.authSession_insert);
});
```

### Using `CreateAuthSession`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createAuthSessionRef, CreateAuthSessionVariables } from '@mybox/dataconnect';

// The `CreateAuthSession` mutation requires an argument of type `CreateAuthSessionVariables`:
const createAuthSessionVars: CreateAuthSessionVariables = {
  sessionId: ..., 
  userId: ..., 
  loanIds: ..., // optional
  emailHash: ..., 
  magicToken: ..., // optional
  expiresAt: ..., 
  ipAddress: ..., // optional
  userAgent: ..., // optional
  createdBy: ..., // optional
};

// Call the `createAuthSessionRef()` function to get a reference to the mutation.
const ref = createAuthSessionRef(createAuthSessionVars);
// Variables can be defined inline as well.
const ref = createAuthSessionRef({ sessionId: ..., userId: ..., loanIds: ..., emailHash: ..., magicToken: ..., expiresAt: ..., ipAddress: ..., userAgent: ..., createdBy: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createAuthSessionRef(dataConnect, createAuthSessionVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.authSession_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.authSession_insert);
});
```

## CreateAuthSessionWithFirebase
You can execute the `CreateAuthSessionWithFirebase` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
createAuthSessionWithFirebase(vars: CreateAuthSessionWithFirebaseVariables): MutationPromise<CreateAuthSessionWithFirebaseData, CreateAuthSessionWithFirebaseVariables>;

interface CreateAuthSessionWithFirebaseRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateAuthSessionWithFirebaseVariables): MutationRef<CreateAuthSessionWithFirebaseData, CreateAuthSessionWithFirebaseVariables>;
}
export const createAuthSessionWithFirebaseRef: CreateAuthSessionWithFirebaseRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createAuthSessionWithFirebase(dc: DataConnect, vars: CreateAuthSessionWithFirebaseVariables): MutationPromise<CreateAuthSessionWithFirebaseData, CreateAuthSessionWithFirebaseVariables>;

interface CreateAuthSessionWithFirebaseRef {
  ...
  (dc: DataConnect, vars: CreateAuthSessionWithFirebaseVariables): MutationRef<CreateAuthSessionWithFirebaseData, CreateAuthSessionWithFirebaseVariables>;
}
export const createAuthSessionWithFirebaseRef: CreateAuthSessionWithFirebaseRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createAuthSessionWithFirebaseRef:
```typescript
const name = createAuthSessionWithFirebaseRef.operationName;
console.log(name);
```

### Variables
The `CreateAuthSessionWithFirebase` mutation requires an argument of type `CreateAuthSessionWithFirebaseVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreateAuthSessionWithFirebaseVariables {
  sessionId: string;
  userId: UUIDString;
  firebaseUid: string;
  emailHash: string;
  loanIds?: string | null;
  borrowerContactId?: string | null;
  loanNumber?: string | null;
  expiresAt: TimestampString;
  ipAddress?: string | null;
  userAgent?: string | null;
}
```
### Return Type
Recall that executing the `CreateAuthSessionWithFirebase` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateAuthSessionWithFirebaseData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateAuthSessionWithFirebaseData {
  authSession_insert: AuthSession_Key;
}
```
### Using `CreateAuthSessionWithFirebase`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createAuthSessionWithFirebase, CreateAuthSessionWithFirebaseVariables } from '@mybox/dataconnect';

// The `CreateAuthSessionWithFirebase` mutation requires an argument of type `CreateAuthSessionWithFirebaseVariables`:
const createAuthSessionWithFirebaseVars: CreateAuthSessionWithFirebaseVariables = {
  sessionId: ..., 
  userId: ..., 
  firebaseUid: ..., 
  emailHash: ..., 
  loanIds: ..., // optional
  borrowerContactId: ..., // optional
  loanNumber: ..., // optional
  expiresAt: ..., 
  ipAddress: ..., // optional
  userAgent: ..., // optional
};

// Call the `createAuthSessionWithFirebase()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createAuthSessionWithFirebase(createAuthSessionWithFirebaseVars);
// Variables can be defined inline as well.
const { data } = await createAuthSessionWithFirebase({ sessionId: ..., userId: ..., firebaseUid: ..., emailHash: ..., loanIds: ..., borrowerContactId: ..., loanNumber: ..., expiresAt: ..., ipAddress: ..., userAgent: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createAuthSessionWithFirebase(dataConnect, createAuthSessionWithFirebaseVars);

console.log(data.authSession_insert);

// Or, you can use the `Promise` API.
createAuthSessionWithFirebase(createAuthSessionWithFirebaseVars).then((response) => {
  const data = response.data;
  console.log(data.authSession_insert);
});
```

### Using `CreateAuthSessionWithFirebase`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createAuthSessionWithFirebaseRef, CreateAuthSessionWithFirebaseVariables } from '@mybox/dataconnect';

// The `CreateAuthSessionWithFirebase` mutation requires an argument of type `CreateAuthSessionWithFirebaseVariables`:
const createAuthSessionWithFirebaseVars: CreateAuthSessionWithFirebaseVariables = {
  sessionId: ..., 
  userId: ..., 
  firebaseUid: ..., 
  emailHash: ..., 
  loanIds: ..., // optional
  borrowerContactId: ..., // optional
  loanNumber: ..., // optional
  expiresAt: ..., 
  ipAddress: ..., // optional
  userAgent: ..., // optional
};

// Call the `createAuthSessionWithFirebaseRef()` function to get a reference to the mutation.
const ref = createAuthSessionWithFirebaseRef(createAuthSessionWithFirebaseVars);
// Variables can be defined inline as well.
const ref = createAuthSessionWithFirebaseRef({ sessionId: ..., userId: ..., firebaseUid: ..., emailHash: ..., loanIds: ..., borrowerContactId: ..., loanNumber: ..., expiresAt: ..., ipAddress: ..., userAgent: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createAuthSessionWithFirebaseRef(dataConnect, createAuthSessionWithFirebaseVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.authSession_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.authSession_insert);
});
```

## UpdateAuthSession
You can execute the `UpdateAuthSession` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
updateAuthSession(vars: UpdateAuthSessionVariables): MutationPromise<UpdateAuthSessionData, UpdateAuthSessionVariables>;

interface UpdateAuthSessionRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateAuthSessionVariables): MutationRef<UpdateAuthSessionData, UpdateAuthSessionVariables>;
}
export const updateAuthSessionRef: UpdateAuthSessionRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
updateAuthSession(dc: DataConnect, vars: UpdateAuthSessionVariables): MutationPromise<UpdateAuthSessionData, UpdateAuthSessionVariables>;

interface UpdateAuthSessionRef {
  ...
  (dc: DataConnect, vars: UpdateAuthSessionVariables): MutationRef<UpdateAuthSessionData, UpdateAuthSessionVariables>;
}
export const updateAuthSessionRef: UpdateAuthSessionRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the updateAuthSessionRef:
```typescript
const name = updateAuthSessionRef.operationName;
console.log(name);
```

### Variables
The `UpdateAuthSession` mutation requires an argument of type `UpdateAuthSessionVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UpdateAuthSessionVariables {
  id: UUIDString;
  status?: string | null;
  sessionToken?: string | null;
  verifiedAt?: TimestampString | null;
  lastAccessedAt?: TimestampString | null;
}
```
### Return Type
Recall that executing the `UpdateAuthSession` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpdateAuthSessionData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpdateAuthSessionData {
  authSession_update?: AuthSession_Key | null;
}
```
### Using `UpdateAuthSession`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, updateAuthSession, UpdateAuthSessionVariables } from '@mybox/dataconnect';

// The `UpdateAuthSession` mutation requires an argument of type `UpdateAuthSessionVariables`:
const updateAuthSessionVars: UpdateAuthSessionVariables = {
  id: ..., 
  status: ..., // optional
  sessionToken: ..., // optional
  verifiedAt: ..., // optional
  lastAccessedAt: ..., // optional
};

// Call the `updateAuthSession()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await updateAuthSession(updateAuthSessionVars);
// Variables can be defined inline as well.
const { data } = await updateAuthSession({ id: ..., status: ..., sessionToken: ..., verifiedAt: ..., lastAccessedAt: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await updateAuthSession(dataConnect, updateAuthSessionVars);

console.log(data.authSession_update);

// Or, you can use the `Promise` API.
updateAuthSession(updateAuthSessionVars).then((response) => {
  const data = response.data;
  console.log(data.authSession_update);
});
```

### Using `UpdateAuthSession`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, updateAuthSessionRef, UpdateAuthSessionVariables } from '@mybox/dataconnect';

// The `UpdateAuthSession` mutation requires an argument of type `UpdateAuthSessionVariables`:
const updateAuthSessionVars: UpdateAuthSessionVariables = {
  id: ..., 
  status: ..., // optional
  sessionToken: ..., // optional
  verifiedAt: ..., // optional
  lastAccessedAt: ..., // optional
};

// Call the `updateAuthSessionRef()` function to get a reference to the mutation.
const ref = updateAuthSessionRef(updateAuthSessionVars);
// Variables can be defined inline as well.
const ref = updateAuthSessionRef({ id: ..., status: ..., sessionToken: ..., verifiedAt: ..., lastAccessedAt: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = updateAuthSessionRef(dataConnect, updateAuthSessionVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.authSession_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.authSession_update);
});
```

## VerifyAuthSession
You can execute the `VerifyAuthSession` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
verifyAuthSession(vars: VerifyAuthSessionVariables): MutationPromise<VerifyAuthSessionData, VerifyAuthSessionVariables>;

interface VerifyAuthSessionRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: VerifyAuthSessionVariables): MutationRef<VerifyAuthSessionData, VerifyAuthSessionVariables>;
}
export const verifyAuthSessionRef: VerifyAuthSessionRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
verifyAuthSession(dc: DataConnect, vars: VerifyAuthSessionVariables): MutationPromise<VerifyAuthSessionData, VerifyAuthSessionVariables>;

interface VerifyAuthSessionRef {
  ...
  (dc: DataConnect, vars: VerifyAuthSessionVariables): MutationRef<VerifyAuthSessionData, VerifyAuthSessionVariables>;
}
export const verifyAuthSessionRef: VerifyAuthSessionRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the verifyAuthSessionRef:
```typescript
const name = verifyAuthSessionRef.operationName;
console.log(name);
```

### Variables
The `VerifyAuthSession` mutation requires an argument of type `VerifyAuthSessionVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface VerifyAuthSessionVariables {
  id: UUIDString;
  sessionToken: string;
  verifiedAt: TimestampString;
}
```
### Return Type
Recall that executing the `VerifyAuthSession` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `VerifyAuthSessionData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface VerifyAuthSessionData {
  authSession_update?: AuthSession_Key | null;
}
```
### Using `VerifyAuthSession`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, verifyAuthSession, VerifyAuthSessionVariables } from '@mybox/dataconnect';

// The `VerifyAuthSession` mutation requires an argument of type `VerifyAuthSessionVariables`:
const verifyAuthSessionVars: VerifyAuthSessionVariables = {
  id: ..., 
  sessionToken: ..., 
  verifiedAt: ..., 
};

// Call the `verifyAuthSession()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await verifyAuthSession(verifyAuthSessionVars);
// Variables can be defined inline as well.
const { data } = await verifyAuthSession({ id: ..., sessionToken: ..., verifiedAt: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await verifyAuthSession(dataConnect, verifyAuthSessionVars);

console.log(data.authSession_update);

// Or, you can use the `Promise` API.
verifyAuthSession(verifyAuthSessionVars).then((response) => {
  const data = response.data;
  console.log(data.authSession_update);
});
```

### Using `VerifyAuthSession`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, verifyAuthSessionRef, VerifyAuthSessionVariables } from '@mybox/dataconnect';

// The `VerifyAuthSession` mutation requires an argument of type `VerifyAuthSessionVariables`:
const verifyAuthSessionVars: VerifyAuthSessionVariables = {
  id: ..., 
  sessionToken: ..., 
  verifiedAt: ..., 
};

// Call the `verifyAuthSessionRef()` function to get a reference to the mutation.
const ref = verifyAuthSessionRef(verifyAuthSessionVars);
// Variables can be defined inline as well.
const ref = verifyAuthSessionRef({ id: ..., sessionToken: ..., verifiedAt: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = verifyAuthSessionRef(dataConnect, verifyAuthSessionVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.authSession_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.authSession_update);
});
```

## UpdateSessionAccess
You can execute the `UpdateSessionAccess` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
updateSessionAccess(vars: UpdateSessionAccessVariables): MutationPromise<UpdateSessionAccessData, UpdateSessionAccessVariables>;

interface UpdateSessionAccessRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateSessionAccessVariables): MutationRef<UpdateSessionAccessData, UpdateSessionAccessVariables>;
}
export const updateSessionAccessRef: UpdateSessionAccessRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
updateSessionAccess(dc: DataConnect, vars: UpdateSessionAccessVariables): MutationPromise<UpdateSessionAccessData, UpdateSessionAccessVariables>;

interface UpdateSessionAccessRef {
  ...
  (dc: DataConnect, vars: UpdateSessionAccessVariables): MutationRef<UpdateSessionAccessData, UpdateSessionAccessVariables>;
}
export const updateSessionAccessRef: UpdateSessionAccessRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the updateSessionAccessRef:
```typescript
const name = updateSessionAccessRef.operationName;
console.log(name);
```

### Variables
The `UpdateSessionAccess` mutation requires an argument of type `UpdateSessionAccessVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UpdateSessionAccessVariables {
  id: UUIDString;
  lastAccessedAt: TimestampString;
}
```
### Return Type
Recall that executing the `UpdateSessionAccess` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpdateSessionAccessData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpdateSessionAccessData {
  authSession_update?: AuthSession_Key | null;
}
```
### Using `UpdateSessionAccess`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, updateSessionAccess, UpdateSessionAccessVariables } from '@mybox/dataconnect';

// The `UpdateSessionAccess` mutation requires an argument of type `UpdateSessionAccessVariables`:
const updateSessionAccessVars: UpdateSessionAccessVariables = {
  id: ..., 
  lastAccessedAt: ..., 
};

// Call the `updateSessionAccess()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await updateSessionAccess(updateSessionAccessVars);
// Variables can be defined inline as well.
const { data } = await updateSessionAccess({ id: ..., lastAccessedAt: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await updateSessionAccess(dataConnect, updateSessionAccessVars);

console.log(data.authSession_update);

// Or, you can use the `Promise` API.
updateSessionAccess(updateSessionAccessVars).then((response) => {
  const data = response.data;
  console.log(data.authSession_update);
});
```

### Using `UpdateSessionAccess`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, updateSessionAccessRef, UpdateSessionAccessVariables } from '@mybox/dataconnect';

// The `UpdateSessionAccess` mutation requires an argument of type `UpdateSessionAccessVariables`:
const updateSessionAccessVars: UpdateSessionAccessVariables = {
  id: ..., 
  lastAccessedAt: ..., 
};

// Call the `updateSessionAccessRef()` function to get a reference to the mutation.
const ref = updateSessionAccessRef(updateSessionAccessVars);
// Variables can be defined inline as well.
const ref = updateSessionAccessRef({ id: ..., lastAccessedAt: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = updateSessionAccessRef(dataConnect, updateSessionAccessVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.authSession_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.authSession_update);
});
```

## RevokeAuthSession
You can execute the `RevokeAuthSession` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
revokeAuthSession(vars: RevokeAuthSessionVariables): MutationPromise<RevokeAuthSessionData, RevokeAuthSessionVariables>;

interface RevokeAuthSessionRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: RevokeAuthSessionVariables): MutationRef<RevokeAuthSessionData, RevokeAuthSessionVariables>;
}
export const revokeAuthSessionRef: RevokeAuthSessionRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
revokeAuthSession(dc: DataConnect, vars: RevokeAuthSessionVariables): MutationPromise<RevokeAuthSessionData, RevokeAuthSessionVariables>;

interface RevokeAuthSessionRef {
  ...
  (dc: DataConnect, vars: RevokeAuthSessionVariables): MutationRef<RevokeAuthSessionData, RevokeAuthSessionVariables>;
}
export const revokeAuthSessionRef: RevokeAuthSessionRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the revokeAuthSessionRef:
```typescript
const name = revokeAuthSessionRef.operationName;
console.log(name);
```

### Variables
The `RevokeAuthSession` mutation requires an argument of type `RevokeAuthSessionVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface RevokeAuthSessionVariables {
  id: UUIDString;
  revokedBy?: UUIDString | null;
  revokeReason?: string | null;
  revokedAt: TimestampString;
}
```
### Return Type
Recall that executing the `RevokeAuthSession` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `RevokeAuthSessionData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface RevokeAuthSessionData {
  authSession_update?: AuthSession_Key | null;
}
```
### Using `RevokeAuthSession`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, revokeAuthSession, RevokeAuthSessionVariables } from '@mybox/dataconnect';

// The `RevokeAuthSession` mutation requires an argument of type `RevokeAuthSessionVariables`:
const revokeAuthSessionVars: RevokeAuthSessionVariables = {
  id: ..., 
  revokedBy: ..., // optional
  revokeReason: ..., // optional
  revokedAt: ..., 
};

// Call the `revokeAuthSession()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await revokeAuthSession(revokeAuthSessionVars);
// Variables can be defined inline as well.
const { data } = await revokeAuthSession({ id: ..., revokedBy: ..., revokeReason: ..., revokedAt: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await revokeAuthSession(dataConnect, revokeAuthSessionVars);

console.log(data.authSession_update);

// Or, you can use the `Promise` API.
revokeAuthSession(revokeAuthSessionVars).then((response) => {
  const data = response.data;
  console.log(data.authSession_update);
});
```

### Using `RevokeAuthSession`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, revokeAuthSessionRef, RevokeAuthSessionVariables } from '@mybox/dataconnect';

// The `RevokeAuthSession` mutation requires an argument of type `RevokeAuthSessionVariables`:
const revokeAuthSessionVars: RevokeAuthSessionVariables = {
  id: ..., 
  revokedBy: ..., // optional
  revokeReason: ..., // optional
  revokedAt: ..., 
};

// Call the `revokeAuthSessionRef()` function to get a reference to the mutation.
const ref = revokeAuthSessionRef(revokeAuthSessionVars);
// Variables can be defined inline as well.
const ref = revokeAuthSessionRef({ id: ..., revokedBy: ..., revokeReason: ..., revokedAt: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = revokeAuthSessionRef(dataConnect, revokeAuthSessionVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.authSession_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.authSession_update);
});
```

## CreateVerificationCode
You can execute the `CreateVerificationCode` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
createVerificationCode(vars: CreateVerificationCodeVariables): MutationPromise<CreateVerificationCodeData, CreateVerificationCodeVariables>;

interface CreateVerificationCodeRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateVerificationCodeVariables): MutationRef<CreateVerificationCodeData, CreateVerificationCodeVariables>;
}
export const createVerificationCodeRef: CreateVerificationCodeRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createVerificationCode(dc: DataConnect, vars: CreateVerificationCodeVariables): MutationPromise<CreateVerificationCodeData, CreateVerificationCodeVariables>;

interface CreateVerificationCodeRef {
  ...
  (dc: DataConnect, vars: CreateVerificationCodeVariables): MutationRef<CreateVerificationCodeData, CreateVerificationCodeVariables>;
}
export const createVerificationCodeRef: CreateVerificationCodeRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createVerificationCodeRef:
```typescript
const name = createVerificationCodeRef.operationName;
console.log(name);
```

### Variables
The `CreateVerificationCode` mutation requires an argument of type `CreateVerificationCodeVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreateVerificationCodeVariables {
  sessionId: string;
  codeHash: string;
  expiresAt: TimestampString;
}
```
### Return Type
Recall that executing the `CreateVerificationCode` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateVerificationCodeData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateVerificationCodeData {
  verificationCode_insert: VerificationCode_Key;
}
```
### Using `CreateVerificationCode`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createVerificationCode, CreateVerificationCodeVariables } from '@mybox/dataconnect';

// The `CreateVerificationCode` mutation requires an argument of type `CreateVerificationCodeVariables`:
const createVerificationCodeVars: CreateVerificationCodeVariables = {
  sessionId: ..., 
  codeHash: ..., 
  expiresAt: ..., 
};

// Call the `createVerificationCode()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createVerificationCode(createVerificationCodeVars);
// Variables can be defined inline as well.
const { data } = await createVerificationCode({ sessionId: ..., codeHash: ..., expiresAt: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createVerificationCode(dataConnect, createVerificationCodeVars);

console.log(data.verificationCode_insert);

// Or, you can use the `Promise` API.
createVerificationCode(createVerificationCodeVars).then((response) => {
  const data = response.data;
  console.log(data.verificationCode_insert);
});
```

### Using `CreateVerificationCode`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createVerificationCodeRef, CreateVerificationCodeVariables } from '@mybox/dataconnect';

// The `CreateVerificationCode` mutation requires an argument of type `CreateVerificationCodeVariables`:
const createVerificationCodeVars: CreateVerificationCodeVariables = {
  sessionId: ..., 
  codeHash: ..., 
  expiresAt: ..., 
};

// Call the `createVerificationCodeRef()` function to get a reference to the mutation.
const ref = createVerificationCodeRef(createVerificationCodeVars);
// Variables can be defined inline as well.
const ref = createVerificationCodeRef({ sessionId: ..., codeHash: ..., expiresAt: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createVerificationCodeRef(dataConnect, createVerificationCodeVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.verificationCode_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.verificationCode_insert);
});
```

## UpdateVerificationCodeAttempts
You can execute the `UpdateVerificationCodeAttempts` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
updateVerificationCodeAttempts(vars: UpdateVerificationCodeAttemptsVariables): MutationPromise<UpdateVerificationCodeAttemptsData, UpdateVerificationCodeAttemptsVariables>;

interface UpdateVerificationCodeAttemptsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateVerificationCodeAttemptsVariables): MutationRef<UpdateVerificationCodeAttemptsData, UpdateVerificationCodeAttemptsVariables>;
}
export const updateVerificationCodeAttemptsRef: UpdateVerificationCodeAttemptsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
updateVerificationCodeAttempts(dc: DataConnect, vars: UpdateVerificationCodeAttemptsVariables): MutationPromise<UpdateVerificationCodeAttemptsData, UpdateVerificationCodeAttemptsVariables>;

interface UpdateVerificationCodeAttemptsRef {
  ...
  (dc: DataConnect, vars: UpdateVerificationCodeAttemptsVariables): MutationRef<UpdateVerificationCodeAttemptsData, UpdateVerificationCodeAttemptsVariables>;
}
export const updateVerificationCodeAttemptsRef: UpdateVerificationCodeAttemptsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the updateVerificationCodeAttemptsRef:
```typescript
const name = updateVerificationCodeAttemptsRef.operationName;
console.log(name);
```

### Variables
The `UpdateVerificationCodeAttempts` mutation requires an argument of type `UpdateVerificationCodeAttemptsVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UpdateVerificationCodeAttemptsVariables {
  id: UUIDString;
  attemptCount: number;
}
```
### Return Type
Recall that executing the `UpdateVerificationCodeAttempts` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpdateVerificationCodeAttemptsData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpdateVerificationCodeAttemptsData {
  verificationCode_update?: VerificationCode_Key | null;
}
```
### Using `UpdateVerificationCodeAttempts`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, updateVerificationCodeAttempts, UpdateVerificationCodeAttemptsVariables } from '@mybox/dataconnect';

// The `UpdateVerificationCodeAttempts` mutation requires an argument of type `UpdateVerificationCodeAttemptsVariables`:
const updateVerificationCodeAttemptsVars: UpdateVerificationCodeAttemptsVariables = {
  id: ..., 
  attemptCount: ..., 
};

// Call the `updateVerificationCodeAttempts()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await updateVerificationCodeAttempts(updateVerificationCodeAttemptsVars);
// Variables can be defined inline as well.
const { data } = await updateVerificationCodeAttempts({ id: ..., attemptCount: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await updateVerificationCodeAttempts(dataConnect, updateVerificationCodeAttemptsVars);

console.log(data.verificationCode_update);

// Or, you can use the `Promise` API.
updateVerificationCodeAttempts(updateVerificationCodeAttemptsVars).then((response) => {
  const data = response.data;
  console.log(data.verificationCode_update);
});
```

### Using `UpdateVerificationCodeAttempts`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, updateVerificationCodeAttemptsRef, UpdateVerificationCodeAttemptsVariables } from '@mybox/dataconnect';

// The `UpdateVerificationCodeAttempts` mutation requires an argument of type `UpdateVerificationCodeAttemptsVariables`:
const updateVerificationCodeAttemptsVars: UpdateVerificationCodeAttemptsVariables = {
  id: ..., 
  attemptCount: ..., 
};

// Call the `updateVerificationCodeAttemptsRef()` function to get a reference to the mutation.
const ref = updateVerificationCodeAttemptsRef(updateVerificationCodeAttemptsVars);
// Variables can be defined inline as well.
const ref = updateVerificationCodeAttemptsRef({ id: ..., attemptCount: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = updateVerificationCodeAttemptsRef(dataConnect, updateVerificationCodeAttemptsVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.verificationCode_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.verificationCode_update);
});
```

## MarkVerificationCodeUsed
You can execute the `MarkVerificationCodeUsed` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
markVerificationCodeUsed(vars: MarkVerificationCodeUsedVariables): MutationPromise<MarkVerificationCodeUsedData, MarkVerificationCodeUsedVariables>;

interface MarkVerificationCodeUsedRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: MarkVerificationCodeUsedVariables): MutationRef<MarkVerificationCodeUsedData, MarkVerificationCodeUsedVariables>;
}
export const markVerificationCodeUsedRef: MarkVerificationCodeUsedRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
markVerificationCodeUsed(dc: DataConnect, vars: MarkVerificationCodeUsedVariables): MutationPromise<MarkVerificationCodeUsedData, MarkVerificationCodeUsedVariables>;

interface MarkVerificationCodeUsedRef {
  ...
  (dc: DataConnect, vars: MarkVerificationCodeUsedVariables): MutationRef<MarkVerificationCodeUsedData, MarkVerificationCodeUsedVariables>;
}
export const markVerificationCodeUsedRef: MarkVerificationCodeUsedRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the markVerificationCodeUsedRef:
```typescript
const name = markVerificationCodeUsedRef.operationName;
console.log(name);
```

### Variables
The `MarkVerificationCodeUsed` mutation requires an argument of type `MarkVerificationCodeUsedVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface MarkVerificationCodeUsedVariables {
  id: UUIDString;
  usedAt: TimestampString;
}
```
### Return Type
Recall that executing the `MarkVerificationCodeUsed` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `MarkVerificationCodeUsedData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface MarkVerificationCodeUsedData {
  verificationCode_update?: VerificationCode_Key | null;
}
```
### Using `MarkVerificationCodeUsed`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, markVerificationCodeUsed, MarkVerificationCodeUsedVariables } from '@mybox/dataconnect';

// The `MarkVerificationCodeUsed` mutation requires an argument of type `MarkVerificationCodeUsedVariables`:
const markVerificationCodeUsedVars: MarkVerificationCodeUsedVariables = {
  id: ..., 
  usedAt: ..., 
};

// Call the `markVerificationCodeUsed()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await markVerificationCodeUsed(markVerificationCodeUsedVars);
// Variables can be defined inline as well.
const { data } = await markVerificationCodeUsed({ id: ..., usedAt: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await markVerificationCodeUsed(dataConnect, markVerificationCodeUsedVars);

console.log(data.verificationCode_update);

// Or, you can use the `Promise` API.
markVerificationCodeUsed(markVerificationCodeUsedVars).then((response) => {
  const data = response.data;
  console.log(data.verificationCode_update);
});
```

### Using `MarkVerificationCodeUsed`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, markVerificationCodeUsedRef, MarkVerificationCodeUsedVariables } from '@mybox/dataconnect';

// The `MarkVerificationCodeUsed` mutation requires an argument of type `MarkVerificationCodeUsedVariables`:
const markVerificationCodeUsedVars: MarkVerificationCodeUsedVariables = {
  id: ..., 
  usedAt: ..., 
};

// Call the `markVerificationCodeUsedRef()` function to get a reference to the mutation.
const ref = markVerificationCodeUsedRef(markVerificationCodeUsedVars);
// Variables can be defined inline as well.
const ref = markVerificationCodeUsedRef({ id: ..., usedAt: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = markVerificationCodeUsedRef(dataConnect, markVerificationCodeUsedVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.verificationCode_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.verificationCode_update);
});
```

## LogAuthEvent
You can execute the `LogAuthEvent` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
logAuthEvent(vars: LogAuthEventVariables): MutationPromise<LogAuthEventData, LogAuthEventVariables>;

interface LogAuthEventRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: LogAuthEventVariables): MutationRef<LogAuthEventData, LogAuthEventVariables>;
}
export const logAuthEventRef: LogAuthEventRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
logAuthEvent(dc: DataConnect, vars: LogAuthEventVariables): MutationPromise<LogAuthEventData, LogAuthEventVariables>;

interface LogAuthEventRef {
  ...
  (dc: DataConnect, vars: LogAuthEventVariables): MutationRef<LogAuthEventData, LogAuthEventVariables>;
}
export const logAuthEventRef: LogAuthEventRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the logAuthEventRef:
```typescript
const name = logAuthEventRef.operationName;
console.log(name);
```

### Variables
The `LogAuthEvent` mutation requires an argument of type `LogAuthEventVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface LogAuthEventVariables {
  sessionId?: string | null;
  userId?: UUIDString | null;
  eventType: string;
  success: boolean;
  errorMessage?: string | null;
  errorCode?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  requestPayload?: string | null;
}
```
### Return Type
Recall that executing the `LogAuthEvent` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `LogAuthEventData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface LogAuthEventData {
  authAuditLog_insert: AuthAuditLog_Key;
}
```
### Using `LogAuthEvent`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, logAuthEvent, LogAuthEventVariables } from '@mybox/dataconnect';

// The `LogAuthEvent` mutation requires an argument of type `LogAuthEventVariables`:
const logAuthEventVars: LogAuthEventVariables = {
  sessionId: ..., // optional
  userId: ..., // optional
  eventType: ..., 
  success: ..., 
  errorMessage: ..., // optional
  errorCode: ..., // optional
  ipAddress: ..., // optional
  userAgent: ..., // optional
  requestPayload: ..., // optional
};

// Call the `logAuthEvent()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await logAuthEvent(logAuthEventVars);
// Variables can be defined inline as well.
const { data } = await logAuthEvent({ sessionId: ..., userId: ..., eventType: ..., success: ..., errorMessage: ..., errorCode: ..., ipAddress: ..., userAgent: ..., requestPayload: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await logAuthEvent(dataConnect, logAuthEventVars);

console.log(data.authAuditLog_insert);

// Or, you can use the `Promise` API.
logAuthEvent(logAuthEventVars).then((response) => {
  const data = response.data;
  console.log(data.authAuditLog_insert);
});
```

### Using `LogAuthEvent`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, logAuthEventRef, LogAuthEventVariables } from '@mybox/dataconnect';

// The `LogAuthEvent` mutation requires an argument of type `LogAuthEventVariables`:
const logAuthEventVars: LogAuthEventVariables = {
  sessionId: ..., // optional
  userId: ..., // optional
  eventType: ..., 
  success: ..., 
  errorMessage: ..., // optional
  errorCode: ..., // optional
  ipAddress: ..., // optional
  userAgent: ..., // optional
  requestPayload: ..., // optional
};

// Call the `logAuthEventRef()` function to get a reference to the mutation.
const ref = logAuthEventRef(logAuthEventVars);
// Variables can be defined inline as well.
const ref = logAuthEventRef({ sessionId: ..., userId: ..., eventType: ..., success: ..., errorMessage: ..., errorCode: ..., ipAddress: ..., userAgent: ..., requestPayload: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = logAuthEventRef(dataConnect, logAuthEventVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.authAuditLog_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.authAuditLog_insert);
});
```

## TrackRateLimit
You can execute the `TrackRateLimit` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
trackRateLimit(vars: TrackRateLimitVariables): MutationPromise<TrackRateLimitData, TrackRateLimitVariables>;

interface TrackRateLimitRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: TrackRateLimitVariables): MutationRef<TrackRateLimitData, TrackRateLimitVariables>;
}
export const trackRateLimitRef: TrackRateLimitRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
trackRateLimit(dc: DataConnect, vars: TrackRateLimitVariables): MutationPromise<TrackRateLimitData, TrackRateLimitVariables>;

interface TrackRateLimitRef {
  ...
  (dc: DataConnect, vars: TrackRateLimitVariables): MutationRef<TrackRateLimitData, TrackRateLimitVariables>;
}
export const trackRateLimitRef: TrackRateLimitRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the trackRateLimitRef:
```typescript
const name = trackRateLimitRef.operationName;
console.log(name);
```

### Variables
The `TrackRateLimit` mutation requires an argument of type `TrackRateLimitVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface TrackRateLimitVariables {
  identifier: string;
  actionType: string;
  attemptCount?: number | null;
  blockedUntil?: TimestampString | null;
}
```
### Return Type
Recall that executing the `TrackRateLimit` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `TrackRateLimitData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface TrackRateLimitData {
  rateLimitTracking_insert: RateLimitTracking_Key;
}
```
### Using `TrackRateLimit`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, trackRateLimit, TrackRateLimitVariables } from '@mybox/dataconnect';

// The `TrackRateLimit` mutation requires an argument of type `TrackRateLimitVariables`:
const trackRateLimitVars: TrackRateLimitVariables = {
  identifier: ..., 
  actionType: ..., 
  attemptCount: ..., // optional
  blockedUntil: ..., // optional
};

// Call the `trackRateLimit()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await trackRateLimit(trackRateLimitVars);
// Variables can be defined inline as well.
const { data } = await trackRateLimit({ identifier: ..., actionType: ..., attemptCount: ..., blockedUntil: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await trackRateLimit(dataConnect, trackRateLimitVars);

console.log(data.rateLimitTracking_insert);

// Or, you can use the `Promise` API.
trackRateLimit(trackRateLimitVars).then((response) => {
  const data = response.data;
  console.log(data.rateLimitTracking_insert);
});
```

### Using `TrackRateLimit`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, trackRateLimitRef, TrackRateLimitVariables } from '@mybox/dataconnect';

// The `TrackRateLimit` mutation requires an argument of type `TrackRateLimitVariables`:
const trackRateLimitVars: TrackRateLimitVariables = {
  identifier: ..., 
  actionType: ..., 
  attemptCount: ..., // optional
  blockedUntil: ..., // optional
};

// Call the `trackRateLimitRef()` function to get a reference to the mutation.
const ref = trackRateLimitRef(trackRateLimitVars);
// Variables can be defined inline as well.
const ref = trackRateLimitRef({ identifier: ..., actionType: ..., attemptCount: ..., blockedUntil: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = trackRateLimitRef(dataConnect, trackRateLimitVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.rateLimitTracking_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.rateLimitTracking_insert);
});
```

## UpdateRateLimit
You can execute the `UpdateRateLimit` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
updateRateLimit(vars: UpdateRateLimitVariables): MutationPromise<UpdateRateLimitData, UpdateRateLimitVariables>;

interface UpdateRateLimitRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateRateLimitVariables): MutationRef<UpdateRateLimitData, UpdateRateLimitVariables>;
}
export const updateRateLimitRef: UpdateRateLimitRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
updateRateLimit(dc: DataConnect, vars: UpdateRateLimitVariables): MutationPromise<UpdateRateLimitData, UpdateRateLimitVariables>;

interface UpdateRateLimitRef {
  ...
  (dc: DataConnect, vars: UpdateRateLimitVariables): MutationRef<UpdateRateLimitData, UpdateRateLimitVariables>;
}
export const updateRateLimitRef: UpdateRateLimitRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the updateRateLimitRef:
```typescript
const name = updateRateLimitRef.operationName;
console.log(name);
```

### Variables
The `UpdateRateLimit` mutation requires an argument of type `UpdateRateLimitVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UpdateRateLimitVariables {
  id: UUIDString;
  attemptCount: number;
  blockedUntil?: TimestampString | null;
}
```
### Return Type
Recall that executing the `UpdateRateLimit` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpdateRateLimitData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpdateRateLimitData {
  rateLimitTracking_update?: RateLimitTracking_Key | null;
}
```
### Using `UpdateRateLimit`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, updateRateLimit, UpdateRateLimitVariables } from '@mybox/dataconnect';

// The `UpdateRateLimit` mutation requires an argument of type `UpdateRateLimitVariables`:
const updateRateLimitVars: UpdateRateLimitVariables = {
  id: ..., 
  attemptCount: ..., 
  blockedUntil: ..., // optional
};

// Call the `updateRateLimit()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await updateRateLimit(updateRateLimitVars);
// Variables can be defined inline as well.
const { data } = await updateRateLimit({ id: ..., attemptCount: ..., blockedUntil: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await updateRateLimit(dataConnect, updateRateLimitVars);

console.log(data.rateLimitTracking_update);

// Or, you can use the `Promise` API.
updateRateLimit(updateRateLimitVars).then((response) => {
  const data = response.data;
  console.log(data.rateLimitTracking_update);
});
```

### Using `UpdateRateLimit`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, updateRateLimitRef, UpdateRateLimitVariables } from '@mybox/dataconnect';

// The `UpdateRateLimit` mutation requires an argument of type `UpdateRateLimitVariables`:
const updateRateLimitVars: UpdateRateLimitVariables = {
  id: ..., 
  attemptCount: ..., 
  blockedUntil: ..., // optional
};

// Call the `updateRateLimitRef()` function to get a reference to the mutation.
const ref = updateRateLimitRef(updateRateLimitVars);
// Variables can be defined inline as well.
const ref = updateRateLimitRef({ id: ..., attemptCount: ..., blockedUntil: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = updateRateLimitRef(dataConnect, updateRateLimitVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.rateLimitTracking_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.rateLimitTracking_update);
});
```

## DeleteExpiredSessions
You can execute the `DeleteExpiredSessions` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
deleteExpiredSessions(vars: DeleteExpiredSessionsVariables): MutationPromise<DeleteExpiredSessionsData, DeleteExpiredSessionsVariables>;

interface DeleteExpiredSessionsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteExpiredSessionsVariables): MutationRef<DeleteExpiredSessionsData, DeleteExpiredSessionsVariables>;
}
export const deleteExpiredSessionsRef: DeleteExpiredSessionsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
deleteExpiredSessions(dc: DataConnect, vars: DeleteExpiredSessionsVariables): MutationPromise<DeleteExpiredSessionsData, DeleteExpiredSessionsVariables>;

interface DeleteExpiredSessionsRef {
  ...
  (dc: DataConnect, vars: DeleteExpiredSessionsVariables): MutationRef<DeleteExpiredSessionsData, DeleteExpiredSessionsVariables>;
}
export const deleteExpiredSessionsRef: DeleteExpiredSessionsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the deleteExpiredSessionsRef:
```typescript
const name = deleteExpiredSessionsRef.operationName;
console.log(name);
```

### Variables
The `DeleteExpiredSessions` mutation requires an argument of type `DeleteExpiredSessionsVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface DeleteExpiredSessionsVariables {
  currentTime: TimestampString;
}
```
### Return Type
Recall that executing the `DeleteExpiredSessions` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `DeleteExpiredSessionsData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface DeleteExpiredSessionsData {
  authSession_deleteMany: number;
}
```
### Using `DeleteExpiredSessions`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, deleteExpiredSessions, DeleteExpiredSessionsVariables } from '@mybox/dataconnect';

// The `DeleteExpiredSessions` mutation requires an argument of type `DeleteExpiredSessionsVariables`:
const deleteExpiredSessionsVars: DeleteExpiredSessionsVariables = {
  currentTime: ..., 
};

// Call the `deleteExpiredSessions()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await deleteExpiredSessions(deleteExpiredSessionsVars);
// Variables can be defined inline as well.
const { data } = await deleteExpiredSessions({ currentTime: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await deleteExpiredSessions(dataConnect, deleteExpiredSessionsVars);

console.log(data.authSession_deleteMany);

// Or, you can use the `Promise` API.
deleteExpiredSessions(deleteExpiredSessionsVars).then((response) => {
  const data = response.data;
  console.log(data.authSession_deleteMany);
});
```

### Using `DeleteExpiredSessions`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, deleteExpiredSessionsRef, DeleteExpiredSessionsVariables } from '@mybox/dataconnect';

// The `DeleteExpiredSessions` mutation requires an argument of type `DeleteExpiredSessionsVariables`:
const deleteExpiredSessionsVars: DeleteExpiredSessionsVariables = {
  currentTime: ..., 
};

// Call the `deleteExpiredSessionsRef()` function to get a reference to the mutation.
const ref = deleteExpiredSessionsRef(deleteExpiredSessionsVars);
// Variables can be defined inline as well.
const ref = deleteExpiredSessionsRef({ currentTime: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = deleteExpiredSessionsRef(dataConnect, deleteExpiredSessionsVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.authSession_deleteMany);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.authSession_deleteMany);
});
```

## DeleteExpiredVerificationCodes
You can execute the `DeleteExpiredVerificationCodes` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
deleteExpiredVerificationCodes(vars: DeleteExpiredVerificationCodesVariables): MutationPromise<DeleteExpiredVerificationCodesData, DeleteExpiredVerificationCodesVariables>;

interface DeleteExpiredVerificationCodesRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteExpiredVerificationCodesVariables): MutationRef<DeleteExpiredVerificationCodesData, DeleteExpiredVerificationCodesVariables>;
}
export const deleteExpiredVerificationCodesRef: DeleteExpiredVerificationCodesRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
deleteExpiredVerificationCodes(dc: DataConnect, vars: DeleteExpiredVerificationCodesVariables): MutationPromise<DeleteExpiredVerificationCodesData, DeleteExpiredVerificationCodesVariables>;

interface DeleteExpiredVerificationCodesRef {
  ...
  (dc: DataConnect, vars: DeleteExpiredVerificationCodesVariables): MutationRef<DeleteExpiredVerificationCodesData, DeleteExpiredVerificationCodesVariables>;
}
export const deleteExpiredVerificationCodesRef: DeleteExpiredVerificationCodesRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the deleteExpiredVerificationCodesRef:
```typescript
const name = deleteExpiredVerificationCodesRef.operationName;
console.log(name);
```

### Variables
The `DeleteExpiredVerificationCodes` mutation requires an argument of type `DeleteExpiredVerificationCodesVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface DeleteExpiredVerificationCodesVariables {
  currentTime: TimestampString;
}
```
### Return Type
Recall that executing the `DeleteExpiredVerificationCodes` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `DeleteExpiredVerificationCodesData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface DeleteExpiredVerificationCodesData {
  verificationCode_deleteMany: number;
}
```
### Using `DeleteExpiredVerificationCodes`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, deleteExpiredVerificationCodes, DeleteExpiredVerificationCodesVariables } from '@mybox/dataconnect';

// The `DeleteExpiredVerificationCodes` mutation requires an argument of type `DeleteExpiredVerificationCodesVariables`:
const deleteExpiredVerificationCodesVars: DeleteExpiredVerificationCodesVariables = {
  currentTime: ..., 
};

// Call the `deleteExpiredVerificationCodes()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await deleteExpiredVerificationCodes(deleteExpiredVerificationCodesVars);
// Variables can be defined inline as well.
const { data } = await deleteExpiredVerificationCodes({ currentTime: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await deleteExpiredVerificationCodes(dataConnect, deleteExpiredVerificationCodesVars);

console.log(data.verificationCode_deleteMany);

// Or, you can use the `Promise` API.
deleteExpiredVerificationCodes(deleteExpiredVerificationCodesVars).then((response) => {
  const data = response.data;
  console.log(data.verificationCode_deleteMany);
});
```

### Using `DeleteExpiredVerificationCodes`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, deleteExpiredVerificationCodesRef, DeleteExpiredVerificationCodesVariables } from '@mybox/dataconnect';

// The `DeleteExpiredVerificationCodes` mutation requires an argument of type `DeleteExpiredVerificationCodesVariables`:
const deleteExpiredVerificationCodesVars: DeleteExpiredVerificationCodesVariables = {
  currentTime: ..., 
};

// Call the `deleteExpiredVerificationCodesRef()` function to get a reference to the mutation.
const ref = deleteExpiredVerificationCodesRef(deleteExpiredVerificationCodesVars);
// Variables can be defined inline as well.
const ref = deleteExpiredVerificationCodesRef({ currentTime: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = deleteExpiredVerificationCodesRef(dataConnect, deleteExpiredVerificationCodesVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.verificationCode_deleteMany);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.verificationCode_deleteMany);
});
```

