import { google } from 'googleapis';
import dotenv from 'dotenv';
dotenv.config();

const scopes = ['https://www.googleapis.com/auth/business.manage'];

export function getAuthClient() {
  const { CLIENT_ID, CLIENT_SECRET, REFRESH_TOKEN } = process.env;
  const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, 'urn:ietf:wg:oauth:2.0:oob');
  oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });
  return oauth2Client;
}

export function businessInfoClient() {
  return google.mybusinessbusinessinformation({
    version: 'v1',
    auth: getAuthClient()
  });
}