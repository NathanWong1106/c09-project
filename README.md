# OURCODE - Team CharSiuBao

## Team Members
| Name | Email|
|----------|----------|
| Eric Fan | ericcw.fan@mail.utoronto.ca |
| Nathan Wong | nathanml.wong@mail.utoronto.ca |
| Arwin Fong | arwin.fong@mail.utoronto.ca |

## Description
OURCode is a co-operative online code editor for groups of developers to code together simultaneously. A user can create files and invite other users to connect and collaborate on the files. Users will also be able to create in-line code suggestions that collaborators can comment and vote on in addition to a workspace shared whiteboard for collaborative design. Users can execute Python code through Judge0 when they have a Python file opened.

## Required Elements
- **The application must use a modern frontend framework such as Angular, or Vue 3**
    - We will be using Next.js as our frontend framework
- **The application must use Express as the core backend API**
    - We will use an express backend and a docker PostgreSQL db with Prisma ORM
- **The application's API is RESTful where appropriate**
    - We will follow the REST API standard for the endpoints
- **The application must be deployed on a Virtual Machine using Docker and Docker Compose**
    - The application will be deployed using GCP from a Docker image built from Docker Compose
    - All deployment files will be committed to GitHub including CI files for building images
- **The application must be accessible to the general public without extra steps. i.e. A person does not need to talk to your team to access the full application.**
    - The website will be publicly available from a GCP hosted URL
- **The application must interact with at least one third-party API.**
    - liveblocks Collaborative Whiteboard - We will use this API to render a whiteboard within the workspace
        - Send server notifications upon a suggestion approval or rejection
    - we will use the Judge0 api to execute code 
- **The application must use OAuth 2.0 (an authorization mechanism) for any purpose.**
    - Users will be able to sign in using the Google OAuth services

## Additional Requirements
- **A piece of the application must interact with a webhook by an external service**
    - We will be using Judge0 webhooks to get the result of a code submission by a user
- **A piece of the application is “real-time”, which means it can reflect other user changes without refreshing**
    - Users will be able to share a code editor when opening a file which will be updated with users’ changes in real time
    - Users will be able to share a whiteboard (liveblock) that will be updated in real time

## Alpha Version Milestone
- Implement login/logout
    - Google OAuth authentication
- Implement basic browser for workspaces
    - Basic search (not fuzzy)
    - Create, delete, and share workspaces
- Implement rudimentary file system to browse, create, and delete files in a workspace
    - This file system will be structured like google drive (folders and files) 
    - Tentative Postgres Schema:
        - Folder
            - PK Id
            - Name
        - FolderContent (relation)
            - FK Folder Id
            - Relation type (0 - file, 1 - folder)
            - FK Folder/File Id
        - File
            - PK Id
            - Name
            - Content (yjs encodeStateAsUpdate)

## Beta Version Milestone
- Implement yjs sync for files in a workspace
    - Users should have the ability to edit the file simultaneously
    - File changes should persist on the db
- Implement suggestions and comment system
    - Comments should persist on db
- Deployment using GCP`
    - CI files for Github Actions
- Implement Judge0 code submissions (Python execution only)

## Final Version Milestone
- Implement whiteboard shared by users in a workspace
- Implement fuzzy search for searching through a user’s workspace
- Catch-all for bug-fixes and QOL improvements



