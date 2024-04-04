# Newspaper Application API

### Technologies

Javascript - Nodejs - ExpressJs - Postgresql - Sequelize - PassportJs - Jest - Supertest - Cloudinary - Sendgrid - Redis

### Features

#### Users

<ul>
<li>Create users accounts </li>
<li>Authenticate with email and password</li>
</ul>

#### Writers

<ul>
<li>Authenticate with email and password</li>
<li>Upload and delete profile images using Cloudinary</li>
<li>Authenticate with email and password</li>
<li>Create articles</li>
<li>Upload articles photos - Cloudinary</li>
</ul>

#### Admin

<ul>
<li>Create admin accounts</li>
<li>Create writers accounts</li>
<li>Authenticate using Passport local strategy</li>
<li>Update articles - are shown - are for subscribers</li>
<li>Ban or not users accounts</li>
<li>Ban or not writers accounts</li>
</ul>

#### More

<ul>
<li>Session management with Redis</li>
<li>Use of Express Sessions</li>
<li>Use of Express FileUpload</li>
<li>Send emails using Sendgrid</li>
<li>Verify accounts using emails</li>
<li>Authorized routes for users, writers admins</li>
<li>Tests using Jest and Supertest</li>
</ul>

#### .env file

<li>Create in the root of the project a .env file in order to use it, and complete this env variables</li>
<br>
<pre>
DB_USER =
DB_PASSWORD =
DB_HOST =
DB_PORT =

DB_NAME =

SESSION_SECRET =

CLOUDINARY_CLOUD_NAME =
CLOUDINARY_API_KEY =
CLOUDINARY_API_SECRET =

GOOGLE_CLIENT_ID =
GOOGLE_CLIENT_SECRET =

GITHUB_CLIENT_ID =
GITHUB_CLIENT_SECRET =

SENDGRID_API_KEY =
SENDGRID_SENDER =

URL="http://localhost:PORT" -> for development

</pre>
