import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

from django.shortcuts import render, redirect
from django.conf import settings
import mysql.connector
from .db_initializer import *
from django.views.decorators.csrf import csrf_exempt
from django.db import connection
from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.db.models import Q
import json



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

def all_members(request):
    print("All members view accessed")
    # Get database connection
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    # Get all unique companies for filter dropdown
    cursor.execute("SELECT DISTINCT company FROM members WHERE company IS NOT NULL AND company != ''")
    companies = [row['company'] for row in cursor.fetchall()]

    # Get all instructors for filter dropdown
    cursor.execute("SELECT id, name FROM instructors")
    instructors = cursor.fetchall()

    # Fetch all members with their instructor names
    cursor.execute("""
        SELECT 
            m.id, m.name, m.number, m.email, m.address, m.company,
            m.instructor_id, m.date_of_initiation, m.notes,
            i.name as instructor_name
        FROM 
            members m
        LEFT JOIN 
            instructors i ON m.instructor_id = i.id
        ORDER BY m.name
    """)
    members = cursor.fetchall()
    print("Members fetched:", members)

    # Format dates for display
    for member in members:
        if member['date_of_initiation']:
            member['date_of_initiation'] = member['date_of_initiation'].strftime('%Y-%m-%d')

    cursor.close()
    conn.close()

    context = {
        'companies': companies,
        'instructors': instructors,
        'members': members,  # This data will be displayed in the template
    }
    return render(request, 'all_members.html', context)

@require_http_methods(["GET", "DELETE"])
def api_member_detail(request, id):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    if request.method == "DELETE":
        try:
            cursor.execute("DELETE FROM members WHERE id = %s", (id,))
            conn.commit()
            affected_rows = cursor.rowcount
            cursor.close()
            conn.close()

            if affected_rows > 0:
                return JsonResponse({'success': True, 'message': 'Member deleted successfully'})
            else:
                return JsonResponse({'error': 'Member not found'}, status=404)

        except Exception as e:
            conn.rollback()
            cursor.close()
            conn.close()
            return JsonResponse({'error': str(e)}, status=500)

    # GET request
    cursor.execute("""
        SELECT
            m.id, m.name, m.number, m.email, m.address, m.company,
            m.instructor_id, m.date_of_initiation, m.notes,
            i.name as instructor_name
        FROM
            members m
        LEFT JOIN
            instructors i ON m.instructor_id = i.id
        WHERE
            m.id = %s
    """, (id,))

    member = cursor.fetchone()
    cursor.close()
    conn.close()

    if not member:
        return JsonResponse({'error': 'Member not found'}, status=404)

    # Convert date to string format for JSON serialization
    if member['date_of_initiation']:
        member['date_of_initiation'] = member['date_of_initiation'].isoformat()

    member_data = {
        'id': member['id'],
        'name': member['name'],
        'number': member['number'],
        'email': member['email'],
        'address': member['address'],
        'company': member['company'],
        'instructor_id': member['instructor_id'],
        'instructor_name': member['instructor_name'] if member['instructor_name'] else 'N/A',
        'date_of_initiation': member['date_of_initiation'],
        'notes': member['notes']
    }

    return JsonResponse(member_data)

def api_members(request):
    print("API members view accessed")
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("""
        SELECT
            m.id, m.name, m.number, m.email, m.address, m.company,
            m.instructor_id, m.date_of_initiation, m.notes,
            i.name as instructor_name
        FROM
            members m
        LEFT JOIN
            instructors i ON m.instructor_id = i.id
    """)

    members = cursor.fetchall()
    cursor.close()
    conn.close()

    # Convert to list of dictionaries for JSON response
    members_list = []
    for member in members:
        # Convert date to string format for JSON serialization
        if member['date_of_initiation']:
            member['date_of_initiation'] = member['date_of_initiation'].isoformat()

        members_list.append({
            'id': member['id'],
            'name': member['name'],
            'number': member['number'],
            'email': member['email'],
            'address': member['address'],
            'company': member['company'],
            'instructor_id': member['instructor_id'],
            'instructor_name': member['instructor_name'] if member['instructor_name'] else 'N/A',
            'date_of_initiation': member['date_of_initiation'],
            'notes': member['notes']
        })

    return JsonResponse(members_list, safe=False)

def all_instructors(request):
    print("All instructors view accessed")
    success_message = request.session.pop('success_message', None)

    # Get database connection
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    # Get all instructors with count of members they teach
    cursor.execute("""
        SELECT
            i.id, i.name, i.age, i.dop, i.associated_since,
            i.updeshta_since, i.address,
            COUNT(m.id) as member_count
        FROM
            instructors i
        LEFT JOIN
            members m ON i.id = m.instructor_id
        GROUP BY
            i.id
        ORDER BY
            i.name
    """)
    instructors = cursor.fetchall()
    print(f"Instructors fetched: {len(instructors)}")

    # Format dates for display
    for instructor in instructors:
        if instructor['dop']:
            instructor['dop'] = instructor['dop'].strftime('%Y-%m-%d')

        # Get associated_since and updeshta_since years as strings
        instructor['associated_since'] = str(instructor['associated_since']) if instructor['associated_since'] else 'N/A'
        instructor['updeshta_since'] = str(instructor['updeshta_since']) if instructor['updeshta_since'] else 'N/A'

    # Get distinct years for filters
    cursor.execute("SELECT DISTINCT associated_since FROM instructors WHERE associated_since IS NOT NULL ORDER BY associated_since DESC")
    associated_years = [str(row['associated_since']) for row in cursor.fetchall()]

    cursor.execute("SELECT DISTINCT updeshta_since FROM instructors WHERE updeshta_since IS NOT NULL ORDER BY updeshta_since DESC")
    updeshta_years = [str(row['updeshta_since']) for row in cursor.fetchall()]

    # Generate range of years from 1900 to current year
    import datetime
    current_year = datetime.datetime.now().year
    range_years = list(range(current_year, 1899, -1))

    cursor.close()
    conn.close()

    context = {
        'instructors': instructors,
        'associated_years': associated_years,
        'updeshta_years': updeshta_years,
        'range_years': range_years,
        'success_message': success_message
    }
    return render(request, 'all_instructors.html', context)

def register_user(request):
    if request.method == 'POST':
        # Generate years from 1900 to current year
        import datetime
        current_year = datetime.datetime.now().year
        range_years = list(range(current_year, 1899, -1))

        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            # Handle AJAX submission
            try:
                # Get form data
                name = request.POST.get('name')
                username = request.POST.get('username')
                email = request.POST.get('email')
                age = request.POST.get('age')
                dob = request.POST.get('dob')
                associated_since = request.POST.get('associated_since')
                updeshta_since = request.POST.get('updeshta_since')
                address = request.POST.get('address')
                reason = request.POST.get('reason')
                gmail_user = 'sant.vihangam@gmail.com'
                gmail_app_password = 'pdsexaeusfdgvqsu'
                # Send email to admin
                from django.core.mail import send_mail

                subject = f"New User Registration Request: {name}"
                message = f"""
                New user registration request details:
                
                Name: {name}
                Username: {username}
                Email: {email}
                Age: {age}
                Date of Birth: {dob}
                Associated Since: {associated_since}
                Updeshta Since: {updeshta_since}
                Address: {address}
                
                Reason for Registration:
                {reason}
                """
                msg = MIMEText(message)
                msg['Subject'] = subject
                msg['From'] = "sant.vihangam@gmail.com"
                msg['To'] = "sant.vihangam@gmail.com"

                # Send email via Gmail SMTP
                server = smtplib.SMTP('smtp.gmail.com', 587)
                server.starttls()
                server.login(gmail_user, gmail_app_password)
                server.sendmail("sant.vihangam@gmail.com", "sant.vihangam@gmail.com", msg.as_string())
                server.quit()

                return JsonResponse({'success': True})
            except Exception as e:
                return JsonResponse({'success': False, 'message': str(e)})
        else:
            # Handle regular form submission (fallback)
            # Process form and send email
            # Redirect to success page
            return render(request, 'register_user.html', {'success': True, 'range_years': range_years})
    else:
        # Generate years from 1900 to current year
        import datetime
        current_year = datetime.datetime.now().year
        range_years = list(range(current_year, 1899, -1))

        return render(request, 'register_user.html', {'range_years': range_years})
