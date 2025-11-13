import re

class User:
    def __init__(self, email, password, name, confirm_password):
        self.name = name
        self.email = email
        self.password = password
        self.confirm_password = confirm_password

    def is_empty(self, name, email, password, confirm_password):
        return any(arg == '' or arg is None for arg in [name, email, password, confirm_password])
    
    def login_fields_empty(self, email=None, password=None):
        return any(arg == '' or arg is None for arg in [email, password])

    def username_is_string(self, name):
        return bool(name) and not name.isdigit()

    def passwords_match(self, password, confirm_password):
        if password is None or confirm_password is None:
            return False
        return str(password).strip() == str(confirm_password).strip()

    def is_valid_password(self, password):
        pattern = r'^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$'
        return re.match(pattern, password) is not None

    def is_valid_email(self, email):
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return re.match(pattern, email) is not None



