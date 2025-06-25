from django.shortcuts import render, redirect
from django.conf import settings
import mysql.connector
from .db_initializer import *
from django.views.decorators.csrf import csrf_exempt
from django.db import connection


def get_db_connection():
    return mysql.connector.connect(
        host=settings.DB_HOST,
        user=settings.DB_USER,
        password=settings.DB_PASSWORD,
        database=settings.DB_NAME
    )

def login_view(request):
    print("Login view accessed")
    error = None
    db_initializer = DBInitializer(settings.DB_HOST, settings.DB_USER, settings.DB_PASSWORD, settings.DB_NAME)
    db_initializer.initialize()
    print("request method:", request.method)
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')
        #check if login is admin ,skip database authentication
        print("username logging :", username," password logging", password)
        if username == 'admin' and password == 'admin':
            request.session['user_id'] = 1  # Assuming admin user ID is 1
            request.session['username'] = 'admin'
            print("Admin logged in")
            return redirect('home')  # Replace with your dashboard URL name
        else:
            conn = get_db_connection()
            cur = conn.cursor()
            cur.execute("SELECT id FROM users WHERE username=%s AND password=%s", (username, password))
            user = cur.fetchone()
            cur.close()
            conn.close()
            if user:
                request.session['user_id'] = user[0]
                print("User logged in:", username)
                # Optionally, you can set user details in the session
                request.session['username'] = username

                #initlaize database if not already done

                print("Database initialized or already exists.")
                # Redirect to the dashboard or home page
                # Make sure to replace 'dashboard' with your actual dashboard URL name
                # For example, if you have a URL pattern named 'dashboard', you can use:
                # return redirect('dashboard')
                # If you don't have a dashboard, you can redirect to another page
                # For example, if you have a home page URL pattern named 'home', you can
                return redirect('home')  # Replace with your dashboard URL name
            else:
                error = "Invalid username or password."
    return render(request, 'login.html', {'error': error})

def home(request):
    print("Home view accessed")
    instructors = get_instructors()
    message = request.session.pop('message', None)
    return render(request, 'home.html', {'message': message,'instructors': instructors})

@csrf_exempt
def register_member(request):
    if request.method == 'POST':
        name = request.POST.get('name', '').strip()
        number = request.POST.get('number', '').strip()
        email = request.POST.get('email', '').strip()
        address = request.POST.get('address', '').strip()
        company = request.POST.get('company', '').strip()
        feedback = request.POST.get('feedback', '').strip()
        instructor_id = request.POST.get('instructor', '').strip()
        date_of_initiation = request.POST.get('date_of_initiation', '').strip()

        if name and number and instructor_id and date_of_initiation:
            conn = mysql.connector.connect(
                host=settings.DB_HOST,
                user=settings.DB_USER,
                password=settings.DB_PASSWORD,
                database=settings.DB_NAME
            )
            cur = conn.cursor()
            cur.execute("""
                INSERT INTO members
                (name, number, email, address, company, notes, instructor_id, date_of_initiation)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            """, (
                name, number, email, address, company, feedback, instructor_id, date_of_initiation
            ))
            conn.commit()
            cur.close()
            conn.close()
            request.session['message'] = 'Member registered successfully!'
        else:
            request.session['message'] = 'All required fields must be filled.'
    return redirect('home')


def get_instructors():
    conn = mysql.connector.connect(
        host=settings.DB_HOST,
        user=settings.DB_USER,
        password=settings.DB_PASSWORD,
        database=settings.DB_NAME
    )
    cur = conn.cursor(dictionary=True)
    cur.execute("SELECT id, name FROM instructors")
    instructors = cur.fetchall()
    cur.close()
    conn.close()
    return instructors


def add_instructor(request):
    message = None
    if request.method == 'POST':
        name = request.POST.get('name', '').strip()
        age = request.POST.get('age')
        dop = request.POST.get('dop')
        associated_since = request.POST.get('associated_since')
        updeshta_since = request.POST.get('updeshta_since')
        address = request.POST.get('address', '').strip()
        if name:
            conn = mysql.connector.connect(
                host=settings.DB_HOST,
                user=settings.DB_USER,
                password=settings.DB_PASSWORD,
                database=settings.DB_NAME
            )
            cur = conn.cursor()
            cur.execute("""
                INSERT INTO instructors (name, age, dop, associated_since, updeshta_since, address)
                VALUES (%s, %s, %s, %s, %s, %s)
            """, (name, age or None, dop or None, associated_since or None, updeshta_since or None, address or None))
            conn.commit()
            cur.close()
            conn.close()
            message = "Instructor added successfully!"
        else:
            message = "Name is required."
    return render(request, 'add_instructor.html', {'message': message})
