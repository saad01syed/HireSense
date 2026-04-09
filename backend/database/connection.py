"""
connection.py handles database connection.
"""

# TODO: MAKE A CREDENTIALS FILE 

import mysql.connector

def get_connection():
    return mysql.connector.connect(
        host="hiresense-hiresense.d.aivencloud.com",
        user="avnadmin",
        password="AVNS_YC_i98cQxKbtFFuGXUD",
        database="defaultdb",
        port=12619
    )
