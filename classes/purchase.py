from datetime import datetime

class Purchase:
    def __init__(self, name, amount, date):
        self.name = name
        self.amount = amount
        self.date = date

    def is_empty(*args):
        return any(arg == '' or arg is None for arg in args)

    def name_is_string(self):
        return not self.name.isdigit()

    def amount_positive(self):
        try:
            return float(self.amount) > 0
        except (ValueError, TypeError):
            return False

    def date_is_valid(self):
        try:
            date_obj = datetime.strptime(self.date, "%Y-%m-%d")
            return date_obj <= datetime.today()
        except (ValueError, TypeError):
            return False

    def to_dict(self):
        return {
            "name": self.name,
            "amount": float(self.amount),
            "date": self.date
        }
