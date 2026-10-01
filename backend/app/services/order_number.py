import random


def generate_order_number() -> str:
    return f"ZEST-{random.randint(10000, 99999)}"
