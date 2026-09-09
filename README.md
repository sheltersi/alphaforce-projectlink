# AlphaForce ProjectLink

> **Connect. Participate. Make an Impact.**

AlphaForce ProjectLink is a multi-organisation project participation platform that connects participants with organisations and their projects.

Participants create a professional online profile, discover available projects, submit applications, and—when accepted—participate in projects and record their work through timesheets.

Organisations can create and manage projects, review participant applications, select participants, manage project teams, approve timesheets, and monitor project activity.

---

## Table of Contents

* [Overview](#overview)
* [Objectives](#objectives)
* [Core Concept](#core-concept)
* [User Roles](#user-roles)
* [Application Flow](#application-flow)
* [Features](#features)
* [System Architecture](#system-architecture)
* [Database Design](#database-design)
* [Core Entities](#core-entities)
* [Project Lifecycle](#project-lifecycle)
* [Application Lifecycle](#application-lifecycle)
* [Participant Lifecycle](#participant-lifecycle)
* [Organisation Data Isolation](#organisation-data-isolation)
* [Main Application Pages](#main-application-pages)
* [Participant Features](#participant-features)
* [Project Manager Features](#project-manager-features)
* [Technical Admin Features](#technical-admin-features)
* [Location Management](#location-management)
* [Notifications](#notifications)
* [Audit Logging](#audit-logging)
* [Security](#security)
* [Technology Stack](#technology-stack)
* [Development Phases](#development-phases)
* [Future Features](#future-features)
* [Installation](#installation)
* [Environment Configuration](#environment-configuration)
* [Database Setup](#database-setup)
* [Running the Application](#running-the-application)
* [Testing](#testing)
* [Git Workflow](#git-workflow)
* [Project Principles](#project-principles)

---

# Overview

AlphaForce ProjectLink is designed to provide a central platform where organisations can manage projects and connect them with suitable participants.

The platform supports multiple organisations, with each organisation managing its own projects, project managers, applications, participants, and project-related data.

Participants maintain a reusable professional profile that can be used when applying for multiple projects.

The system separates:

1. **Participant Profile**
2. **Project Application**
3. **Project Membership**

This separation is a core architectural principle of the application.

---

# Objectives

The main objectives of AlphaForce ProjectLink are to:

* Allow participants to create professional profiles.
* Allow participants to discover available projects.
* Allow participants to apply for projects.
* Allow organisations to create and manage projects.
* Allow project managers to review applications.
* Allow project managers to accept or reject participants.
* Manage accepted project participants.
* Allow participants to record project work through timesheets.
* Allow project managers to review and approve timesheets.
* Support multiple organisations.
* Keep organisation data isolated.
* Provide reporting and project oversight.
* Provide a foundation for future participant/project matching.

---

# Core Concept

The most important relationship in the system is:

```text
User
  ↓
Participant Profile
  ↓
Discovers Project
  ↓
Project Application
  ↓
Application Reviewed
  ↓
Accepted
  ↓
Project Participant
  ↓
Timesheets
  ↓
Project Completion
```

A participant's profile represents **who they are**.

An application represents:

> "I want to participate in this project."

A project membership represents:

> "I have been accepted and am participating in this project."

These concepts must remain separate.

---

# User Roles

The initial platform contains three primary roles.

## 1. Participant

Participants can:

* Register
* Verify their email
* Build their professional profile
* Add education
* Add work experience
* Add skills
* Add certifications
* Upload documents
* Discover projects
* Apply for projects
* Track applications
* View accepted projects
* Participate in projects
* Submit timesheets
* View notifications
* Manage account settings

---

## 2. Project Manager

Project Managers belong to an organisation and can manage projects assigned to them.

They can:

* View organisation projects
* Create projects
* Edit projects
* Publish projects
* Open/close applications
* Review applications
* View participant profiles
* Accept participants
* Reject participants
* Manage project participants
* Review timesheets
* Approve/reject timesheets
* View project reports
* Manage project documents
* Monitor project progress

---

## 3. Technical Admin

The Technical Admin manages the platform itself.

They can:

* Manage organisations
* Manage users
* Manage roles and permissions
* View platform activity
* View audit logs
* Manage system settings
* Manage platform-level configuration
* View global reports
* Manage platform notifications
* Monitor overall system usage

Technical Admin functionality is platform-level and should not automatically give an admin unrestricted organisation-level access unless explicitly designed that way.

---

# Application Flow

## Participant Flow

```text
Register
   ↓
Email Verification
   ↓
Welcome / Onboarding
   ↓
Build Profile
   ↓
Profile Preview
   ↓
Participant Dashboard
   ↓
Discover Projects
   ↓
Project Details
   ↓
Apply
   ↓
Application Tracking
   ↓
Accepted?
   ├── No → Continue Discovering Projects
   │
   └── Yes
        ↓
   Project Workspace
        ↓
   Participate
        ↓
   Submit Timesheets
        ↓
   Project Completion
```

---

# Participant Onboarding

After registration and email verification, the participant should not immediately be dropped into a complex dashboard.

The recommended flow is:

```text
Registration
    ↓
Email Verification
    ↓
Welcome
    ↓
Build Profile
    ↓
Profile Preview
    ↓
Dashboard
```

The Welcome screen introduces the platform and explains that the participant should create their professional profile.

The profile-building process creates the information that project managers will later review.

---

# Features

## Authentication

* Registration
* Login
* Logout
* Email verification
* Password reset
* Password change
* Session management
* Account status

---

# Participant Profile

Participants maintain a professional profile similar to an online CV.

## Personal Information

* Profile photo
* First name
* Last name
* Email
* Phone
* Location
* Country

## Professional Information

* Professional summary
* Skills
* Education
* Work experience
* Certifications
* Documents

## Profile Completion

The platform calculates a profile completion percentage.

Example:

```text
Profile Completion

████████████████░░░░ 80%
```

Participants should be able to identify incomplete sections and return to them later.

---

# Skills

Skills should be stored independently so that they can be reused across participants and projects.

Example:

```text
PHP
Laravel
Vue.js
React
Project Management
Data Analysis
Research
Communication
Leadership
```

Skills can eventually be used for project matching.

---

# Projects

Each organisation can create multiple projects.

A project contains information such as:

* Name
* Description
* Objectives
* Category
* Location
* Project type
* Start date
* End date
* Application opening date
* Application closing date
* Participant limit
* Required skills
* Status
* Project manager

---

# Project Discovery

Participants should be able to discover projects through:

* Search
* Project category
* Location
* Project type
* Required skills
* Application status
* Start date
* End date
* Organisation
* Remote/on-site options

Example:

```text
Search Projects

[ Search by project name or skill ]

Filters:
[ Category ]
[ Location ]
[ Project Type ]
[ Skills ]
[ Date ]
```

---

# Project Details

The project details page should display:

* Project name
* Organisation
* Project manager
* Description
* Objectives
* Required skills
* Location
* Project type
* Start date
* End date
* Application deadline
* Number of available positions
* Requirements

The participant should have a clear:

**Apply Now**

CTA.

---

# Project Applications

Applications belong to a specific participant and project.

A participant can apply to many projects.

Example:

```text
Participant
   │
   ├── Application → Project A → Rejected
   ├── Application → Project B → Accepted
   ├── Application → Project C → Under Review
   └── Application → Project D → Withdrawn
```

## Application Statuses

```text
draft
submitted
under_review
accepted
rejected
withdrawn
```

The same participant must not be able to submit duplicate applications to the same project.

---

# Project Membership

When an application is accepted, the participant becomes a project participant.

```text
Project Application
        │
        │ accepted
        ▼
Project Participant
```

Project membership is separate from the application.

A participant can therefore:

* Apply to many projects
* Be rejected from some
* Be under review for others
* Participate in several accepted projects

---

# Timesheets

Accepted project participants can record their project work.

A timesheet can contain multiple entries.

Example:

```text
Timesheet
    │
    ├── 01 Sep → 8 hours → Project research
    ├── 02 Sep → 7 hours → Team meeting
    └── 03 Sep → 8 hours → Field work
```

## Timesheet Statuses

```text
draft
submitted
approved
rejected
```

Project managers can review and approve/reject submitted timesheets.

---

# Database Design

The initial database consists of the following core entities:

```text
users
organisations
organisation_users

participant_profiles
educations
work_experiences
skills
participant_skills
certifications
documents

projects
project_skills
project_managers

project_applications
project_participants

timesheets
timesheet_entries

notifications
audit_logs

countries
provinces
cities
locations
```

---

# Core Entity Relationships

```text
USERS
 │
 ├── PARTICIPANT_PROFILE
 │       │
 │       ├── EDUCATIONS
 │       ├── WORK_EXPERIENCES
 │       ├── CERTIFICATIONS
 │       ├── PARTICIPANT_SKILLS
 │       └── DOCUMENTS
 │
 ├── ORGANISATION_USERS
 │       │
 │       └── ORGANISATIONS
 │                │
 │                └── PROJECTS
 │                       │
 │                       ├── PROJECT_SKILLS
 │                       ├── PROJECT_MANAGERS
 │                       ├── PROJECT_APPLICATIONS
 │                       │
 │                       └── PROJECT_PARTICIPANTS
 │                                │
 │                                └── TIMESHEETS
 │                                         │
 │                                         └── TIMESHEET_ENTRIES
 │
 └── NOTIFICATIONS
```

---

# Database Tables

## users

Central authentication and account table.

```text
id
name
email
password
email_verified_at
status
last_login_at
created_at
updated_at
```

---

## organisations

Stores organisations using the platform.

```text
id
name
slug
description
logo
email
phone
website
status
created_at
updated_at
```

---

## organisation_users

Connects users to organisations.

```text
id
organisation_id
user_id
role
status
joined_at
created_at
updated_at
```

This allows a user to potentially belong to multiple organisations.

---

## participant_profiles

Stores professional participant information.

```text
id
user_id
profile_photo
professional_summary
phone
location_id
profile_completion
status
created_at
updated_at
```

---

## educations

```text
id
participant_profile_id
institution
qualification
field_of_study
start_year
end_year
description
created_at
updated_at
```

---

## work_experiences

```text
id
participant_profile_id
job_title
organisation_name
location
start_date
end_date
is_current
description
created_at
updated_at
```

---

## skills

```text
id
name
slug
created_at
updated_at
```

---

## participant_skills

```text
id
participant_profile_id
skill_id
created_at
```

---

## certifications

```text
id
participant_profile_id
name
issuing_organisation
issue_date
expiry_date
credential_number
created_at
updated_at
```

---

## documents

Stores document metadata while actual files are stored in application storage.

```text
id
user_id
documentable_type
documentable_id
name
file_path
file_name
mime_type
file_size
document_type
created_at
updated_at
```

---

## projects

```text
id
organisation_id
created_by
name
slug
description
objectives
category
location_id
project_type
start_date
end_date
application_open_at
application_close_at
participant_limit
status
created_at
updated_at
```

---

## project_skills

```text
id
project_id
skill_id
is_required
created_at
updated_at
```

---

## project_managers

Used when a project can have multiple managers.

```text
id
project_id
user_id
created_at
updated_at
```

---

## project_applications

```text
id
project_id
user_id
status
cover_message
availability
additional_information
applied_at
reviewed_at
reviewed_by
rejection_reason
created_at
updated_at
```

A unique constraint should exist on:

```text
project_id + user_id
```

---

## project_participants

```text
id
project_id
user_id
application_id
status
role
joined_at
left_at
created_at
updated_at
```

A unique constraint should exist on:

```text
project_id + user_id
```

---

## timesheets

```text
id
project_participant_id
period_start
period_end
status
submitted_at
approved_at
approved_by
rejection_reason
created_at
updated_at
```

---

## timesheet_entries

```text
id
timesheet_id
work_date
hours
description
created_at
updated_at
```

---

# Location Management

Locations should be normalized rather than storing arbitrary location text everywhere.

Recommended structure:

```text
countries
    │
    └── provinces
            │
            └── cities
                    │
                    └── locations
```

## countries

```text
id
name
code
created_at
updated_at
```

## provinces

```text
id
country_id
name
created_at
updated_at
```

## cities

```text
id
province_id
name
created_at
updated_at
```

## locations

```text
id
city_id
name
address
postal_code
latitude
longitude
created_at
updated_at
```

This allows the application to support future location-based project searching.

---

# Project Lifecycle

Projects follow a controlled lifecycle.

```text
DRAFT
  ↓
PUBLISHED
  ↓
APPLICATIONS OPEN
  ↓
APPLICATIONS CLOSED
  ↓
IN PROGRESS
  ↓
COMPLETED
  ↓
ARCHIVED
```

The application should enforce valid transitions.

For example, a project should not move directly from `DRAFT` to `COMPLETED`.

---

# Application Lifecycle

```text
DRAFT
  ↓
SUBMITTED
  ↓
UNDER REVIEW
  ├── ACCEPTED
  │      ↓
  │   PROJECT PARTICIPANT
  │
  └── REJECTED
```

Participants may also withdraw applications where appropriate.

---

# Participant Lifecycle

```text
REGISTERED
    ↓
EMAIL VERIFIED
    ↓
ONBOARDING
    ↓
PROFILE CREATED
    ↓
PROFILE COMPLETED
    ↓
ACTIVE
    ↓
PROJECT PARTICIPATION
    ↓
PROJECT COMPLETION
```

---

# Organisation Data Isolation

AlphaForce ProjectLink is a multi-organisation platform.

Organisation data must be isolated.

For example:

```text
Organisation A
    ├── Project A1
    ├── Project A2
    └── Applications

Organisation B
    ├── Project B1
    ├── Project B2
    └── Applications
```

A Project Manager from Organisation A must not be able to access Organisation B's private project information.

Every organisation-owned resource should have a clear relationship back to its organisation.

The application should enforce organisation authorization at the backend level, not only hide information in the frontend.

---

# Main Application Pages

## Public

```text
/
 /projects
 /projects/{project}
 /login
 /register
 /forgot-password
```

---

# Participant Pages

```text
/dashboard

/profile
/profile/personal
/profile/skills
/profile/education
/profile/experience
/profile/certifications
/profile/documents
/profile/preview

/projects
/projects/{project}

/applications
/applications/{application}

/my-projects
/my-projects/{project}

/my-projects/{project}/team
/my-projects/{project}/timesheets

/notifications
/settings
```

---

# Project Manager Pages

```text
/manager/dashboard

/manager/projects
/manager/projects/create
/manager/projects/{project}
/manager/projects/{project}/edit

/manager/projects/{project}/applications
/manager/projects/{project}/participants
/manager/projects/{project}/timesheets
/manager/projects/{project}/reports
```

---

# Technical Admin Pages

```text
/admin/dashboard

/admin/organisations
/admin/organisations/{organisation}

/admin/users
/admin/users/{user}

/admin/roles
/admin/permissions

/admin/audit-logs
/admin/reports
/admin/settings
```

---

# Participant Dashboard

The participant dashboard should provide an overview of their activity.

Possible widgets:

```text
Profile Completion
     85%

Applications
     12

Under Review
      4

Accepted Projects
      2

Pending Timesheets
      1
```

It should also show:

* Recommended projects
* Recent applications
* Upcoming project activities
* Notifications
* Profile completion reminders

---

# Project Manager Dashboard

The Project Manager dashboard should provide organisation/project-level oversight.

Example:

```text
Active Projects       8
Open Applications    42
Active Participants  96
Pending Timesheets   13
```

Additional sections:

* Recent applications
* Upcoming project deadlines
* Projects requiring attention
* Pending timesheet approvals
* Recent participant activity

---

# Notifications

Notifications should be generated for important events.

Examples:

### Participant

```text
Your application has been submitted.

Your application has been accepted.

Your application has been rejected.

Your timesheet has been approved.

Your timesheet requires changes.
```

### Project Manager

```text
A new participant has applied to your project.

A participant has submitted a timesheet.

A project application deadline is approaching.
```

---

# Audit Logging

Important system actions should be recorded.

Examples:

```text
Project created
Project updated
Project published
Application submitted
Application accepted
Application rejected
Participant added
Participant removed
Timesheet submitted
Timesheet approved
Timesheet rejected
User role changed
Organisation created
```

Audit records should contain:

```text
user
organisation
action
affected model
old values
new values
IP address
timestamp
```

---

# Security

The application should follow secure-by-default principles.

## Authentication

* Password hashing
* Email verification
* Password reset
* Session protection
* Rate limiting
* Authentication middleware

## Authorization

Use backend authorization policies.

Examples:

```text
ParticipantPolicy
ProjectPolicy
ApplicationPolicy
TimesheetPolicy
OrganisationPolicy
```

Never rely solely on frontend route protection.

---

# Multi-Tenant Security

Organisation ownership should be checked whenever organisation-owned resources are accessed.

For example:

```text
Project
   ↓
Organisation
   ↓
Current User
```

A user should only access the project if they have the required relationship/permission within that organisation.

---

# File Security

Uploaded participant documents may contain private information.

Files should:

* Not be publicly accessible by default.
* Be stored using secure storage.
* Be validated by MIME type and file size.
* Have controlled download authorization.
* Be accessible only to authorized users.

---

# Technology Stack

The recommended stack for AlphaForce ProjectLink is:

## Backend

* PHP
* Laravel
* Laravel Eloquent ORM
* Laravel Authentication
* Laravel Notifications
* Laravel Policies / Gates

## Frontend

* Vue.js
* Nuxt where appropriate
* Tailwind CSS
* JavaScript / TypeScript as the project evolves

## Database

* MySQL

## Development

* Composer
* NPM
* Vite
* Git
* GitHub

---

# Development Architecture

The application should maintain a clear separation between:

```text
Presentation
     ↓
Application Logic
     ↓
Domain / Business Rules
     ↓
Data Access
     ↓
Database
```

Business rules should not be implemented only inside Vue components.

For example:

> "A participant can only apply while applications are open."

This rule must also be enforced by the Laravel backend.

---

# Development Phases

## Phase 1 — Project Foundation

* Laravel setup
* Frontend setup
* Authentication
* Database connection
* Base layout
* Design system
* Navigation

---

## Phase 2 — Participant Onboarding

* Registration
* Email verification
* Welcome screen
* Profile creation
* Profile completion
* Profile preview

---

## Phase 3 — Organisations

* Organisation creation
* Organisation users
* Roles
* Organisation settings
* Organisation authorization

---

## Phase 4 — Projects

* Project CRUD
* Project lifecycle
* Project skills
* Locations
* Project managers
* Project publishing

---

## Phase 5 — Applications

* Project discovery
* Project details
* Apply
* Application tracking
* Application review
* Accept/reject functionality

---

## Phase 6 — Project Participation

* Project workspace
* Project team
* Participant management
* Project activity
* Project documents

---

## Phase 7 — Timesheets

* Create timesheets
* Add entries
* Submit timesheets
* Manager approval
* Rejection/comments
* Timesheet reporting

---

## Phase 8 — Notifications

* In-app notifications
* Application notifications
* Project notifications
* Timesheet notifications

---

## Phase 9 — Reporting

Participant reports:

* Applications
* Projects
* Hours

Organisation reports:

* Projects
* Participants
* Applications
* Acceptance rates
* Hours
* Project performance

Platform reports:

* Organisations
* Users
* Projects
* Participation
* Platform activity

---

## Phase 10 — Administration

* Technical Admin dashboard
* Organisation management
* User management
* Roles and permissions
* Audit logs
* System settings

---

# Future Features

The architecture should leave room for future features.

Potential future functionality includes:

## Project Matching

Match participants with projects based on:

* Skills
* Location
* Experience
* Education
* Availability
* Project requirements

Example:

```text
Participant Skills
        +
Project Requirements
        ↓
Matching Score
        ↓
Recommended Projects
```

---

## Participant Ratings / Evaluations

After project completion:

```text
Project Manager
       ↓
Participant Evaluation
```

Potential metrics:

* Performance
* Communication
* Reliability
* Technical ability
* Teamwork

---

## Certificates

Participants could receive certificates after successfully completing projects.

---

## Attendance

Projects may eventually track:

* Attendance
* Check-in
* Check-out
* Events
* Sessions

---

## Project Documents

Projects may have:

* Briefs
* Guidelines
* Reports
* Templates
* Supporting documents

---

## Project Announcements

Project managers could send announcements to project participants.

---

## Advanced Reporting

Future reports could include:

* Participant engagement
* Project success rates
* Total hours
* Organisation performance
* Skill demand
* Participant participation history

---

# Installation

Clone the repository:

```bash
git clone <repository-url>
cd alphaforce-projectlink
```

Install PHP dependencies:

```bash
composer install
```

Install frontend dependencies:

```bash
npm install
```

Create the environment file:

```bash
cp .env.example .env
```

Generate the application key:

```bash
php artisan key:generate
```

---

# Environment Configuration

Configure the `.env` file.

Example:

```env
APP_NAME="AlphaForce ProjectLink"
APP_ENV=local
APP_KEY=
APP_DEBUG=true
APP_URL=http://localhost

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=alphaforce_projectlink
DB_USERNAME=root
DB_PASSWORD=
```

Configure additional services such as:

* Mail
* File storage
* Queue
* Redis
* Notifications

according to the deployment environment.

---

# Database Setup

Create the database:

```sql
CREATE DATABASE alphaforce_projectlink;
```

Run migrations:

```bash
php artisan migrate
```

Run seeders where applicable:

```bash
php artisan db:seed
```

For a complete fresh installation:

```bash
php artisan migrate:fresh --seed
```

**Do not run `migrate:fresh` in production**, as it deletes existing tables and data.

---

# Running the Application

Start the Laravel development server:

```bash
php artisan serve
```

Start the frontend development server:

```bash
npm run dev
```

Then open the application using the configured local URL.

---

# Testing

Run Laravel tests:

```bash
php artisan test
```

For a specific test:

```bash
php artisan test --filter=ProjectTest
```

Frontend tests should be added as the frontend functionality grows.

---

# Code Quality

Before creating a pull request:

```bash
php artisan test
```

and ensure frontend assets compile successfully:

```bash
npm run build
```

The project should maintain:

* Consistent naming
* Small reusable components
* Clear business logic
* Proper validation
* Backend authorization
* Database constraints
* Automated tests for important business rules

---

# Git Workflow

Recommended workflow:

```text
main
  │
  └── develop
        │
        ├── feature/authentication
        ├── feature/participant-profile
        ├── feature/projects
        ├── feature/applications
        └── feature/timesheets
```

Feature branches should be created for significant functionality.

Example:

```bash
git checkout -b feature/participant-profile
```

Commit changes:

```bash
git add .
git commit -m "Build participant profile"
```

Push:

```bash
git push origin feature/participant-profile
```

---

# Project Principles

## 1. Keep the Domain Model Clear

The following concepts must remain separate:

```text
User
Participant Profile
Application
Project Participant
```

---

## 2. Backend Is the Source of Truth

Frontend validation improves UX.

Backend validation enforces the actual business rules.

---

## 3. Security Must Be Server-Side

Never assume that hiding a button means a user cannot perform an action.

Every protected operation must be authorized on the backend.

---

## 4. Organisation Isolation Is Mandatory

Organisation users should only access resources they are authorized to access.

---

## 5. Build for Multiple Organisations

Avoid assumptions that the platform will only ever have one organisation.

---

## 6. Avoid Premature Complexity

Build the MVP around the core flow first:

```text
Participant
   ↓
Profile
   ↓
Project
   ↓
Application
   ↓
Acceptance
   ↓
Participation
   ↓
Timesheet
```

Advanced functionality should be added after this workflow is stable.

---

# Core MVP

The first complete usable version of AlphaForce ProjectLink should allow:

```text
Participant
    ↓
Register
    ↓
Verify Email
    ↓
Build Profile
    ↓
Discover Projects
    ↓
Apply
    ↓
Project Manager Reviews
    ↓
Accept
    ↓
Participant Joins Project
    ↓
Submit Timesheets
    ↓
Manager Approves Timesheets
    ↓
Project Completed
```

This is the core business workflow around which the rest of the platform is built.

---

# Brand

## Product Name

**AlphaForce ProjectLink**

## Tagline

**Connect. Participate. Make an Impact.**

## Brand Personality

* Professional
* Modern
* Human
* Trustworthy
* Sophisticated
* Collaborative
* Purpose-driven

## Primary Color

```text
Midnight Harbor
#1E2F44
```

## Secondary Colors

```text
Sunbaked Clay
#D08A52

Golden Amber
#C56A2E

Olive Moss
#6B6F3C

Burnt Sienna
#B4522A
```

Use the colors with hierarchy rather than treating every color as equally dominant.

Midnight Harbor should provide the main professional foundation while the warmer colors provide personality and visual emphasis.

---

# Project Status

**Status:** In Development

AlphaForce ProjectLink is being developed incrementally, beginning with authentication and participant onboarding before moving into projects, applications, project participation, timesheets, reporting, and administration.

---

## License

Add the appropriate project license here when the licensing decision has been made.

---

## Maintainers

AlphaForce ProjectLink development team.
