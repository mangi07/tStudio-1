import requests
import sys

"""Gitea url on local server"""
base_url = 'http://192.168.213.129:3000/'

"""Gitia API key"""
key_file = open("token.txt", "r")
api_key = key_file.readline().rstrip('\n')
key_file.close()

# headers = {"Authorization":"token 52de34ad4d27ea40de09a72c56ce317e6c325153"}
auth_header = {"Authorization":"token " + api_key}

"""API routes tested"""
create_url = base_url + "api/v1/admin/users"
delete_url = base_url + "api/v1/admin/users/"

def create_user(url, json, headers):
	r = requests.post(url, json=json, headers=headers)
	print(f"Requests enconding: {r.encoding}\n")
	print(f"Response status code: {r.status_code}\n")
	print(f"Response text: {r.text}\n")
	# print(r.json)

	print("\n\n**********************************")
	print("Response headers (key ==> value):\n")
	for k, v in r.headers.items():
	    print(f"{k:30} ==> {v}\n")


print("/n/n##############################################")
print("TEST CREATE FIRST USER")

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
create_user(create_url, user_data, auth_header)


print("/n/n##############################################")
print("TEST CREATE SECOND USER")

"""user to create"""
user_data = {
  "email": "user2@example.com",
  "full_name": "second",
  "login_name": "seconduser",
  "password": "password",
  "send_notify": False,
  "source_id": 0,
  "username": "second"
}
create_user(create_url, user_data, auth_header)


print("/n/n##############################################")
print("TEST DELETE FIRST USER")

delete_url += "first"
print("delete_url: ", delete_url)
r = requests.delete(delete_url, headers=auth_header)
print(f"Response status code: {r.status_code}\n")
print("Expected status code 204.")


print("/n/n##############################################")
print("TEST CREATE REPO FOR SECOND USER")
# TODO: This test fails with server response code 500
# Try: /admin/users/{username}/repos

create_repo_url = base_url + "api/v1/users/second/repos/"
user_data = {
	"auto_init": True,
	"description": "string",
	"gitignores": "string",
	"license": "string",
	"name": "string",
	"private": True,
	"readme": "string"
}
r = requests.post(create_repo_url, json=user_data, headers=auth_header)
print(f"Response status code: {r.status_code}\n")
print("Expected status code 204.")


#	If this works, inform of this issue when submitting pull request for user and git functionality in app
# TODO: Try managing repo creation and deletion through the API

# TODO: Try using regular git cli to push and pull a user's repo

# TODO: If we find out a user can delete another user's account, try modifiying Gitea to disallow one non-admin deleting another user's account:
#	Trace how the route to delete a user calls model/user.go deleteUser (line: 904 ?) and maybe add a check to only allow deletion if the requesting user is an admin
#	...or wrap api calls with a proxy server and hide the api key - let the proxy server generate an api key for that particular user during account set up


