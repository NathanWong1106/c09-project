# OURCODE - Team CharSiuBao

## Team Members
| Name | Email|
|----------|----------|
| Eric Fan | ericcw.fan@mail.utoronto.ca |
| Nathan Wong | nathanml.wong@mail.utoronto.ca |
| Arwin Fong | arwin.fong@mail.utoronto.ca |

## Description
OURCode is a co-operative online code editor for groups of developers to code together simultaneously. A user can create files and invite other users to connect and collaborate on the files. Users will also be able to create in-line code suggestions that collaborators can comment and vote on in addition to a workspace shared whiteboard for collaborative design. Users can also opt in to use Discord server notifications when suggestions are posted by providing a Discord webhook url.

## Required Elements
- **The application must use a modern frontend framework such as Angular, or Vue 3**
    - We will be using Next.js as our frontend framework
- **The application must use Express as the core backend API**
    - We will use an express backend and a PostgreSQL db with Prisma ORM hosted on Neon Serverless Postgres
- **The application's API is RESTful where appropriate**
    - We will follow the REST API standard for the endpoints
- **The application must be deployed on a Virtual Machine using Docker and Docker Compose**
    - The application will be deployed using GCP from a Docker image built from Docker Compose
    - All deployment files will be committed to GitHub including CI files for building images
- **The application must be accessible to the general public without extra steps. i.e. A person does not need to talk to your team to access the full application.**
    - The website will be publicly available from a GCP hosted URL
- **The application must interact with at least one third-party API.**
    - liveblocks Collaborative Whiteboard - We will use this API to render a whiteboard within the workspace
    - Interacting with the Discord API through Discord webhooks
        - Send server notifications upon a suggestion approval or rejection
    - We will be connecting our application to a Serverless Postgres database called Neon
- **The application must use OAuth 2.0 (an authorization mechanism) for any purpose.**
    - Users will be able to sign in using the Google OAuth services

## Additional Requirements
- **A piece of the application must interact with a webhook by an external service**
    - We will be using Discord webhooks to send server notifications when a suggestion is approved or rejected
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

## Beta Version Milestone
- Implement yjs sync for files in a workspace
    - Users should have the ability to edit the file simultaneously
    - File changes should persist on the db
- Implement suggestions and comment system
    - Comments should persist on db
- Deployment using GCP
    - CI files for Github Actions

## Final Version Milestone
- Implement whiteboard shared by users in a workspace
- Implement fuzzy search for searching through a user’s workspace
- Discord webhook integration for suggestion creation and deletion
- Catch-all for bug-fixes and QOL improvements



