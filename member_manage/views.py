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
from django.http import JsonResponse, HttpResponse
from django.views.decorators.http import require_http_methods
from django.db.models import Q
import json
import openpyxl
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import render
import os
import csv
import io
from datetime import datetime, timedelta



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
        country= request.POST.get('country', '').strip()
        state = request.POST.get('state', '').strip()
        district = request.POST.get('district', '').strip()
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
                (name, number, email, address, country, state,district,company, notes, instructor_id, date_of_initiation)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s,%s, %s, %s)
            """, (
                name, number, email, address, country, state,district,company, feedback, instructor_id, date_of_initiation
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
        is_active = request.POST.get('is_active', '1')  # Default to active
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
            m.id, m.name, m.number, m.email, m.address, m.country, m.state, m.district,m.company,
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
            i.updeshta_since, i.address,i.is_active,
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


def dictfetchall(cursor):
    """Convert database cursor results to a list of dictionaries"""
    columns = [col[0] for col in cursor.description]
    return [dict(zip(columns, row)) for row in cursor.fetchall()]

def instructor_infographics(request):
    """View for instructor performance infographics page"""
    # Get database connection
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    print("Instructor infographics view accessed")

    # Safe function to convert MySQL results to integers
    def safe_int(value, default=0):
        try:
            if value is None:
                return default
            return int(value)
        except (ValueError, TypeError):
            return default

    # Get all active instructors
    cursor.execute("SELECT * FROM instructors WHERE is_active = 1 ORDER BY name")
    instructors = cursor.fetchall()  # Using direct fetchall since cursor is dictionary=True

    # Get oldest initiation date
    cursor.execute("SELECT MIN(date_of_initiation) as oldest_date FROM members")
    oldest_date_result = cursor.fetchall()

    # Set start year based on oldest member
    if oldest_date_result and oldest_date_result[0].get('oldest_date'):
        oldest_date_val = oldest_date_result[0]['oldest_date']
        # Fix the isinstance check for date objects
        # Import datetime correctly at the top of your file
        from datetime import datetime, date, timedelta

        # Then in your instructor_infographics function, replace the problematic line with:
        if isinstance(oldest_date_val, (datetime, date)):
            start_year = oldest_date_val.year
        elif isinstance(oldest_date_val, str):
            try:
                start_year = datetime.strptime(oldest_date_val, '%Y-%m-%d').year
            except ValueError:
                start_year = datetime.now().year - 5
        else:
            start_year = datetime.now().year - 5
    else:
        start_year = datetime.now().year - 5

    current_year = datetime.now().year
    years_range = range(start_year, current_year + 1)

    # Get total members count
    cursor.execute("SELECT COUNT(*) as total FROM members")
    total_members_result = cursor.fetchall()
    total_members = safe_int(total_members_result[0].get('total')) if total_members_result else 0

    # Get active instructors count
    cursor.execute("SELECT COUNT(*) as total FROM instructors WHERE is_active = 1")
    instructors_result = cursor.fetchall()
    instructors_count = safe_int(instructors_result[0].get('total')) if instructors_result else 0

    # Calculate average members per instructor
    avg_members_per_instructor = round(total_members / instructors_count, 1) if instructors_count > 0 else 0

    # Get current year members
    cursor.execute(
        "SELECT COUNT(*) as count FROM members WHERE YEAR(date_of_initiation) = %s",
        [current_year]
    )
    current_year_result = cursor.fetchall()
    current_year_members = safe_int(current_year_result[0].get('count')) if current_year_result else 0

    # Get previous year members
    cursor.execute(
        "SELECT COUNT(*) as count FROM members WHERE YEAR(date_of_initiation) = %s",
        [current_year-1]
    )
    previous_year_result = cursor.fetchall()
    previous_year_members = safe_int(previous_year_result[0].get('count')) if previous_year_result else 0

    # Calculate growth rate
    if previous_year_members > 0:
        growth_rate = round(((current_year_members - previous_year_members) / previous_year_members * 100), 1)
    else:
        growth_rate = 0

    # Close database connection
    cursor.close()
    conn.close()

    context = {
        'instructors': instructors,
        'years_range': years_range,
        'total_members': total_members,
        'instructors_count': instructors_count,
        'avg_members_per_instructor': avg_members_per_instructor,
        'growth_rate': growth_rate
    }

    return render(request, 'instructor_infographics.html', context)

def api_instructor_infographics_data(request):
    """API endpoint for instructor infographics chart data"""
    # Get filter parameters
    instructor_id = request.GET.get('instructor_id', 'all')
    time_range = request.GET.get('time_range', 'all')
    year = request.GET.get('year', 'all')

    # Apply filters to member query
    member_filter_params = []
    member_filter_sql = ""

    if instructor_id != 'all':
        member_filter_sql += " AND m.instructor_id = %s"
        member_filter_params.append(instructor_id)

    # Apply time range filter
    current_date = datetime.now()
    if time_range == 'year':
        start_date = datetime(current_date.year, 1, 1)
        member_filter_sql += " AND m.date_of_initiation >= %s"
        member_filter_params.append(start_date)
    elif time_range == 'quarter':
        start_date = current_date - timedelta(days=90)
        member_filter_sql += " AND m.date_of_initiation >= %s"
        member_filter_params.append(start_date)
    elif time_range == 'month':
        start_date = current_date - timedelta(days=30)
        member_filter_sql += " AND m.date_of_initiation >= %s"
        member_filter_params.append(start_date)

    if year != 'all':
        member_filter_sql += " AND YEAR(m.date_of_initiation) = %s"
        member_filter_params.append(year)

    # Get database connection
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        # Get active instructors
        cursor.execute("SELECT id, name FROM instructors WHERE is_active = 1")
        instructors = cursor.fetchall()

        # Prepare data for Members by Instructor chart
        members_by_instructor_labels = []
        members_by_instructor_data = []

        for instructor in instructors:
            query = """
                SELECT COUNT(*) as member_count 
                FROM members m
                WHERE m.instructor_id = %s
            """ + member_filter_sql

            params = [instructor['id']] + member_filter_params
            cursor.execute(query, params)
            result = cursor.fetchone()
            if result and result['member_count'] > 0:
                members_by_instructor_labels.append(instructor['name'])
                members_by_instructor_data.append(result['member_count'])

        # Prepare data for Member Growth Over Time chart
        growth_labels = []
        growth_data = []

        if time_range == 'month':
            # For month view, group by day
            for i in range(30):
                day = current_date - timedelta(days=i)
                next_day = day + timedelta(days=1)

                query = """
                    SELECT COUNT(*) as count 
                    FROM members m
                    WHERE m.date_of_initiation >= %s 
                    AND m.date_of_initiation < %s
                """ + member_filter_sql

                params = [day.replace(hour=0, minute=0, second=0),
                          next_day.replace(hour=0, minute=0, second=0)] + member_filter_params

                cursor.execute(query, params)
                result = cursor.fetchone()
                count = result['count'] if result else 0
                growth_labels.insert(0, day.strftime('%b %d'))
                growth_data.insert(0, count)
        else:
            # Default view by month for the last 12 months
            for i in range(48):
                month_start = (current_date.replace(day=1) - timedelta(days=i * 30))
                next_month = (month_start.replace(day=28) + timedelta(days=4)).replace(day=1)

                query = """
                    SELECT COUNT(*) as count 
                    FROM members m
                    WHERE m.date_of_initiation >= %s 
                    AND m.date_of_initiation < %s
                """ + member_filter_sql

                params = [month_start, next_month] + member_filter_params

                cursor.execute(query, params)
                result = cursor.fetchone()
                count = result['count'] if result else 0
                growth_labels.insert(0, month_start.strftime('%b %Y'))
                growth_data.insert(0, count)

        # Prepare data for Geographic Distribution chart
        # Prepare data for Geographic Distribution chart
        if instructor_id != 'all':
            # City-wise distribution for selected instructor
            query = """
                SELECT district as location, COUNT(*) as count 
                FROM members m
                WHERE district IS NOT NULL AND district != ''
            """ + member_filter_sql + """
                GROUP BY district 
                ORDER BY count DESC
                LIMIT 8
            """
        else:
            # Country-wise distribution for all instructors
            query = """
                SELECT country as location, COUNT(*) as count 
                FROM members m
                WHERE country IS NOT NULL AND country != ''
            """ + member_filter_sql + """
                GROUP BY country 
                ORDER BY count DESC
                LIMIT 8
            """

        cursor.execute(query, member_filter_params)
        geo_distribution = cursor.fetchall()

        geo_labels = []
        geo_data = []

        for entry in geo_distribution:
            if entry.get('location'):
                geo_labels.append(entry.get('location'))
                geo_data.append(entry.get('count'))

        # If no locations found, add placeholder
        if not geo_labels:
            geo_labels = ['No Data']
            geo_data = [0]

        # Prepare data for Instructor Comparison chart
        # Get top 5 instructors by member count
        top_instructors_data = []

        for instructor in instructors:
            query = """
                SELECT COUNT(*) as member_count 
                FROM members m
                WHERE m.instructor_id = %s
            """ + member_filter_sql

            params = [instructor['id']] + member_filter_params
            cursor.execute(query, params)
            result = cursor.fetchone()
            member_count = result['member_count'] if result else 0

            if member_count > 0:
                top_instructors_data.append({
                    'id': instructor['id'],
                    'name': instructor['name'],
                    'member_count': member_count
                })

        # Sort and limit to top 5
        top_instructors_data = sorted(top_instructors_data,
                                      key=lambda x: x['member_count'],
                                      reverse=True)[:5]

        comparison_datasets = []
        colors = [
            'rgba(79, 140, 255, 0.7)',
            'rgba(110, 214, 255, 0.7)',
            'rgba(255, 159, 64, 0.7)',
            'rgba(75, 192, 192, 0.7)',
            'rgba(255, 99, 132, 0.7)'
        ]

        for i, instructor in enumerate(top_instructors_data):
            # Get additional data about instructor
            cursor.execute("SELECT * FROM instructors WHERE id = %s", [instructor['id']])
            instructor_details = cursor.fetchone()

            # Calculate metrics (scaled 0-100 for radar chart)
            member_count_score = min(100, instructor['member_count'] * 5)  # Assuming 20 members = 100%

            # Years of experience score (max 10 years = 100%)
            associated_since = instructor_details.get('associated_since') if instructor_details else None
            experience_years = (datetime.now().year - associated_since) if associated_since else 0
            experience_score = min(100, experience_years * 10)

            # Other metrics are placeholders - would need more data in real app
            growth_rate = 60 + i * 5
            retention_rate = 75 - i * 3
            activity_score = 70 + i * 4

            comparison_datasets.append({
                'label': instructor['name'],
                'data': [member_count_score, growth_rate, retention_rate, activity_score, experience_score],
                'backgroundColor': colors[i % len(colors)],
                'borderColor': colors[i % len(colors)].replace('0.7', '1'),
                'pointBackgroundColor': colors[i % len(colors)].replace('0.7', '1'),
                'pointBorderColor': '#fff',
                'pointHoverBackgroundColor': '#fff',
                'pointHoverBorderColor': colors[i % len(colors)].replace('0.7', '1')
            })

        # Calculate summary metrics
        query = "SELECT COUNT(*) as total FROM members m WHERE 1=1" + member_filter_sql
        cursor.execute(query, member_filter_params)
        total_members = cursor.fetchone()['total']

        query = "SELECT COUNT(*) as total FROM instructors WHERE is_active = 1"
        cursor.execute(query)
        active_instructors = cursor.fetchone()['total']

        avg_members_per_instructor = round(total_members / active_instructors, 1) if active_instructors > 0 else 0

        # Calculate growth rate
        current_year = datetime.now().year

        cursor.execute(
            "SELECT COUNT(*) as count FROM members m WHERE YEAR(m.date_of_initiation) = %s" + member_filter_sql,
            [current_year] + member_filter_params
        )
        current_year_members = cursor.fetchone()['count']

        cursor.execute(
            "SELECT COUNT(*) as count FROM members m WHERE YEAR(m.date_of_initiation) = %s" + member_filter_sql,
            [current_year - 1] + member_filter_params
        )
        previous_year_members = cursor.fetchone()['count']

        growth_rate = round(((current_year_members - previous_year_members) / max(1, previous_year_members) * 100), 1)

        # Prepare response data
        response_data = {
            'membersByInstructor': {
                'labels': members_by_instructor_labels,
                'data': members_by_instructor_data
            },
            'memberGrowth': {
                'labels': growth_labels,
                'data': growth_data
            },
            'geoDistribution': {
                'labels': geo_labels,
                'data': geo_data
            },
            'instructorComparison': {
                'datasets': comparison_datasets
            },
            'summary': {
                'totalMembers': total_members,
                'activeInstructors': active_instructors,
                'avgMembersPerInstructor': avg_members_per_instructor,
                'growthRate': growth_rate
            }
        }

        return JsonResponse(response_data)

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
    finally:
        cursor.close()
        conn.close()

def api_instructor_details(request, instructor_id):
    from datetime import datetime
    """API endpoint for detailed information about a specific instructor"""
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    print("API instructor details view accessed")
    try:
        # Get instructor details
        cursor.execute("SELECT * FROM instructors WHERE id = %s", [instructor_id])
        instructor = cursor.fetchone()

        if not instructor:
            return JsonResponse({'error': 'Instructor not found'}, status=404)

        # Count total members for this instructor
        cursor.execute(
            "SELECT COUNT(*) as total FROM members WHERE instructor_id = %s",
            [instructor_id]
        )
        total_members = cursor.fetchone()['total']

        # Calculate growth rate (members joined this year vs last year)
        current_year = datetime.now().year
        cursor.execute(
            "SELECT COUNT(*) as count FROM members WHERE instructor_id = %s AND YEAR(date_of_initiation) = %s",
            [instructor_id, current_year]
        )
        current_year_members = cursor.fetchone()['count']

        cursor.execute(
            "SELECT COUNT(*) as count FROM members WHERE instructor_id = %s AND YEAR(date_of_initiation) = %s",
            [instructor_id, current_year - 1]
        )
        previous_year_members = cursor.fetchone()['count']

        if previous_year_members > 0:
            growth_rate = round(((current_year_members - previous_year_members) / previous_year_members) * 100, 1)
        else:
            growth_rate = 0

        # Calculate retention rate (placeholder logic)
        cursor.execute(
            "SELECT COUNT(*) as count FROM members WHERE instructor_id = %s AND date_of_initiation <= %s",
            [instructor_id, f"{current_year-1}-12-31"]
        )
        retained_members = cursor.fetchone()['count']
        retention_rate = round((retained_members / total_members) * 100, 1) if total_members > 0 else 0

        # Member growth trend (last 12 months)
        trend_labels = []
        trend_data = []
        for i in range(12):
            month = (datetime.now().replace(day=1) - timedelta(days=i*30))
            next_month = (month.replace(day=28) + timedelta(days=4)).replace(day=1)
            cursor.execute(
                "SELECT COUNT(*) as count FROM members WHERE instructor_id = %s AND date_of_initiation >= %s AND date_of_initiation < %s",
                [instructor_id, month, next_month]
            )
            count = cursor.fetchone()['count']
            trend_labels.insert(0, month.strftime('%b %Y'))
            trend_data.insert(0, count)

        data = {
            'id': instructor['id'],
            'name': instructor['name'],
            'associated_since': str(instructor['associated_since']) if instructor['associated_since'] else 'N/A',
            'total_members': total_members,
            'growth_rate': growth_rate,
            'retention_rate': retention_rate,
            'trend': {
                'labels': trend_labels,
                'data': trend_data
            }
        }
        return JsonResponse(data)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
    finally:
        cursor.close()
        conn.close()

def api_download_instructor_report(request):
    """API endpoint to download instructor report as CSV"""
    # Get filter parameters
    instructor_id = request.GET.get('instructor_id', 'all')
    time_range = request.GET.get('time_range', 'all')
    year = request.GET.get('year', 'all')

    # Apply filters to member query
    member_filter_params = []
    member_filter_sql = ""

    if instructor_id != 'all':
        member_filter_sql += " AND instructor_id = %s"
        member_filter_params.append(instructor_id)

    # Apply time range filter
    current_date = datetime.now()
    if time_range == 'year':
        start_date = datetime(current_date.year, 1, 1)
        member_filter_sql += " AND date_of_initiation >= %s"
        member_filter_params.append(start_date)
    elif time_range == 'quarter':
        start_date = current_date - timedelta(days=90)
        member_filter_sql += " AND date_of_initiation >= %s"
        member_filter_params.append(start_date)
    elif time_range == 'month':
        start_date = current_date - timedelta(days=30)
        member_filter_sql += " AND date_of_initiation >= %s"
        member_filter_params.append(start_date)

    if year != 'all':
        member_filter_sql += " AND YEAR(date_of_initiation) = %s"
        member_filter_params.append(year)

    # Create CSV file
    buffer = io.StringIO()
    writer = csv.writer(buffer)

    # Write header row
    writer.writerow(['Instructor Name', 'Total Members', 'New Members This Year', 'Countries', 'States'])

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        # Get data for all instructors or the selected one
        if instructor_id != 'all':
            cursor.execute("SELECT * FROM instructors WHERE is_active = 1 AND id = %s", [instructor_id])
        else:
            cursor.execute("SELECT * FROM instructors WHERE is_active = 1")

        instructors = cursor.fetchall()

        for instructor in instructors:
            # Get total members for this instructor
            cursor.execute(
                "SELECT COUNT(*) as total FROM members WHERE instructor_id = %s" + member_filter_sql,
                [instructor['id']] + member_filter_params
            )
            total_members = cursor.fetchone()['total']

            # Get new members this year
            cursor.execute(
                """
                SELECT COUNT(*) as count 
                FROM members 
                WHERE instructor_id = %s AND YEAR(date_of_initiation) = %s
                """ + member_filter_sql,
                [instructor['id'], current_date.year] + member_filter_params
            )
            new_members_this_year = cursor.fetchone()['count']

            # Get top countries
            cursor.execute(
                """
                SELECT country, COUNT(*) as count 
                FROM members 
                WHERE instructor_id = %s AND country IS NOT NULL AND country != ''
                """ + member_filter_sql + """
                GROUP BY country 
                ORDER BY count DESC 
                LIMIT 3
                """,
                [instructor['id']] + member_filter_params
            )
            countries = cursor.fetchall()
            countries_str = ", ".join([f"{c['country']} ({c['count']})" for c in countries if c['country']])

            # Get top states
            cursor.execute(
                """
                SELECT state, COUNT(*) as count 
                FROM members 
                WHERE instructor_id = %s AND state IS NOT NULL AND state != ''
                """ + member_filter_sql + """
                GROUP BY state 
                ORDER BY count DESC 
                LIMIT 3
                """,
                [instructor['id']] + member_filter_params
            )
            states = cursor.fetchall()
            states_str = ", ".join([f"{s['state']} ({s['count']})" for s in states if s['state']])

            # Write data row
            writer.writerow([
                instructor['name'],
                total_members,
                new_members_this_year,
                countries_str,
                states_str
            ])

    finally:
        cursor.close()
        conn.close()

    # Prepare the CSV file for download
    buffer.seek(0)
    response = HttpResponse(buffer.getvalue(), content_type='text/csv')
    response['Content-Disposition'] = f'attachment; filename=instructor_report_{datetime.now().strftime("%Y%m%d")}.csv'

    return response



@csrf_exempt
def upload_members(request):
    if request.method == 'GET':
        return render(request, 'upload_members.html')
    if request.method == 'POST' and request.FILES.get('file'):
        file = request.FILES['file']
        try:
            wb = openpyxl.load_workbook(file)
            ws = wb.active
            headers = [cell.value for cell in next(ws.iter_rows(min_row=1, max_row=1))]
            required = ['name', 'number', 'instructor_id', 'date_of_initiation']
            db_columns = ['name', 'number', 'email', 'address', 'state', 'district', 'country', 'company', 'notes', 'instructor_id', 'date_of_initiation']
            # Validate columns
            if not all(col in headers for col in required):
                return JsonResponse({'success': False, 'message': 'Missing required columns in Excel file.'})
            # Prepare data rows
            rows = []
            for row in ws.iter_rows(min_row=2, values_only=True):
                row_dict = dict(zip(headers, row))
                if not all(row_dict.get(col) for col in required):
                    continue  # skip incomplete rows
                rows.append([row_dict.get(col, None) for col in db_columns])
            if not rows:
                return JsonResponse({'success': False, 'message': 'No valid rows to import.'})
            # Insert into DB
            import mysql.connector
            from django.conf import settings
            conn = mysql.connector.connect(
                host=settings.DB_HOST,
                user=settings.DB_USER,
                password=settings.DB_PASSWORD,
                database=settings.DB_NAME
            )
            cur = conn.cursor()
            sql = f"""INSERT INTO members
                (name, number, email, address, state, district, country, company, notes, instructor_id, date_of_initiation)
                VALUES ({','.join(['%s']*11)})"""
            cur.executemany(sql, rows)
            conn.commit()
            cur.close()
            conn.close()
            return JsonResponse({'success': True, 'message': f'Successfully imported {len(rows)} members.'})
        except Exception as e:
            return JsonResponse({'success': False, 'message': f'Error: {str(e)}'})
    return JsonResponse({'success': False, 'message': 'Invalid request.'})