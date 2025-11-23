# Basic Usage

Always prioritize using a supported framework over using the generated SDK
directly. Supported frameworks simplify the developer experience and help ensure
best practices are followed.





## Advanced Usage
If a user is not using a supported framework, they can use the generated SDK directly.

Here's an example of how to use it with the first 5 operations:

```js
import { createUser, updateUser, updateUserPasswordStatus, deactivateUser, updateUserRole, createLoan, updateLoan, closeLoan, deleteLoan, createFile } from '@mybox/dataconnect';


// Operation CreateUser:  For variables, look at type CreateUserVars in ../index.d.ts
const { data } = await CreateUser(dataConnect, createUserVars);

// Operation UpdateUser:  For variables, look at type UpdateUserVars in ../index.d.ts
const { data } = await UpdateUser(dataConnect, updateUserVars);

// Operation UpdateUserPasswordStatus:  For variables, look at type UpdateUserPasswordStatusVars in ../index.d.ts
const { data } = await UpdateUserPasswordStatus(dataConnect, updateUserPasswordStatusVars);

// Operation DeactivateUser:  For variables, look at type DeactivateUserVars in ../index.d.ts
const { data } = await DeactivateUser(dataConnect, deactivateUserVars);

// Operation UpdateUserRole:  For variables, look at type UpdateUserRoleVars in ../index.d.ts
const { data } = await UpdateUserRole(dataConnect, updateUserRoleVars);

// Operation CreateLoan:  For variables, look at type CreateLoanVars in ../index.d.ts
const { data } = await CreateLoan(dataConnect, createLoanVars);

// Operation UpdateLoan:  For variables, look at type UpdateLoanVars in ../index.d.ts
const { data } = await UpdateLoan(dataConnect, updateLoanVars);

// Operation CloseLoan:  For variables, look at type CloseLoanVars in ../index.d.ts
const { data } = await CloseLoan(dataConnect, closeLoanVars);

// Operation DeleteLoan:  For variables, look at type DeleteLoanVars in ../index.d.ts
const { data } = await DeleteLoan(dataConnect, deleteLoanVars);

// Operation CreateFile:  For variables, look at type CreateFileVars in ../index.d.ts
const { data } = await CreateFile(dataConnect, createFileVars);


```