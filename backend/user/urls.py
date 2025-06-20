from django.urls import path
from . import views

urlpatterns =[
    path('register/', views.register_view, name = 'register'),
    path('user-ver/', views.userverification, name = 'verication'),
    path("update-profile/", views.update_profile, name="update-profile"),
    path('login-page/', views.login_view, name='login-page'),
    
    path ("update_password/", views.forgot_password, name="forgot_password"),
    path ("otp_updatepassword/", views.otp_forgetpassword, name="otp_forgotpassword"),
    path ("password_verify/", views.verify_passwordotp, name="otp_forgotpassword"),
        #check status
    path('api/status/', views.server_status, name='status_check'),
    
]