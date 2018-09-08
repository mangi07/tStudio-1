import requests
import sys

"""Gitea url on local server"""
base_url = '192.168.213.129:3000/'
username = 'first'
password = 'password'

# TODO: use a proxy server to wrap api calls and secure the proxy server 
# with dynamic attestation such as through the use of JWT...
# to allow a user to authenticate with username and password and only
# be able to make changes to his/her account
# https://www.approov.io/blog/hands-on-mobile-api-security-using-a-proxy-to-protect-api-keys.html

# (1) First we want to get the admin API key to create a user on his/her behalf.
#     In order to hide the API key, this can be done using a proxy server:
#     https://www.express-gateway.io/docs/core-concepts/#endpoints
#     https://www.express-gateway.io/getting-started-with-expression-policy/ esp. "Proxying API Keys"
# 
# (2) Once we have a user created, we can use BasicAuth for that user's subsequent requests 
#     sent directly to the Gitea API.

url = "https://" + username + ":" + password + "@" + base_url + "api/v1/users/"  
url_no_auth = "https://" + base_url + "api/v1/users/"  
https://yourusername:yourpassword@gitea.your.host/api/v1/users/yourusername/tokens
"""user to create"""
user_data = {
  "email": "user@example.com",
  "full_name": "first",
  "login_name": "firstuser",
  "password": "password",
  "send_notify": False,
  "source_id": 0,
  "username": "first"
}

def create_user(url, json):
	r = requests.post(url, json=json)
	print(f"Requests enconding: {r.encoding}\n")
	print(f"Response status code: {r.status_code}\n")
	print(f"Response text: {r.text}\n")
	# print(r.json)

	print("\n\n**********************************")
	print("Response headers (key ==> value):\n")
	for k, v in r.headers.items():
	    print(f"{k:30} ==> {v}\n")

create_user(
