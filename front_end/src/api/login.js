import { urls } from './urls';
import { BASE_URL } from './urls';
import { POST } from '../services/http';

export async function login(credentials) {
  const req = {
    url: `${BASE_URL}${urls.login}`,
    data: credentials,
  };
  const response = await POST(req);
  console.log(response)
  return response;
}