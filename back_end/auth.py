# Implement your authentication logic here, e.g., checking credentials against a database
def authenticate(username, password):
    if users.get(username) == password:
        return True
    return False

def identity(payload):
    username = payload['identity']
    return {"username": username}
