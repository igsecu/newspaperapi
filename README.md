# Newspaper Application API

### Technologies

Javascript - Nodejs - ExpressJs - Postgresql - Sequelize - PassportJs - Jest - Supertest - Cloudinary - Sendgrid - Redis - Paypal Payment and Subscription Integration

### Features

#### Users

<ul>
<li>Create users accounts </li>
<li>Authenticate with email and password</li>
<li>Create and Cancel subscription with Paypal</li>
<li>Get and filter articles - more readers - sections - writers</li>
<li>Create comments</li>
<li>Get, update and delete notifications</li>
</ul>

#### Writers

<ul>
<li>Authenticate with email and password</li>
<li>Upload and delete profile images using Cloudinary</li>
<li>Create articles</li>
<li>Upload articles photos - Cloudinary</li>
<li>Get own articles</li>
</ul>

#### Admin

<ul>
<li>Create admin accounts</li>
<li>Create writers accounts</li>
<li>Authenticate using Passport local strategy</li>
<li>Update articles - are shown - are for subscribers</li>
<li>Ban or not users accounts</li>
<li>Ban or not writers accounts</li>
<li>Create products in Paypal</li>
<li>Create plan products in Paypal</li>
<li>Get all sections</li>
<li>Get and filter writers</li>
<li>Get all, shown and for subscribers articles</li>
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
<li>Paypal Subscription Payment</li>
<li>Set and get routes response from Cache with Redis</li>
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

PAYPAL_CLIENT_ID =
PAYPAL_CLIENT_SECRET =
PAYPAL_API = https://api-m.sandbox.paypal.com -> for testing - development
PAYPAL_PRODUCT_ID =
PAYPAL_PLAN_ID =

URL="http://localhost:PORT" -> for development

</pre>
