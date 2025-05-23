import pyotp
from django.core.mail import EmailMessage

class Util:
    @staticmethod
    def send_email(data):
        email = EmailMessage(
            subject=data['email_subject'], body=data['email_body'], to=[data['to_email']])
        email.content_subtype = 'html' 
        email.send()


def generate_otp():
    secret = pyotp.random_base32() 
    totp = pyotp.TOTP(secret) 
    return totp.now()

