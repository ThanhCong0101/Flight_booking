# Awesome Project Build with TypeORM

Steps to run this project:

1. Run `npm i` command
2. Setup database settings inside `data-source.ts` file
3. Run `npm start` command

# The way to name the branch

The Two Categories of Git branches:

1. **Regular Branches**
- **main**: The main branch is the default branch available in the Git repository
- **dev**: this is the main development branch
- **test**: automation testing of the implemented changes
2. **Temporary Branches**
- **`chore`**: This branch is used to perform small changes that don't require a new release.
-  **`fix-#{bug.number}`**: This usually fixes something that broke and doesnt require an entire rewrite of the code base.
- **`wip-{feature.name}`**: Developers mostly work on several issues at a given time, and an issue tracker helps to connect the working branch with relevant tasks
- **`bug-#{bug.number}`**: A bug or an error that needs fixing promptly. Using an external issue tracking ID in the branch name can facilitate tracking the progress from external systems.
- **`feat-name`**: A new feature to be implemented. This is usually something to merge into test as it is added. It will be buggy and require testing from various devices and users before it can be pushed into production.